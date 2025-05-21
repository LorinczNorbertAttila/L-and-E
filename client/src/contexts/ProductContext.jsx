import React, { useContext, useState, useEffect } from "react";

// Create a context for products
const ProductContext = React.createContext();

// Custom hook to use ProductContext
export const useProduct = () => useContext(ProductContext);

export default function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const json = await res.json();
        setProducts(json.data);
      } catch (error) {
        console.error("Error getting the products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products }}>
      {children}
    </ProductContext.Provider>
  );
}
