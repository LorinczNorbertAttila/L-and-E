import React, { useContext, useState, useEffect } from 'react'
import { auth, db, provider } from '../../../firebase/firebase'
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import { collection, addDoc } from "firebase/firestore"; 

// Create a context for authentication
const AuthContext = React.createContext()

// Custom hook to use the AuthContext
export function useAuth(){
    return useContext(AuthContext)
}

// Provider component to wrap the application and provide authentication context
export default function AuthProvider({ children }) {
  // State to keep track of the current user and loading status
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  // Create new user
  async function createUser(email, name, lname){
    const docRef = await addDoc(collection(db, "users"), {
      email: email,
      first: name,
      last: lname,
    });
    return docRef
  }

  // Sign up a new user with email and password
  function signup(email, password){
    return createUserWithEmailAndPassword(auth, email, password)
  }

  // Login with email and password
  function login(email, password){
    return signInWithEmailAndPassword(auth, email, password)
  }

  //Login with Google authentication
  function google_login(){
    return signInWithPopup(auth, provider)
  }

  // Send password reset email
  function resetPassword(email){
    return sendPasswordResetEmail(auth, email)
  }

  // Logout
  function logout() {
    return signOut(auth)
  }

  // Effect hook to subscribe to authentication state changes
  useEffect(() => {
    const unsubscriber = auth.onAuthStateChanged(user => {
        setCurrentUser(user)
        setLoading(false) // Set loading to false when user state is determined
    })
    // Clean up subscription on component unmount
    return unsubscriber
  }, [])
  
  // Value to be provided to the context consumers
  const value = {
    currentUser, signup, createUser, login, google_login, resetPassword, logout
  }  

  // Render the context provider with children
  return (
    <AuthContext.Provider value={value}>
        {!loading && children} {/* Render children only if loading is complete */}
    </AuthContext.Provider>
  )
}  
