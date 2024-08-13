import React, { useContext, useState, useEffect } from 'react'
import { auth, db } from '../../../firebase/firebase'
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth'
import { collection, addDoc } from "firebase/firestore"; 

const AuthContext = React.createContext()

export function useAuth(){
    return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  async function  signup(email, password, name, lname){
    const docRef = await addDoc(collection(db, "users"), {
      email: email,
      first: name,
      last: lname,
    });
    let create =  createUserWithEmailAndPassword(auth, email, password)
    return create && docRef
  }

  function login(email, password){
    return signInWithEmailAndPassword(auth, email, password)
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
    currentUser, signup, login, logout
  }  

  return (
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
  )
}
