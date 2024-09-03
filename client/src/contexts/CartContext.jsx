import React, { useContext, useState, useEffect } from 'react'
import { auth, db } from '../../../firebase/firebase'
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc } from "firebase/firestore"
import { X } from 'lucide-react'

// Create a context for the cart
const CartContext = React.createContext()

// Custom hook to use CartContext
export const useCart = () => useContext(CartContext)

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isOutOfStock, setIsOutOfStock] = useState(false)

  // Add an item to the cart
  async function addToCart(productId) {
    const userId = auth.currentUser?.uid 
    if (!userId) return

    const userDocRef = doc(db, 'users', userId)
    const productDocRef = doc(db, 'products', productId)
    const productDocSnap = await getDoc(productDocRef)
    const currentQuantity = productDocSnap.data().quantity

    if (currentQuantity === 0) {
      setIsOutOfStock(true) // Show the modal if out of stock
      return
    }

    const existingItem = cart.find((item) => item.product.id === productId)

    if (existingItem) {
      await updateCartItemQuantity(existingItem.product.id, 1)
    } else {
      await addNewCartItem(userDocRef, productId)
      await updateDoc(productDocRef, { quantity: currentQuantity - 1 })
    }
  }

  // Add a new item to the cart array in the user document
  async function addNewCartItem(userDocRef, productId) {
    try {
      const productRef = doc(db, 'products', productId)
      await updateDoc(userDocRef, {
        cart: arrayUnion({
          productRef: productRef,
          quantity: 1,
        }),
      })
    } catch (error) {
      console.error("Error adding new cart item to Firestore:", error)
    }
  }

  // Update the quantity of an existing cart item in the cart array
  async function updateCartItemQuantity(productId, change) {
    const userId = auth.currentUser?.uid 
    if (!userId) return
    const userDocRef = doc(db, 'users', userId)

    const productDocRef = doc(db, 'products', productId)
    const productDocSnap = await getDoc(productDocRef)
    const currentQuantity = productDocSnap.data().quantity

    if (change > 0 && currentQuantity === 0) {
      setIsOutOfStock(true) // Show the modal if out of stock
      return
    }

    try {
      const updatedCart = cart.map(item => 
        item.product.id === productId
          ? { ...item, quantity: item.quantity + change }
          : item
      )

      await updateDoc(userDocRef, {
        cart: updatedCart.map(item => ({
          productRef: `/products/${item.product.id}`,
          quantity: item.quantity,
        })),
      })

      await updateDoc(productDocRef, { quantity: currentQuantity - change })

      setCart(updatedCart)
    } catch (error) {
      console.error("Error updating cart item quantity in Firestore:", error)
    }
  }

  // Remove an item from the cart in Firestore
  async function removeFromCart(productId) {
    const userId = auth.currentUser?.uid
    if (!userId) return
  
    const userDocRef = doc(db, 'users', userId)
    const productDocRef = doc(db, 'products', productId)
  
    try {
      // Increase product quantity in the products collection
      const productDocSnap = await getDoc(productDocRef)
      const currentQuantity = productDocSnap.data().quantity
  
      await updateDoc(productDocRef, { quantity: currentQuantity + 1 })
  
      // Remove item from user's cart in Firestore
      const updatedCart = cart.filter(item => item.product.id !== productId) // Filter out the product to be removed
      setCart(updatedCart) // Update local cart state immediately
  
      await updateDoc(userDocRef, {
        cart: updatedCart.map(item => ({
          productRef: `/products/${item.product.id}`,
          quantity: item.quantity,
        })),
      })
    } catch (error) {
      console.error("Error removing item from cart in Firestore:", error)
    }
  }  

  // Listen for real-time updates to the user's cart
  useEffect(() => {
    const userId = auth.currentUser?.uid 
    if (!userId) return

    const userDocRef = doc(db, 'users', userId)

    // Set up real-time listener for the cart
    const unsubscribeUserCart = onSnapshot(userDocRef, async (userDoc) => {
      const cartData = await Promise.all(
        (userDoc.data().cart || []).map(async (cartItem) => {
          const productDocRef = typeof cartItem.productRef === 'string'
            ? doc(db, cartItem.productRef)
            : cartItem.productRef

          const productDoc = await getDoc(productDocRef)
          return {
            product: { id: productDoc.id, ...productDoc.data() },
            quantity: cartItem.quantity,
          }
        })
      )
      setCart(cartData)
    })

    // Clean up the subscription on component unmount
    return () => unsubscribeUserCart()
  }, [])

  const closeModal = () => {
    setIsOutOfStock(false)
  }

  return (
    <>
      <CartContext.Provider value={{ cart, addToCart, updateCartItemQuantity, removeFromCart}}>
        {children}
      </CartContext.Provider>
      {isOutOfStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative bg-white p-6 rounded-md shadow-lg max-w-md w-full">
            <button onClick={closeModal} className="absolute top-2 right-2 text-teal-800"><X/></button>
            <h2 className="text-xl font-bold mb-4 text-center">Stoc Epuizat</h2>
            <p className="text-center mb-4">Produsul nu este disponibil în acest moment.</p>
          </div>
        </div>
      )}
    </>
  )
}
