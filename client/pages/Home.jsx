import React, { useState, useEffect, useCallback } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { useProduct } from "../src/contexts/ProductContext";
import { useCategory } from "../src/contexts/CategoryContext";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext";
import CategorySection from "../src/components/CategorySection";
import ProductSearch from "../src/components/ProductSearch";
import ProductModal from "../src/components/ProductModal";
import carouselImg1 from "../src/assets/images/fb_LandE.jpg";
import carouselImg2 from "../src/assets/images/Parteneri.png";
import carouselImg3 from "../src/assets/images/Carousel_LandE.png";

const Carousel = ({ images, autoplayDelay = 10000 }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(next, autoplayDelay);
    return () => clearInterval(timer);
  }, [next, autoplayDelay]);

  return (
    <div className="md:w-5/6 md:h-96 w-full h-56 mx-auto my-20">
      <div className="relative h-full w-full rounded-xl overflow-hidden">
        {/* Sliding images */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              className={`h-full w-full shrink-0 object-contain ${img.className ?? ""}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`block h-1 cursor-pointer rounded-2xl transition-all ${
                activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { currentUser } = useAuth();
  const { products } = useProduct();
  const { categories } = useCategory();
  const images = [
    { src: carouselImg1, alt: "image 1", className: "md:object-cover" },
    { src: carouselImg2, alt: "image 2", className: "bg-white/80" },
    {
      src: carouselImg3,
      alt: "image 3",
      className: "object-center bg-white/80",
    },
  ];

  return (
    <>
      <header>
        <div className="flex flex-row p-8 gap-4 justify-center items-center">
          {/* Navigation link to "About Us" page */}
          <Link to="/about" className="text-white hover:underline">
            Despre noi
          </Link>
          <div className="ml-auto flex gap-4  justify-center items-center">
            <ProductSearch />
            {/* Registration link if user is not logged in */}
            {!currentUser && (
              <Link to="/sign-in">
                <li className="hover:underline text-white flex items-center gap-1">
                  <User /> Autentificare
                </li>
              </Link>
            )}
          </div>
        </div>
      </header>
      <Header />
      {/* Carousel section */}
      <Carousel images={images} autoplayDelay={10000} />
      {/* Render category sections only if there are enough products */}
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.type === Number(category.id),
        );
        if (categoryProducts.length < 3) return null; // Skip if not enough products to display
        return (
          <CategorySection
            key={category.id}
            category={category}
            products={categoryProducts}
          />
        );
      })}
      <Footer />
    </>
  );
}
