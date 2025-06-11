import React, { useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCategory } from "../contexts/CategoryContext";
import {
  IconButton,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import ProductModal from "./ProductModal";

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
      <Card
        className="bg-white bg-opacity-50 cursor-pointer md:w-64 w-48 h-auto group"
        onClick={handleOpen}
        role="button"
        tabIndex={0}
      >
        {/* Product Image */}
        <CardHeader className="md:h-48 h-32 flex justify-center">
           <div className="w-full flex justify-center items-center bg-white border rounded-md">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-contain h-full group-hover:scale-110 transition-transform"
              />
            ) : (
              <div className="text-gray-400 text-sm">Imagine indisponibilă</div>
            )}
          </div>
        </CardHeader>

        {/* Product Details */}
        <CardBody className="relative">
          <h1 className="text-xl font-bold leading-tight text-gray-900">
            {product.name}
          </h1>
          <p className="mt-2 text-gray-800">{categoryLabel}</p>
          <p className="mt-2 text-gray-800">{product.mass}</p>
          <p className="mt-2 text-teal-800 font-extrabold">
            {product.price} RON
          </p>

          {/* Add to Cart Button */}
          <IconButton
            disabled={product.quantity === 0 || loadingId === product.id}
            onClick={createCartClickHandler(product)}
            className={`!absolute bottom-2 right-2 
              ${
                product.quantity === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-100 hover:bg-teal-600"
              }
            `}
          >
            <ShoppingCart
              className={`${
                product.quantity === 0 ? "text-gray-500" : "text-teal-800"
              }`}
            />
          </IconButton>
        </CardBody>
      </Card>

      {/* Product Details Modal */}
      <ProductModal open={open} onClose={closeModal} product={product} />
    </>
  );
}
