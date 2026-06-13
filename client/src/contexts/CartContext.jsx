import React, { useContext, useState, useEffect } from "react";
import { auth, onAuthStateChanged } from "../firebase/firebase.js";
import { X } from "lucide-react";
import RippleButton from "../components/RippleButton.jsx";
import CartDrawer from "../components/CartDrawer.jsx";

// Create a context for the cart
const CartContext = React.createContext();

// Custom hook to use CartContext
export const useCart = () => useContext(CartContext);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOutOfStock, setIsOutOfStock] = useState(false); //State for controlling the out of stock modal
  const [openCartDrawer, setOpenCartDrawer] = useState(false); //State for controlling cart drawer visibility

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
          `${import.meta.env.VITE_API_URL}/api/cart/details/${uid}`,
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
          },
        );

        const result = await res.json();
        if (!res.ok || !result.success) {
          if (result.message === "Out of stock") {
            setIsOutOfStock(true); // Show out-of-stock dialog
          }
          console.error("AddToCart error:", result.message);
        } else if (result.cart) {
          setCart(result.cart); // Refresh cart from server
          setOpenCartDrawer(true); //Show cart drawer
        }
      } catch (err) {
        console.error("API error:", err);
      }
    } else {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${productId}`,
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
                : item,
            ),
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
          },
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
              : item,
          )
          .filter((item) => item.quantity > 0),
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
          },
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
  async function placeOrder(
    userId = null,
    total,
    shipping,
    billing,
    payingOption,
  ) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cart/place-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: userId,
            total,
            shipping,
            billing,
            payingOption,
          }),
        },
      );

      const result = await res.json();
      if (res.ok && result.success) {
        if (!userId) localStorage.removeItem("cart");
        setCart([]);
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

  //Close cart drawer
  const handleCartDrawerClose = () => setOpenCartDrawer(false);


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

      {/* Backdrop */}
      <div
        onClick={closeModal}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur transition-opacity duration-400 ease-in-out ${
          isOutOfStock
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full sm:max-w-lg max-w-[90%] max-h-[90vh] overflow-y-auto rounded-xl bg-white text-slate-500 shadow-2xl transition-all duration-400 ease-in-out ${
            isOutOfStock
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="p-6">
            <RippleButton
              onClick={closeModal}
              className="absolute! top-2 right-2 z-10 text-teal-800"
              variant="icon"
            >
              <X />
            </RippleButton>
            <h2 className="text-xl font-bold text-center">Stoc Limitat</h2>
            <p className="text-center my-4">
              Ai atins limita stocului disponibil.
            </p>
          </div>
        </div>
      </div>

       {/* Cart modal */}
      <CartDrawer
        open={openCartDrawer}
        onClose={handleCartDrawerClose}
        cart={cart}
      />
    </>
  );
}
