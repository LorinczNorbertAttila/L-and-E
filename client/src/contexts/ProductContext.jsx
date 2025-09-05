import { getAuth } from "firebase/auth";
import React, { useContext, useState, useEffect } from "react";

// Function to get random products from a list
function getRandomProducts(products, count) {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Create a context for products
const ProductContext = React.createContext();

// Custom hook to use ProductContext
export const useProduct = () => useContext(ProductContext);

export default function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [randomProductsByCategory, setRandomProductsByCategory] = useState({});
  const RANDOM_PRODUCTS_COUNT = 10; // Number of random products to select per category

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

  const getProductsForCategory = (categoryId) => {
    return randomProductsByCategory[categoryId] || [];
  };

  // When products or randomProductsByCategory change, for each category in products,
  // set random products if not already set.
  useEffect(() => {
    if (!products.length) return;

    // Find all unique category IDs in products
    const categoryIds = [...new Set(products.map((p) => p.type))];

    const newRandomProducts = {};

    categoryIds.forEach((categoryId) => {
      const categoryProducts = products.filter(
        (p) => p.type === Number(categoryId)
      );
      newRandomProducts[categoryId] = getRandomProducts(
        categoryProducts,
        RANDOM_PRODUCTS_COUNT
      );
    });

    setRandomProductsByCategory(newRandomProducts);
  }, [products]);

  // Remove an item from the cart
    async function deleteProduct(productId) {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        const idToken = currentUser ? await currentUser.getIdToken() : null;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${productId}`,
          {
            method: "DELETE",
            headers: {
              ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
            },
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to delete product: ${response.status} ${text}`);
        }

        // Update local state to remove the deleted product
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productId)
        );
      } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
      }
    }

  return (
    <ProductContext.Provider value={{ products, getProductsForCategory, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}
