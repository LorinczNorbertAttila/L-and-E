import React, { useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCategory } from "../contexts/CategoryContext";
import ProductModal from "./ProductModal";
import RippleButton from "./RippleButton";

export default function ProductCard({ product }) {
  const [open, setOpen] = useState(false); // State for controlling modal visibility
  const [loadingId, setLoadingId] = useState(null); // Tracks loading state for a specific product
  const { addToCart } = useCart();
  const { categories } = useCategory();

  // Find the category for the current product
  const category = categories.find((c) => Number(c.id) === product.type);
  const categoryLabel = category?.ro_short || category?.ro || "Fără categorie";

  // Open the modal
  const handleOpen = () => setOpen(true);

  // Close the modal
  const closeModal = () => setOpen(false);

  // Handles adding the product to the cart
  const handleCartClick = async (e, product) => {
    e.stopPropagation(); // Prevents card click from being triggered
    setLoadingId(product.id); // Set loading state for this product
    try {
      await addToCart(product.id, product.mass, product.price); // Try adding product to cart
    } catch (err) {
      console.error("Error adding to cart:", err); // Log error if it occurs
    } finally {
      setLoadingId(null); // Reset loading state
    }
  };

  // Returns an event handler for the add-to-cart button
  const createCartClickHandler = (product) => (e) => {
    handleCartClick(e, product);
  };

  return (
    <>
      {/* Product Card */}
      <div
        className="bg-white/40 backdrop-blur-2xl backdrop-saturate-200 px-4 py-2 border border-white/20 rounded-xl cursor-pointer lg:w-64 w-44 h-full flex flex-col group"
        onClick={handleOpen}
        role="button"
        tabIndex={0}
      >
        {/* Product Image */}
        <div className="relative bg-clip-border mx-4 rounded-xl overflow-hidden bg-white text-gray-700 shadow-lg -mt-6 lg:h-48 h-32 flex justify-center shrink-0">
          <div className="w-full flex justify-center items-center bg-white border border-white/20 rounded-xl">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-contain h-full transform scale-95 group-hover:scale-100 transition-transform"
              />
            ) : (
              <div className="text-gray-400 text-sm">Imagine indisponibilă</div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="relative flex-1 flex flex-col lg:h-56 h-48 p-6 justify-between">
          <h1 className="text-xl font-bold leading-tight text-gray-900 line-clamp-2">
            {product.name}
          </h1>
          <div className="space-y-1">
            <p className="text-gray-800">{product.mass || "-"}</p>
            <p className="text-green-100 font-extrabold">{product.price} RON</p>
          </div>

          {/* Add to Cart Button */}
          <RippleButton
            disabled={product.quantity === 0 || loadingId === product.id}
            onClick={createCartClickHandler(product)}
            className={`absolute! bottom-2 right-2 ${
              product.quantity === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-100 hover:bg-teal-600"
            }`}
            variant="icon"
          >
            <ShoppingCart
              className={`${
                product.quantity === 0 ? "text-gray-500" : "text-teal-800"
              }`}
            />
          </RippleButton>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductModal
        key={`modal-${product.id}`}
        open={open}
        onClose={closeModal}
        product={product}
      />
    </>
  );
}
