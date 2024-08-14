import React, { useContext, useState, useEffect } from 'react'
import { auth, db, provider } from '../../../firebase/firebase'
import {createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut} from 'firebase/auth'
import { collection, addDoc } from "firebase/firestore"; 

const AuthContext = React.createContext()

export function useAuth(){
    return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  async function createUser(email, name, lname){
    const docRef = await addDoc(collection(db, "users"), {
      email: email,
      first: name,
      last: lname,
    });
    return docRef
  }

  function signup(email, password){
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function login(email, password){
    return signInWithEmailAndPassword(auth, email, password)
  }

  function google_login(){
    return signInWithPopup(auth, provider)
  }

  function resetPassword(email){
    return sendPasswordResetEmail(auth, email)
  }

  function logout() {
    return signOut()
  }

  useEffect(() => {
    const unsubscriber = auth.onAuthStateChanged(user => {
        setCurrentUser(user)
        setLoading(false)
        
    })
    return unsubscriber
  }, [])
  

  const value = {
    currentUser, signup, createUser, login, google_login, resetPassword, logout
  }  

  return (
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
  )
}
