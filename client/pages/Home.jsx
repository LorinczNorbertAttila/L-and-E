import { useState, useEffect, useRef } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { useProduct } from "../src/contexts/ProductContext";
import { useCategory } from "../src/contexts/CategoryContext";
import { User, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext";
import { Carousel, Card, List, ListItem } from "@material-tailwind/react";
import CategorySection from "../src/components/CategorySection";
import ProductModal from "../src/components/ProductModal";
import carouselImg1 from "../src/assets/images/fb_LandE.jpg";
import carouselImg2 from "../src/assets/images/Parteneri.png";
import carouselImg3 from "../src/assets/images/Carousel_LandE.png";
import BotpressChat from "../chatbots/BotPress";
import TidioChat from "../chatbots/Tidio";
import FreshChat from "../chatbots/FreshChat";
import CrispChat from "../chatbots/Crisp";
import TawkToChat from "../chatbots/Tawk_to";
import ZapierChat from "../chatbots/Zapier";

// Custom navigation for the carousel
const renderCarouselNavigation = ({ setActiveIndex, activeIndex, length }) => (
  <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
    {new Array(length).fill("").map((_, i) => (
      <span
        key={i}
        className={`block h-1 cursor-pointer rounded-2xl transition-all ${
          activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
        }`}
        onClick={() => setActiveIndex(i)}
      />
    ))}
  </div>
);

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
  const searchRef = useRef(null); // Ref for the search input and results

  // Filter products based on the search term
  useEffect(() => {
    if (debouncedSearchTerm.trim() === "") {
      setFilteredProducts([]);
      setShowResults(false);
      return;
    }
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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
                type="text"
                aria-label="Căutare produse"
                className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none transition-all duration-300 ease-in-out w-12 focus:w-64"
                placeholder="Căutare..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm && setShowResults(true)}
              />
              <Search className="text-teal-800 h-5 absolute right-0 top-0 mt-2.5 mr-4 pointer-events-none" />
              {showResults && (
                <Card
                  role="listbox"
                  className="absolute top-12 w-64 z-50 max-h-72 overflow-y-auto overflow-x-hidden max-w-full"
                >
                  <List>
                    {/* Show message if there are no search results */}
                    {filteredProducts.length === 0 ? (
                      <li className="p-4 text-center text-gray-500">
                        Niciun produs găsit
                      </li>
                    ) : (
                      // List search results
                      filteredProducts.map((product) => (
                        <ListItem
                          key={product.id}
                          tabIndex={0}
                          role="option"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDialog(true);
                            setShowResults(false); // Hide results after selection
                          }}
                          className="cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-20 h-20 flex justify-center items-center bg-white border rounded-md">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="object-contain h-full rounded-md"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs text-center">
                                Imagine indisponibilă
                              </span>
                            )}
                          </div>
                          <span className="text-sm ml-4">{product.name}</span>
                        </ListItem>
                      ))
                    )}
                  </List>
                </Card>
              )}
            </div>

            {/* Registration link if user is not logged in */}
            {!currentUser && (
              <Link to="/sign-up">
                <li className="hover:underline text-white flex items-center gap-1">
                  <User /> Registrare
                </li>
              </Link>
            )}
          </div>
        </div>
      </header>
      <Header />
      {/* Carousel section */}
      <div className="md:w-5/6 md:h-96 w-full h-56 mx-auto my-20">
        <Carousel
          data-testid="image-carousel"
          autoplay={true}
          autoplayDelay={5000}
          loop={true}
          className="rounded-xl overflow-hidden"
          navigation={renderCarouselNavigation}
        >
          <img
            src={carouselImg1}
            alt="image 1"
            className="h-full w-full object-contain md:object-cover"
          />
          <img
            src={carouselImg2}
            alt="image 2"
            className="h-full w-full object-contain bg-white bg-opacity-80"
          />
          <img
            src={carouselImg3}
            alt="image 3"
            className="h-full w-full object-contain object-center bg-white bg-opacity-80"
          />
        </Carousel>
      </div>
      {/* Render category sections only if there are enough products */}
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.type === Number(category.id)
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
      {/* Chatbots */}
      {/* <BotpressChat/> */}
      {/* <TidioChat /> */}
      {/* <FreshChat /> */}
      {/* <TawkToChat /> */}
      {/* <CrispChat /> */}
      {/* <ZapierChat /> */}
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
