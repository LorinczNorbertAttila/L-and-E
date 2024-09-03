import React, { useContext, useState, useEffect } from 'react'
import { db } from '../../../firebase/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

// Create a context for products
const ProductContext = React.createContext()

// Custom hook to use ProductContext
export const useProduct = () => useContext(ProductContext)

export default function ProductProvider({children}) {
    const [products, setProducts] = useState([])

    useEffect(() => {
        // Reference to the products collection
        const coll = collection(db, 'products')

        // Subscribe to real-time updates with onSnapshot
        const unsubscribe = onSnapshot(coll, (snapshot) => {
            const productList = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(product => product.quantity > 0) // Filter out products with no stock
            setProducts(productList)
        }, (error) => {
            console.error("Error fetching real-time updates: ", error)
        })

        // Clean up the subscription on component unmount
        return () => unsubscribe()
    }, [])

    return (
        <ProductContext.Provider value={{ products }}>
            {children}
        </ProductContext.Provider>
    )
}
