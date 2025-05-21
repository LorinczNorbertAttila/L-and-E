import React, { useContext, useState, useEffect } from "react";
import { auth, provider } from "../../../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useCart } from "../contexts/CartContext";

// Create a context for authentication
const AuthContext = React.createContext();

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component to wrap the application and provide authentication context
export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();

  // Create new user in Firestore
  async function createUser(uid, email, name, lname, photoURL) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email, name, lname, photoURL }),
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error("User creation failed");
    }
  }

  // Merge cart items from localStorage with Firestore
  async function mergeCartWithFirestore(uid) {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) return;

    const localCart = JSON.parse(savedCart);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/merge-cart`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, localCart }),
      }
    );
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || "Failed to merge cart");
    }

    localStorage.removeItem("cart");
  }

  //Post login initialization
  async function postLoginInit(userCredential) {
    const uid = userCredential.user.uid;
    await mergeCartWithFirestore(uid); // Merge cart items from localStorage with Firestore
    await refreshCart(); // Refresh cart context
    // Fetch user data from Firestore and store it in currentUser
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/profile/${uid}`
    );
    const result = await res.json();
    setCurrentUser({ ...userCredential.user, ...result.data });
  }

  // Sign up a new user and create Firestore document
  async function signup(email, password, name, lname) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
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
      password
    );
    await postLoginInit(userCredential); // Initialize user data after login
    return userCredential;
  }

  // Google login
  async function google_login() {
    // Sign in with Google
    const userCredential = await signInWithPopup(auth, provider);
    const uid = userCredential.user.uid;
    const email = userCredential.user.email;
    const displayName = userCredential.user.displayName;
    const photoURL = userCredential.user.photoURL;
    // Check if user already exists in Firestore
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/exists/${uid}`
    );
    const result = await res.json();
    // If user doesn't exist, create a new user in Firestore
    if (!!result.exists) {
      await createUser(uid, email, displayName, "", photoURL);
    }
    await postLoginInit(userCredential); // Initialize user data after login
    return userCredential;
  }

  //Password reset
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Logout
  function logout() {
    setCurrentUser(null);
    return signOut(auth);
  }

  // setField function that finds a document by id and updates a specific field (only if it's allowed) with the given value
  async function setField(collectionName, id, fieldName, value) {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/set-field`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: collectionName,
          id,
          field: fieldName,
          value,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update field");
    }
  }

  // Subscribe to authentication state changes
  useEffect(() => {
    const unsubscriber = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const cachedUser = localStorage.getItem("currentUser");
        if (cachedUser && JSON.parse(cachedUser).uid === user.uid) {
          setCurrentUser(JSON.parse(cachedUser));
        } else {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/user/profile/${user.uid}`
          );
          const result = await res.json();
          const userData = { ...user, ...result.data };
          setCurrentUser(userData);
          localStorage.setItem("currentUser", JSON.stringify(userData));
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
      }
      setLoading(false);
    });
    return unsubscriber;
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
    signup,
    login,
    google_login,
    logout,
    resetPassword,
    setField,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
