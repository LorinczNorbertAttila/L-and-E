import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRightCircle, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useProduct } from "../contexts/ProductContext";

export default function CategorySection({ category, products }) {
  const scrollRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const { getProductsForCategory } = useProduct();

  // Filter products that belong to the current category
  const visibleProducts = getProductsForCategory(category.id, products);

  // Scrolls the product container to the left
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  // Scrolls the product container to the right
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScrollability = () => {
      setCanScroll(el.scrollWidth > el.clientWidth);
    };
    updateScrollability();
    // Add event listener to update scrollability on resize
    window.addEventListener("resize", updateScrollability);
    return () => window.removeEventListener("resize", updateScrollability);
  }, [visibleProducts]);

  return (
    <div className="mb-10 px-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">
          {category.ro || category.ro_short}
        </h2>
        <Link
          to={`/category/${category.id}`}
          className="flex gap-2 text-white hover:underline"
        >
          Mai multe <ChevronRightCircle />
        </Link>
      </div>

      <div className="relative">
        {/* Scroll left button */}
        {canScroll && (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {/* Product container with horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex overflow-x-hidden scroll-smooth gap-10 px-12 py-6 hide-scrollbar"
          tabIndex={0}
        >
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="shrink-0 snap-start"
              style={{ scrollSnapAlign: "start" }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Scroll right button */}
        {canScroll && (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
