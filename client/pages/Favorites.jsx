import React, { useState, useEffect } from "react";
import Header from "../src/components/Header";
import { useAuth } from "../src/contexts/AuthContext";
import { useCategory } from "../src/contexts/CategoryContext";
import { useCart } from "../src/contexts/CartContext";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import ProductModal from "../src/components/ProductModal";
import RippleButton from "../src/components/RippleButton";

export default function Favorites() {
  const { favorites = [], removeFromFavorites } = useAuth();
  const { categories = [] } = useCategory();
  const [error, setError] = useState(null);
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [loadingFavoriteId, setLoadingFavoriteId] = useState(null);
  const { addToCart } = useCart();
  const [openProductId, setOpenProductId] = useState(null); // State for controlling modal visibility

  // Handles removing a product from favorites
  const handleRemoveFavorite = async (e, id) => {
    e.stopPropagation(); // Prevents card click from being triggered
    setLoadingFavoriteId(id);
    try {
      await removeFromFavorites(id);
      setError(null);
    } catch (err) {
      setError("Eroare la ștergerea produsului din favorite.");
      console.error("Error toggling favorite:", err);
    } finally {
      setLoadingFavoriteId(null);
    }
  };

  // Handles adding the product to the cart
  const handleCartClick = async (e, product) => {
    e.stopPropagation(); // Prevents card click from being triggered
    setLoadingCartId(product.id); // Set loading state for this product
    try {
      await addToCart(product.id, product.mass, product.price); // Try adding product to cart
    } catch (err) {
      console.error("Error adding to cart:", err); // Log error if it occurs
    } finally {
      setLoadingCartId(null); // Reset loading state
    }
  };

  // Open the modal
  const handleOpen = (id) => setOpenProductId(id);

  // Close the modal
  const closeModal = () => setOpenProductId(null);

  return (
    <>
      <header className="p-4" />
      <div className="pb-4">
        <Header />
      </div>
      <div className="p-4">
        <h2 className="text-white text-2xl font-bold mb-4 md:px-20">
          Favorite
        </h2>
        {error && <div className="text-red-600 text-center mb-2">{error}</div>}
        {Array.isArray(favorites) && favorites.length > 0 ? (
          <div className="flex flex-col gap-4 md:px-40 space-y-4">
            {favorites.map((item) => {
              const category =
                categories.find((c) => Number(c.id) === item.type) || {};
              return (
                <div key={item.id} className="contents">
                  <div
                    className="bg-white/50 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 shadow-mdcursor-pointer rounded-xl shadow-md flex relative cursor-pointer"
                    onClick={() => handleOpen(item.id)}
                  >
                    <div className="w-36 h-48 bg-white flex items-center justify-center rounded-l-xl">
                      <img
                        src={item.imageUrl || ""}
                        alt={item.name}
                        className="object-contain h-full"
                      />
                    </div>
                    <div className="p-4 flex flex-row justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{item.name}</h3>
                        <p>
                          {category.ro_short || category.ro || "Fără categorie"}
                        </p>
                        <p>{item.mass}</p>
                      </div>
                      <p className="absolute right-4 p-4 font-bold">
                        {item.price} RON
                      </p>
                      <div className="absolute right-4 p-4 bottom-4 flex gap-2">
                        {item.quantity === 0 ? (
                          <span className="flex gap-2 items-center text-sm font-semibold text-red-600">
                            Indisponibil
                          </span>
                        ) : (
                          <RippleButton
                            variant="primary"
                            aria-label="Adaugă în coș"
                            disabled={loadingCartId === item.id}
                            onClick={(e) => handleCartClick(e, item)}
                            className="flex gap-2 items-center p-2 bg-teal-600 hover:bg-teal-800"
                          >
                            <span className="hidden lg:inline">
                              {loadingCartId === item.id
                                ? "Adăugare..."
                                : "Adaugă în coș"}
                            </span>
                            <ShoppingCart fill="white" className="relative" />
                          </RippleButton>
                        )}
                        <RippleButton
                          variant="primary"
                          aria-label="Șterge din favorite"
                          disabled={loadingFavoriteId === item.id}
                          onClick={(e) => handleRemoveFavorite(e, item.id)}
                          className="flex gap-2 items-center p-2 bg-red-600 hover:bg-red-800"
                        >
                          <span className="hidden lg:inline">
                            Șterge din favorite
                          </span>
                          <Heart fill="white" />
                        </RippleButton>
                      </div>
                    </div>
                  </div>
                  {/* Product Details Modal */}
                  <ProductModal
                    key={`modal-${item.id}`}
                    open={openProductId === item.id}
                    onClose={closeModal}
                    product={item}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 text-center text-lg">
            Lista ta de favorite este goală. Descoperă produsele noastre și
            <Link className="text-teal-800" to="/">
              {" "}
              adaugă-le la favorite.
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
