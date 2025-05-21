import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../../firebase/firebase";
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await refreshCart();
      } else {
        const savedCart = localStorage.getItem("cart");
        setCart(savedCart ? JSON.parse(savedCart) : []);
      }
    });

    // Clean up the subscription on component unmount
    return () => unsubscribeAuth();
  }, []);

  // Refresh cart from the server
  async function refreshCart() {
    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/cart/details/${uid}`
        );
        const result = await res.json();
        if (res.ok && result.success) {
          setCart(result.cart);
        } else {
          setCart([]);
        }
      } catch (err) {
        console.error("Cart sync error:", err);
      }
    }
  }

  // Add an item to the cart
  async function addToCart(productId) {
    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/cart/add`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, productId }),
          }
        );

        const result = await res.json();
        if (!res.ok || !result.success) {
          if (result.message === "Out of stock") {
            setIsOutOfStock(true); // Show out-of-stock dialog
          }
          console.error("AddToCart error:", result.message);
        } else if (result.cart) {
          setCart(result.cart); // Refresh cart from server
        }
      } catch (err) {
        console.error("API error:", err);
      }
    } else {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${productId}`
        );
        const json = await res.json();
        const productData = json.data;
        const existing = cart.find((item) => item.product.id === productId);
        const currentQuantity = existing?.quantity || 0;
        if (productData.quantity <= currentQuantity) {
          return setIsOutOfStock(true);
        }
        if (existing) {
          setCart(
            cart.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
        } else {
          setCart([
            ...cart,
            { product: { id: productId, ...productData }, quantity: 1 },
          ]);
        }
      } catch (err) {
        console.error("Offline addToCart error:", err);
      }
    }
  }

  // Update the quantity of an existing cart item
  async function updateCartItemQuantity(productId, change) {
    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/cart/update-quantity`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, productId, change }),
          }
        );

        const result = await res.json();
        if (!res.ok || !result.success) {
          if (result.message === "Out of stock") {
            setIsOutOfStock(true); // Show out-of-stock dialog
          }
          console.error("UpdateCart error:", result.message);
        } else if (result.cart) {
          setCart(result.cart); // Refresh cart from server
        }
      } catch (err) {
        console.error("API error:", err);
      }
    } else {
      const existing = cart.find((item) => item.product.id === productId);
      if (!existing) return;
      const newQuantity = existing.quantity + change;
      if (change > 0 && newQuantity > existing.product.quantity) {
        return setIsOutOfStock(true);
      }
      setCart((prev) =>
        prev
          .map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + change }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    }
  }

  // Remove an item from the cart
  async function removeFromCart(productId) {
    const uid = auth.currentUser?.uid;

    if (uid) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/cart/remove`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, productId }),
          }
        );

        const result = await res.json();
        if (!res.ok || !result.success) {
          console.error("Remove error:", result.message);
        } else if (result.cart) {
          setCart(result.cart); // Refresh cart from server
        }
      } catch (err) {
        console.error("API error:", err);
      }
    } else {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    }
  }

  // Save order
  async function placeOrder(userId = null, total) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cart/place-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: userId, total }),
        }
      );

      const result = await res.json();
      if (res.ok && result.success) {
        if (!userId) localStorage.removeItem("cart");
        setCart([]);
        console.log("Order placed:", result.orderId);
      } else if (result.cart) {
        setCart(result.cart); // Refresh cart from server
      } else {
        console.error("Order error:", result.message);
      }
    } catch (err) {
      console.error("Order API error:", err);
    }
  }

  // Close the out-of-stock modal
  const closeModal = () => setIsOutOfStock(false);

  return (
    <>
      <CartContext.Provider
        value={{
          cart,
          addToCart,
          updateCartItemQuantity,
          removeFromCart,
          placeOrder,
          refreshCart,
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
