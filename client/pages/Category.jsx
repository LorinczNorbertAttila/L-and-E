import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import {
  X,
  User,
  Search,
  ListFilter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext";
import { useProduct } from "../src/contexts/ProductContext";
import { useCategory } from "../src/contexts/CategoryContext";
import CategoryGrid from "../src/components/CategoryGrid";
import RippleButton from "../src/components/RippleButton";

// Debounce hook for search input
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const FilterDrawer = React.memo(function FilterDrawer({
  open,
  onClose,
  availableMasses,
  initialMasses,
  initialShowInStockOnly,
  initialPriceRange,
  minPrice,
  maxPrice,
  onApply,
  onReset,
}) {
  // Local state for filters inside the drawer
  const [localMasses, setLocalMasses] = useState(initialMasses);
  const [localShowInStockOnly, setLocalShowInStockOnly] = useState(
    initialShowInStockOnly,
  );
  const [localPriceRange, setLocalPriceRange] = useState(initialPriceRange);

  // Reset local state when drawer opens or initial values change
  useEffect(() => {
    if (open) {
      setLocalMasses(initialMasses);
      setLocalShowInStockOnly(initialShowInStockOnly);
      setLocalPriceRange(initialPriceRange);
    }
  }, [open, initialMasses, initialShowInStockOnly, initialPriceRange]);

  const toggleMass = (mass) => {
    setLocalMasses((prev) =>
      prev.includes(mass) ? prev.filter((m) => m !== mass) : [...prev, mass],
    );
  };

  // Reset all filters to initial state
  const handleReset = () => {
    setLocalMasses([]);
    setLocalShowInStockOnly(false);
    setLocalPriceRange([minPrice, maxPrice]);
    if (onReset) onReset();
  };

  // Apply filters and close drawer
  const handleApply = () => {
    onApply({
      masses: localMasses,
      showInStockOnly: localShowInStockOnly,
      priceRange: localPriceRange,
    });
    onClose();
  };

  // Close modal with ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);

      // Get scrollbar width
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Prevent layout shift
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);

      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur z-50 transition-opacity duration-400 ease-in-out ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        placement="left"
        className={`fixed top-0 left-0 h-full w-72 z-50 p-6 bg-white/80 backdrop-blur-2xl backdrop-saturate-200 border-r border-white/80 shadow-xl transition-transform duration-400 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h5>Filtrare produse</h5>
          <RippleButton
            variant="icon"
            onClick={onClose}
            className="text-gray-900"
          >
            <X />
          </RippleButton>
        </div>

        <div
          className="flex flex-col"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          <h6 className="mb-2">Disponibilitate:</h6>
          <label className="relative flex items-center space-x-3 m-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localShowInStockOnly}
              onChange={(e) => setLocalShowInStockOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border border-gray-400 bg-transparent rounded-md peer-checked:bg-black peer-checked:scale-110 transition-all duration-300 ease-in-out" />
            <Check className="absolute w-3 h-3 text-white left-1 top-1.5 opacity-0 peer-checked:opacity-100 transition-opacity duration-300" />
            <span className="text-gray-700">În stoc</span>
          </label>
          <h6 className="mb-2">Greutate:</h6>
          {availableMasses
            .filter((mass) => mass !== null && mass !== undefined && mass != "")
            .map((mass, idx) => (
              <label
                className="relative flex items-center space-x-3 m-3 cursor-pointer"
                key={`${mass}-${idx}`}
              >
                <input
                  type="checkbox"
                  checked={localMasses.includes(mass)}
                  onChange={() => toggleMass(mass)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border border-gray-400 bg-transparent rounded-md peer-checked:bg-black peer-checked:scale-110 transition-all duration-300 ease-in-out" />
                <Check className="absolute w-3 h-3 text-white left-1 top-1.5 opacity-0 peer-checked:opacity-100 transition-opacity duration-300" />
                <span className="text-gray-700">{mass}</span>
              </label>
            ))}
          <h6 className="mt-4 mb-1">Preț maxim (RON):</h6>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-700 px-1">
              <span>{minPrice} RON</span>
              <span>{maxPrice} RON</span>
            </div>
            <input
              type="range"
              className="w-full accent-teal-800"
              min={minPrice}
              max={maxPrice}
              step={0.1}
              value={localPriceRange[1]}
              onChange={(e) =>
                setLocalPriceRange([minPrice, Number(e.target.value)])
              }
            />
            <p className="text-center text-sm">
              Până la: <strong>{localPriceRange[1]} RON</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <RippleButton
            variant="primary"
            onClick={handleApply}
            className="bg-gray-900 px-6 py-3"
          >
            Aplică filtre
          </RippleButton>
          <RippleButton
            variant="primary"
            onClick={handleReset}
            className="bg-gray-900 px-6 py-3"
          >
            Resetare filtre
          </RippleButton>
        </div>
      </div>
    </>
  );
});

export default function Category() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { products } = useProduct();
  const { categories } = useCategory();

  // Find the category based on the ID from the URL parameters
  const category = categories.find((c) => Number(c.id) === Number(id));

  // Filter state (applied filters)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMasses, setSelectedMasses] = useState([]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState("default");

  const ITEMS_PER_PAGE = 20;

  // Debounced search term for better UX
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Filter products based on the category
  const filtered = useMemo(
    () => products.filter((p) => p.type === Number(id)),
    [products, id],
  );

  // Check if there are products available
  const hasProducts = filtered?.length > 0;

  //Get the minimum and maximum prices from the products
  const [minPrice, maxPrice] = useMemo(() => {
    const prices = filtered.map((p) => p.price);
    return prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 0];
  }, [filtered]);

  //Unique masses for the products in the filtered category
  const uniqueMasses = useMemo(
    () =>
      Array.from(new Set(filtered.map((p) => p.mass))).sort((a, b) => a - b),
    [filtered],
  );

  //set the initial price range
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  // Function to apply filters (called from Drawer)
  const handleApplyFilters = useCallback(
    ({ masses, showInStockOnly, priceRange }) => {
      setSelectedMasses(masses);
      setShowInStockOnly(showInStockOnly);
      setPriceRange(priceRange);
    },
    [],
  );

  // Function to reset all filters
  const handleResetFilters = useCallback(() => {
    setSelectedMasses([]);
    setShowInStockOnly(false);
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  // Apply all filters (mass, stock, price, search)
  const filteredProducts = useMemo(() => {
    let result = [...filtered];
    // Filter by selected masses
    if (selectedMasses.length)
      result = result.filter((p) => selectedMasses.includes(p.mass));
    // Filter by in-stock products
    if (showInStockOnly) result = result.filter((p) => p.quantity > 0);
    // Filter by price range
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );
    // Filter by debounced search term
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    // Apply sorting
    if (sortType === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortType === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortType === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    filtered,
    selectedMasses,
    showInStockOnly,
    priceRange,
    debouncedSearchTerm,
    sortType,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMasses, showInStockOnly, priceRange, debouncedSearchTerm]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <>
      <header>
        <div className="flex flex-row p-8 gap-4 justify-center items-center">
          <Link to="/about" className="text-white hover:underline">
            Despre noi
          </Link>
          <div className="ml-auto flex gap-4 justify-center items-center">
            <div className="relative justify-center items-center">
              <input
                id="search-input"
                type="text"
                aria-label="Căutare produse"
                className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-hidden transition-all duration-300 ease-in-out w-12 focus:w-64"
                placeholder="Căutare..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="text-teal-800 h-5 absolute right-0 top-0 mt-2.5 mr-4 pointer-events-none" />
            </div>

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
      <h1 className="text-white text-2xl font-bold px-4 md:px-20 pt-8 pb-2">
        {category?.ro || "Produse"}
      </h1>
      {hasProducts && (
        <div className="flex justify-between items-center px-4 md:px-20 py-2">
          <button
            title="Filtrează produsele"
            aria-label="Filtrează produsele"
            onClick={() => setDrawerOpen(true)}
            className="text-white cursor-pointer hover:scale-110 transition-all ease-in-out"
          >
            <ListFilter />
          </button>
          <select
            id="sort-select"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="bg-white/80 rounded-lg w-48 text-sm px-4 py-2"
          >
            <option value="default">Sortează produsele</option>
            <option value="name-asc">A - Z</option>
            <option value="name-desc">Z - A</option>
            <option value="price-asc">Preț: crescător</option>
            <option value="price-desc">Preț: descrescător</option>
          </select>
        </div>
      )}

      <CategoryGrid products={paginatedProducts} />

      {totalPages > 1 && (
        <div className="flex justify-center py-8 px-4">
          <nav className="bg-white/10 backdrop-blur-2xl backdrop-saturate-200 rounded-full px-4 py-2 shadow-lg border border-white/20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`rounded-full transition-all ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-green-100 hover:bg-white hover:text-teal-800"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 2),
                    Math.min(totalPages, currentPage + 3),
                  )
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-full px-4 py-2 transition-all duration-300 ${
                        currentPage === page
                          ? "bg-white text-teal-800 shadow font-bold"
                          : "text-green-100 hover:bg-white hover:text-teal-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`rounded-full transition-all ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-green-100 hover:bg-white hover:text-teal-800"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      )}

      <div className="text-center text-gray-400 text-sm py-4">
        Pagina {totalPages > 0 ? currentPage : 0} din {totalPages} | Total:{" "}
        {filteredProducts.length} produse
      </div>
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        availableMasses={uniqueMasses}
        initialMasses={selectedMasses}
        initialShowInStockOnly={showInStockOnly}
        initialPriceRange={priceRange}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      <Footer />
    </>
  );
}
