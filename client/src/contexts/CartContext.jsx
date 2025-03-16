import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../../../firebase/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { X } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { Dialog, DialogBody, IconButton } from "@material-tailwind/react";

// Create a context for the cart
const CartContext = React.createContext();

// Custom hook to use CartContext
export const useCart = () => useContext(CartContext);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!auth.currentUser) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, load the cart from Firestore
        const userDocRef = doc(db, "users", user.uid);

        // Set up real-time listener for the cart
        const unsubscribeUserCart = onSnapshot(userDocRef, async (userDoc) => {
          const cartData = await Promise.all(
            (userDoc.data().cart || []).map(async (cartItem) => {
              const productDocRef =
                typeof cartItem.productRef === "string"
                  ? doc(db, cartItem.productRef)
                  : cartItem.productRef;

              const productDoc = await getDoc(productDocRef);
              return {
                product: { id: productDoc.id, ...productDoc.data() },
                quantity: cartItem.quantity,
              };
            })
          );
          setCart(cartData);
        });

        // Clean up the subscription on component unmount
        return () => unsubscribeUserCart();
      } else {
        // User is signed out, load the cart from localStorage
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        } else {
          setCart([]);
        }
      }
    });

    // Clean up the subscription on component unmount
    return () => unsubscribeAuth();
  }, []);

  // Add an item to the cart
  async function addToCart(productId) {
    const userId = auth.currentUser?.uid;

    if (userId) {
      // User is logged in, use Firestore
      const userDocRef = doc(db, "users", userId);
      const productDocRef = doc(db, "products", productId);
      const productDocSnap = await getDoc(productDocRef);
      const currentQuantity = productDocSnap.data().quantity;

      if (currentQuantity === 0) {
        setIsOutOfStock(true); // Show the modal if out of stock
        return;
      }

      const existingItem = cart.find((item) => item.product.id === productId);

      if (existingItem) {
        await updateCartItemQuantity(existingItem.product.id, 1);
      } else {
        await addNewCartItem(userDocRef, productId);
        await updateDoc(productDocRef, { quantity: currentQuantity - 1 });
      }
    } else {
      // User is not logged in, use localStorage
      const productDocRef = doc(db, "products", productId);
      const productDocSnap = await getDoc(productDocRef);
      const productData = productDocSnap.data();

      if (productData.quantity === 0) {
        setIsOutOfStock(true); // Show the modal if out of stock
        return;
      }

      const existingItem = cart.find((item) => item.product.id === productId);

      if (existingItem) {
        const updatedCart = cart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        setCart(updatedCart);
      } else {
        const newItem = {
          product: { id: productDocSnap.id, ...productData },
          quantity: 1,
        };
        setCart([...cart, newItem]);
      }
    }
  }

  // Add a new item to the cart array in the user document (Firestore)
  async function addNewCartItem(userDocRef, productId) {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(userDocRef, {
        cart: arrayUnion({
          productRef: productRef,
          quantity: 1,
        }),
      });
    } catch (error) {
      console.error("Error adding new cart item to Firestore:", error);
    }
  }

  // Update the quantity of an existing cart item
  async function updateCartItemQuantity(productId, change) {
    const userId = auth.currentUser?.uid;

    if (userId) {
      // User is logged in, use Firestore
      const userDocRef = doc(db, "users", userId);
      const productDocRef = doc(db, "products", productId);
      const productDocSnap = await getDoc(productDocRef);
      const currentQuantity = productDocSnap.data().quantity;

      if (change > 0 && currentQuantity === 0) {
        setIsOutOfStock(true); // Show the modal if out of stock
        return;
      }

      try {
        const updatedCart = cart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + change }
            : item
        );

        await updateDoc(userDocRef, {
          cart: updatedCart.map((item) => ({
            productRef: `/products/${item.product.id}`,
            quantity: item.quantity,
          })),
        });

        await updateDoc(productDocRef, { quantity: currentQuantity - change });

        setCart(updatedCart);
      } catch (error) {
        console.error("Error updating cart item quantity in Firestore:", error);
      }
    } else {
      // User is not logged in, use localStorage
      const updatedCart = cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0); // Remove item if quantity is 0

      setCart(updatedCart);
    }
  }

  // Remove an item from the cart
  async function removeFromCart(productId) {
    const userId = auth.currentUser?.uid;

    if (userId) {
      // User is logged in, use Firestore
      const userDocRef = doc(db, "users", userId);
      const productDocRef = doc(db, "products", productId);

      try {
        // Increase product quantity in the products collection
        const productDocSnap = await getDoc(productDocRef);
        const currentQuantity = productDocSnap.data().quantity;

        await updateDoc(productDocRef, { quantity: currentQuantity + 1 });

        // Remove item from user's cart in Firestore
        const updatedCart = cart.filter(
          (item) => item.product.id !== productId
        );
        setCart(updatedCart);

        await updateDoc(userDocRef, {
          cart: updatedCart.map((item) => ({
            productRef: `/products/${item.product.id}`,
            quantity: item.quantity,
          })),
        });
      } catch (error) {
        console.error("Error removing item from cart in Firestore:", error);
      }
    } else {
      // User is not logged in, use localStorage
      const updatedCart = cart.filter((item) => item.product.id !== productId);
      setCart(updatedCart);
    }
  }

  const closeModal = () => {
    setIsOutOfStock(false);
  };

  // Save order with product references
  async function placeOrder(cart, total, userId = null) {
    try {
      const orderData = {
        user: doc(db, "users", userId), // Store reference to user
        items: cart.map((item) => ({
          productRef: doc(db, "products", item.product.id), // Store reference to product
          quantity: item.quantity,
        })),
        total: total,
        status: "În procesare", // Default status
        createdAt: serverTimestamp(),
      };

      // Save in Firestore
      const docRef = await addDoc(collection(db, "orders"), orderData);
      console.log("Order saved successfully:", docRef.id);

      // Empty the cart
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, { cart: [] });
      } else {
        localStorage.removeItem("cart");
      }
    } catch (error) {
      console.error("Error in order:", error);
    }
  }

  return (
    <>
      <CartContext.Provider
        value={{
          cart,
          addToCart,
          updateCartItemQuantity,
          removeFromCart,
          placeOrder,
        }}
      >
        {children}
      </CartContext.Provider>

      <Dialog open={isOutOfStock}>
        <DialogBody>
          <IconButton
            onClick={closeModal}
            variant="text"
            className="!absolute top-2 right-2 text-teal-800"
          >
            <X />
          </IconButton>
          <h2 className="text-xl font-bold mb-4 text-center">Stoc Epuizat</h2>
          <p className="text-center mb-4">
            Produsul nu este disponibil în acest moment.
          </p>
        </DialogBody>
      </Dialog>
    </>
  );
}
