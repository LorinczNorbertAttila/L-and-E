import React, { useContext, useState, useEffect } from "react";

// Create a context for categories
const CategoryContext = React.createContext();

// Custom hook to use CategoryContext
export const useCategory = () => useContext(CategoryContext);

export default function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/categories`
        );
        const json = await res.json();
        setCategories(json.data);
      } catch (error) {
        console.error("Error getting the categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories }}>
      {children}
    </CategoryContext.Provider>
  );
}
