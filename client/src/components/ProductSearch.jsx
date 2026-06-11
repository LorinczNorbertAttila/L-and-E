import React, { useState, useEffect, useRef } from "react";
import { useProduct } from "../contexts/ProductContext";
import { Search } from "lucide-react";
import ProductModal from "../components/ProductModal";

// Debounce hook for search input
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function ProductSearch() {
  const { products } = useProduct();
  const [searchTerm, setSearchTerm] = useState(""); // Search input value
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300); // Debounced search term
  const [filteredProducts, setFilteredProducts] = useState([]); // Products filtered by search
  const [selectedProduct, setSelectedProduct] = useState(null); // Product selected for modal
  const [showDialog, setShowDialog] = useState(false); // Modal visibility
  const [showResults, setShowResults] = useState(false); // Search results dropdown visibility
  const [searchFocused, setSearchFocused] = useState(false); //Search is focused or not
  const [hoveredProductId, setHoveredProductId] = useState(null); //State for hovering
  const searchRef = useRef(null); // Ref for the search input and results

  // Filter products based on the search term
  useEffect(() => {
    if (debouncedSearchTerm.trim() === "") {
      setFilteredProducts([]);
      setShowResults(false);
      return;
    }
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    );
    setFilteredProducts(filtered);
    setShowResults(filtered.length > 0);
  }, [debouncedSearchTerm, products]);

  // Hide search results and clear search when clicking outside the search area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="relative justify-center items-center" ref={searchRef}>
        <input
          id="search-input"
          type="text"
          aria-label="Căutare produse"
          className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-hidden transition-all duration-400 ease-in-out w-12 focus:w-64"
          placeholder="Căutare..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowResults(true)}
        />
        <Search className="text-teal-800 h-5 absolute right-0 top-0 mt-2.5 mr-4 pointer-events-none" />
        {showResults && (
          <div
            role="listbox"
            className="absolute top-12 w-64 z-9999 max-h-72 overflow-y-auto overflow-x-hidden max-w-full bg-white rounded-lg shadow-md border border-gray-200"
          >
            <ul className="list-none p-0 m-0">
              {/* Show message if there are no search results */}
              {filteredProducts.length === 0 ? (
                <li className="p-4 text-center text-gray-500 text-sm">
                  Niciun produs găsit
                </li>
              ) : (
                // List search results
                filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    tabIndex={0}
                    role="option"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowDialog(true);
                      setShowResults(false); // Hide results after selection
                    }}
                    className="flex items-center p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-20 h-20 shrink-0 flex justify-center items-center bg-white border border-gray-300 rounded-md">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="object-cover h-full rounded-md"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs text-center">
                          Imagine indisponibilă
                        </span>
                      )}
                    </div>
                    <span className="text-sm ml-4">{product.name}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
      {/* Product modal for selected product from search */}
      <ProductModal
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
          setSearchTerm(""); // Clear search term when closing dialog
        }}
        product={selectedProduct}
      />
    </>
  );
}
