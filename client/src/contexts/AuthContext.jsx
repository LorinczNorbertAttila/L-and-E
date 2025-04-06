import React, { useContext, useState, useEffect } from "react";
import { auth, db, provider } from "../../../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

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

  // Create new user in Firestore
  async function createUser(uid, email, name, lname) {
    const userDocRef = doc(db, "users", uid);
    return setDoc(userDocRef, {
      email,
      name: lname + " " + name,
      createdAt: new Date(),
      img: "",
      tel: "",
      address: "",
    });
  }

  // Merge cart items from localStorage with Firestore
  async function mergeCartWithFirestore(uid) {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const cart = JSON.parse(savedCart).map((item) => ({
        productRef: doc(db, "products", item.product.id),
        quantity: item.quantity,
      }));
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      const existingCart = userDoc.data().cart || [];
      const mergedCart = [...existingCart, ...cart];
      await updateDoc(userDocRef, { cart: mergedCart });
      localStorage.removeItem("cart");
    }
  }

  // Sign up a new user and create Firestore document
  async function signup(email, password, name, lname) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;
    await createUser(uid, email, name, lname);
    await mergeCartWithFirestore(uid); // Move cart from localStorage to Firestore
    return userCredential;
  }

  // Login with email and password
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;
    await mergeCartWithFirestore(uid); // Merge cart items from localStorage with Firestore
    // Fetch user data from Firestore and store it in currentUser
    const userDoc = await getDoc(doc(db, "users", uid));
    setCurrentUser({ ...userCredential.user, ...userDoc.data() });
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
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    // If user doesn't exist, create a new user in Firestore
    if (!userDoc.exists()) {
      setDoc(userDocRef, {
        email,
        name: displayName,
        createdAt: new Date(),
        img: photoURL,
        tel: "",
        address: "",
      });
    }
    await mergeCartWithFirestore(uid); // Merge cart items from localStorage with Firestore
    // Fetch the updated Firestore data and set it to currentUser
    const updatedUserDoc = await getDoc(userDocRef);
    setCurrentUser({ ...userCredential.user, ...updatedUserDoc.data() });
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
    const allowedCollections = ["users", "products"]; //Allowed collections
    const allowedFields = ["tel", "address", "cart"]; //Allowed fields
    if (!allowedCollections.includes(collectionName) || !allowedFields.includes(fieldName)) {
      throw new Error("Unauthorized field or collection update");
    }
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, { [fieldName]: value });
  }

  // Subscribe to authentication state changes
  useEffect(() => {
    const unsubscriber = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const cachedUser = localStorage.getItem("currentUser");
        if (cachedUser && JSON.parse(cachedUser).uid === user.uid) {
          setCurrentUser(JSON.parse(cachedUser));
        } else {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = { ...user, ...userDoc.data() };
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
