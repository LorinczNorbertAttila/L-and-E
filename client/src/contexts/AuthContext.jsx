import React, { useContext, useState, useEffect, useMemo } from "react";
import {
  auth,
  googleProvider,
  facebookProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  FacebookAuthProvider,
} from "../firebase/firebase.js";
import { useCart } from "../contexts/CartContext";

// Create a context for authentication
const AuthContext = React.createContext();

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// Helper function to get Firebase ID token
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  return await user.getIdToken();
}

// Helper function to make authenticated API calls
async function fetchWithAuth(url, options = {}) {
  const token = await getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}

// Provider component to wrap the application and provide authentication context
export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { refreshCart } = useCart();

  // Create new user in Firestore
  async function createUser(uid, email, name, lname, photoURL) {
    const token = await getAuthToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ uid, email, name, lname, photoURL }),
    });
    const result = await res.json();
    if (!res.ok || !result.success) throw new Error("User creation failed");
  }

  useEffect(() => {
    const checkAdmin = async () => {
      if (!firebaseUser) {
        setIsAdmin(false);
        return;
      }
      try {
        const token = await firebaseUser.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      } catch (e) {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [firebaseUser]);

  // Merge cart items from localStorage with Firestore
  async function mergeCartWithFirestore(uid) {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) return;
    const localCart = JSON.parse(savedCart);

    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/user/merge-cart`,
      {
        method: "POST",
        body: JSON.stringify({ uid, localCart }),
      },
    );
    const result = await res.json();

    if (!res.ok || !result.success)
      throw new Error(result.message || "Failed to merge cart");

    localStorage.removeItem("cart");
  }

  // Fetch user's favorite products from Firestore
  async function getFavorites(uid) {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/user/favorites?uid=${uid}`,
      );
      const data = await res.json();
      if (res.ok && data.success) setFavorites(data.favorites);
    } catch (error) {
      console.error("Error fetching favorites", error);
    }
  }

  // Fetch user's orders from Firestore
  async function getOrders(uid) {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/user/orders?uid=${uid}`,
      );
      const data = await res.json();
      if (res.ok && data.success) setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  }

  //Post login initialization
  async function postLoginInit(userCredential) {
    const uid = userCredential.user.uid;
    await mergeCartWithFirestore(uid); // Merge cart items from localStorage with Firestore
    await refreshCart(); // Refresh cart context
    // Fetch user data from Firestore and store it in currentUser
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/user/profile/${uid}`,
    );
    const result = await res.json();
    const userData = { ...userCredential.user, ...result.data };
    if (!res.ok || !result.success) {
      throw new Error("Failed to fetch profile");
    }
    setCurrentUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    await getFavorites(uid); // Fetch favorites after login
    await getOrders(uid); // Fetch orders after login
  }

  // Sign up a new user and create Firestore document
  async function signup(email, password, name, lname) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const uid = userCredential.user.uid;
    await createUser(uid, email, name, lname, "");
    await postLoginInit(userCredential); // Initialize user data after signup
    return userCredential;
  }

  // Login with email and password
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await postLoginInit(userCredential); // Initialize user data after login
    return userCredential;
  }

  // Google login
  async function google_login() {
    // Sign in with Google
    const userCredential = await signInWithPopup(auth, googleProvider);
    const uid = userCredential.user.uid;
    const email = userCredential.user.email;
    const displayName = userCredential.user.displayName;
    const photoURL = userCredential.user.photoURL;
    // Check if user already exists in Firestore
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/exists/${uid}`,
    );
    const result = await res.json();
    // If user doesn't exist, create a new user in Firestore
    if (!result.exists) {
      await createUser(uid, email, displayName, "", photoURL);
    }
    await postLoginInit(userCredential); // Initialize user data after login
    return userCredential;
  }

  //Helper function to fetch Facebook profile picture using Graph API
  async function fetchFacebookPicture(accessToken) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/facebook/profile?accessToken=${accessToken}`,
      );

      const data = await res.json();
      return data?.picture?.data?.url || null;
    } catch (error) {
      console.error("Graph API error:", error);
      return null;
    }
  }

  // Facebook login
  async function facebook_login() {
    // Sign in with Facebook
    const userCredential = await signInWithPopup(auth, facebookProvider);
    const uid = userCredential.user.uid;
    const email = userCredential.user.email;
    const displayName = userCredential.user.displayName;
    const credential =
      FacebookAuthProvider.credentialFromResult(userCredential);
    const accessToken = credential.accessToken;
    const photoURL = await fetchFacebookPicture(accessToken);
    // Check if user already exists in Firestore
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/exists/${uid}`,
    );
    const result = await res.json();
    // If user doesn't exist, create a new user in Firestore
    if (!result.exists) {
      await createUser(uid, email, displayName, "", photoURL);
    }
    await postLoginInit(userCredential); // Initialize user data after login
    return userCredential;
  }

  //Password reset
  async function sendResetPasswordEmail(email) {
    return sendPasswordResetEmail(auth, email);
  }
  async function verifyResetCode(oobCode) {
    return await verifyPasswordResetCode(auth, oobCode);
  }
  async function resetPassword(oobCode, newPassword) {
    return await confirmPasswordReset(auth, oobCode, newPassword);
  }

  // Logout
  function logout() {
    setCurrentUser(null);
    setFirebaseUser(null);
    setFavorites([]);
    setOrders([]);
    return signOut(auth);
  }

  // setField function that finds a document by id and updates a specific field (only if it's allowed) with the given value
  async function setField(collectionName, id, fields) {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_URL}/api/user/update-fields`,
      {
        method: "PATCH",
        body: JSON.stringify({
          collection: collectionName,
          id,
          fields,
        }),
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update fields");
    }

    return await res.json();
  }

  //Add products from user's favorites
  async function addToFavorites(productId) {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/user/add-to-favorites`,
        {
          method: "POST",
          body: JSON.stringify({
            uid: currentUser.uid,
            productId,
          }),
        },
      );
      const data = await res.json();
      if (res.ok && data.success) setFavorites(data.favorites);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error adding to favorites",
      };
    }
  }

  //Remove products from user's favorites
  async function removeFromFavorites(productId) {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/user/remove-from-favorites`,
        {
          method: "POST",
          body: JSON.stringify({
            uid: currentUser.uid,
            productId,
          }),
        },
      );
      const data = await res.json();
      if (res.ok && data.success) setFavorites(data.favorites);

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error removing from favorites",
      };
    }
  }

  // Subscribe to authentication state changes
  useEffect(() => {
    const unsubscriber = auth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const cachedUser = JSON.parse(localStorage.getItem("currentUser"));
          if (cachedUser?.uid === user.uid) {
            setCurrentUser(cachedUser);
            await getFavorites(cachedUser.uid); // Fetch favorites with cached user UID
            await getOrders(cachedUser.uid); // Fetch orders with cached user UID
          } else {
            const res = await fetchWithAuth(
              `${import.meta.env.VITE_API_URL}/api/user/profile/${user.uid}`,
            );
            const result = await res.json();
            const userData = { ...user, ...result.data };
            setCurrentUser(userData);
            localStorage.setItem("currentUser", JSON.stringify(userData));
            await getFavorites(userData.uid); // Fetch favorites with user UID
            await getOrders(userData.uid); // Fetch orders with user UID
          }
        } catch (error) {
          console.error("Error handling cached user", error);
          localStorage.removeItem("currentUser");
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
      }
      setLoading(false);
    });
    return unsubscriber;
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      isAdmin,
      firebaseUser,
      signup,
      login,
      google_login,
      facebook_login,
      logout,
      sendResetPasswordEmail,
      verifyResetCode,
      resetPassword,
      setField,
      favorites,
      getFavorites,
      addToFavorites,
      removeFromFavorites,
      orders,
    }),
    [currentUser, firebaseUser, favorites, orders],
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
