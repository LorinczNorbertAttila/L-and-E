import React, { useState, useMemo } from "react";
import { X, Heart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCategory } from "../contexts/CategoryContext";
import { useAuth } from "../contexts/AuthContext";
import { useProduct } from "../contexts/ProductContext";
import {
  IconButton,
  Dialog,
  DialogBody,
  DialogHeader,
  Button,
} from "@material-tailwind/react";


export default function ProductModal({ open, onClose, product }) {
  const { categories } = useCategory();
  const { addToCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites, isAdmin } = useAuth();
  const { deleteProduct } = useProduct();
  const [cartLoading, setCartLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isFavorite = useMemo(
    () => product && favorites?.some((fav) => fav.id === product.id),
    [favorites, product]
  );

  if (!product) return null;

  const category = categories.find((c) => Number(c.id) === product.type);
  const categoryLabel = category?.ro_short || category?.ro || "Fără categorie";

  // Handles adding the product to the cart
  const handleCartClick = async () => {
    setCartLoading(true);
    try {
      await addToCart(product.id, product.mass, product.price); // Try adding product to cart
      onClose(); // Close the modal after adding to cart
    } catch (err) {
      console.error("Error adding to cart:", err); // Log error if it occurs
    } finally {
      setCartLoading(false); // Reset loading state
    }
  };

  // Handles adding/removing the product from favorites
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

  // Handles deleting the product
  const handleDeleteProduct = async (productId) => {
    setCartLoading(true);
    try {
      await deleteProduct(productId);
      onClose();
    } catch (err) {
      console.error("Error deleting product:", err);
    } finally {
      setCartLoading(false);
    } };

  return (
    <Dialog open={open} handler={onClose} aria-labelledby="modal-title">
      <DialogHeader>
        <IconButton
          variant="text"
          onClick={onClose}
          className="!absolute top-2 right-2 text-teal-800"
        >
          <X />
        </IconButton>
      </DialogHeader>
      <DialogBody className="flex flex-wrap ">
        {/* Modal Content */}

        <div className="w-full md:w-1/2 px-4 mb-8">
          <div className="w-full h-64 flex justify-center items-center bg-white border rounded-md">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-contain h-full"
              />
            ) : (
              <div className="text-gray-400 text-sm">Imagine indisponibilă</div>
            )}
          </div>
        </div>
        <div className="w-full md:w-1/2 px-4">
          <h2 id="modal-title" className="text-2xl font-bold">
            {product.name}
          </h2>
          <p className="text-sm">{categoryLabel}</p>
          <p className="text-lg font-bold mb-4">{product.price} RON</p>
          <p className="text-base">Descriere: </p>
          <p className="text-sm mb-8">
            {product.description ?? "Produsul momentan nu are descriere"}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              disabled={product.quantity === 0 || cartLoading}
              size="sm"
              onClick={handleCartClick}
              className={`${
                product.quantity === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-teal-800 hover:bg-black"
              }`}
            >
              Adaugă în coș
            </Button>
            <Button
              disabled={favoriteLoading}
              size="sm"
              variant="outlined"
              onClick={handleFavoriteToggle}
              className="flex items-center gap-2"
            >
              Favorite <Heart fill={isFavorite ? "red" : "none"} />
            </Button>
            {isAdmin && (
            <Button
              disabled={product.quantity === 0 || cartLoading}
              size="sm"
              onClick={() => handleDeleteProduct(product.id)}
              className={`${
                product.quantity === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-black"
              }`}
            >
              Șterge produs
            </Button>
            )}
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}
