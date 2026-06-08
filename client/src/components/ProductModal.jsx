import React, { useState, useMemo, useEffect } from "react";
import { X, Heart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCategory } from "../contexts/CategoryContext";
import { useAuth } from "../contexts/AuthContext";
import { useProduct } from "../contexts/ProductContext";
import RippleButton from "./RippleButton";

export default function ProductModal({ open, onClose, product }) {
  const { categories } = useCategory();
  const { addToCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites, isAdmin } = useAuth();
  const { deleteProduct } = useProduct();
  const [cartLoading, setCartLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // State for controlling fade-out animation

  const isFavorite = useMemo(
    () => product && favorites?.some((fav) => fav.id === product.id),
    [favorites, product],
  );

  // Close modal with ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);

      // Get scrollbar width
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Prevent layout shift
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);

      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    };
  }, [open]);

   if (!product) return null;

  const category = categories.find((c) => Number(c.id) === product.type);

  const categoryLabel = category?.ro_short || category?.ro || "Fără categorie";

  // Handles adding the product to the cart
  const handleCartClick = async () => {
    setCartLoading(true);

    try {
      await addToCart(product.id, product.mass, product.price);

      onClose();
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setCartLoading(false);
    }
  };

  // Handles adding/removing favorites
  const handleFavoriteToggle = async () => {
    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        await removeFromFavorites(product.id);
      } else {
        await addToFavorites(product.id);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handles deleting product
  const handleDeleteProduct = async (productId) => {
    setCartLoading(true);

    try {
      await deleteProduct(productId);
      onClose();
    } catch (err) {
      console.error("Error deleting product:", err);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center p-4 transition-all duration-500 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur transition-opacity duration-500 ease-in-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Modal */}
      <div
        className={`relative w-full md:w-3/4 lg:w-3/5 2xl:w-2/5 max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl transition-all duration-500 ease-in-out ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {/* Close Button */}
        <div className="mb-8">
          <RippleButton
            onClick={onClose}
            className="absolute! top-2 right-2 z-10 text-teal-800"
            variant="icon"
          >
            <X />
          </RippleButton>
        </div>
        {/* Content */}
        <div className="flex flex-wrap p-6">
          {/* Image */}
          <div className="w-full md:w-1/2 px-2 mb-8">
            <div className="w-full h-64 flex justify-center items-center bg-white border border-gray-300 rounded-xl overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-contain h-full w-full"
                />
              ) : (
                <div className="text-gray-400 text-sm">
                  Imagine indisponibilă
                </div>
              )}
            </div>
          </div>
          {/* Product Info */}
          <div className="w-full md:w-1/2 px-2">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-sm text-gray-500 mb-2">{categoryLabel}</p>
            <p className="text-2xl font-bold mb-4 text-teal-800">
              {product.price} RON
            </p>
            <p className="text-base font-medium mb-1">Descriere:</p>
            <p className="text-sm mb-8 text-gray-700">
              {product.description ?? "Produsul momentan nu are descriere"}
            </p>
            {/* Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              {product.quantity === 0 ? (
                <span className="text-sm font-semibold text-red-600">
                  Indisponibil
                </span>
              ) : (
                <RippleButton
                  disabled={cartLoading}
                  onClick={handleCartClick}
                  className="bg-teal-800 px-4 py-2 border border-teal-800"
                  variant="primary"
                >
                  {cartLoading ? "Se adaugă..." : "Adaugă în coș"}
                </RippleButton>
              )}
              <RippleButton
                disabled={favoriteLoading}
                onClick={handleFavoriteToggle}
                className="px-5.5 py-2 flex items-center justify-center gap-2"
                variant="secondary"
              >
                Favorite
                <Heart
                  size={18}
                  fill={isFavorite ? "red" : "none"}
                  color={isFavorite ? "red" : "currentColor"}
                />
              </RippleButton>
              {/*{isAdmin && (
                <RippleButton
                  disabled={cartLoading}
                  onClick={() => handleDeleteProduct(product.id)}
                  className="px-4 py-2 text-sm rounded-lg text-white"
                  variant="danger"
                >
                  Șterge produs
                </RippleButton>
              )}*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
