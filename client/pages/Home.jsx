import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { useProduct } from "../src/contexts/ProductContext";
import { useCategory } from "../src/contexts/CategoryContext";
import { User, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext";
import CategorySection from "../src/components/CategorySection";
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

// Debounce hook for search input
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function Home() {
  const { currentUser } = useAuth();
  const { products } = useProduct();
  const { categories } = useCategory();
  const [searchTerm, setSearchTerm] = useState(""); // Search input value
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300); // Debounced search term
  const [filteredProducts, setFilteredProducts] = useState([]); // Products filtered by search
  const [selectedProduct, setSelectedProduct] = useState(null); // Product selected for modal
  const [showDialog, setShowDialog] = useState(false); // Modal visibility
  const [showResults, setShowResults] = useState(false); // Search results dropdown visibility
  const [searchFocused, setSearchFocused] = useState(false); //Search is focused or not
  const [hoveredProductId, setHoveredProductId] = useState(null); //State for hovering
  const searchRef = useRef(null); // Ref for the search input and results
  const images = [
    { src: carouselImg1, alt: "image 1", className: "md:object-cover" },
    { src: carouselImg2, alt: "image 2", className: "bg-white/80" },
    {
      src: carouselImg3,
      alt: "image 3",
      className: "object-center bg-white/80",
    },
  ];

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
      <header>
        <div className="flex flex-row p-8 gap-4 justify-center items-center">
          {/* Navigation link to "About Us" page */}
          <Link to="/about" className="text-white hover:underline">
            Despre noi
          </Link>
          <div className="ml-auto flex gap-4  justify-center items-center">
            {/* Search input and results dropdown */}
            <div
              className="relative justify-center items-center"
              ref={searchRef}
            >
              <input
                id="search-input"
                type="text"
                aria-label="Căutare produse"
                className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-hidden transition-all duration-300 ease-in-out w-12 focus:w-64"
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
