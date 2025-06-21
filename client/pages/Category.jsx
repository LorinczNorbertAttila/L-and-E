import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { X, User, Search, ListFilter } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext";
import { useProduct } from "../src/contexts/ProductContext";
import { useCategory } from "../src/contexts/CategoryContext";
import CategoryGrid from "../src/components/CategoryGrid";
import {
  Drawer,
  Button,
  IconButton,
  Checkbox,
  Tooltip,
} from "@material-tailwind/react";

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
    initialShowInStockOnly
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
      prev.includes(mass) ? prev.filter((m) => m !== mass) : [...prev, mass]
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

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="left"
      className="p-6 bg-opacity-80 backdrop-blur-2xl backdrop-saturate-200 border border-white/80"
    >
      <div className="flex items-center justify-between mb-6">
        <h5>Filtrare produse</h5>
        <IconButton variant="text" onClick={onClose}>
          <X />
        </IconButton>
      </div>

      <div
        className="flex flex-col"
        style={{ maxHeight: "60vh", overflowY: "auto" }}
      >
        <h6 className="mb-2">Disponibilitate:</h6>
        <Checkbox
          label="În stoc"
          checked={localShowInStockOnly}
          onChange={(e) => setLocalShowInStockOnly(e.target.checked)}
        />
        <h6 className="mb-2">Greutate:</h6>
        {availableMasses
          .filter((mass) => mass !== null && mass !== undefined && mass != "")
          .map((mass, idx) => (
            <Checkbox
              key={`${mass}-${idx}`}
              checked={localMasses.includes(mass)}
              onChange={() => toggleMass(mass)}
              className="hover:before:content-none p-0"
              label={mass}
            />
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
        <Button onClick={handleApply} className="flex-1" fullWidth>
          Aplică filtre
        </Button>
        <Button onClick={handleReset} className="flex-1" fullWidth>
          Resetare filtre
        </Button>
      </div>
    </Drawer>
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

  // Debounced search term for better UX
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Filter products based on the category
  const filtered = useMemo(
    () => products.filter((p) => p.type === Number(id)),
    [products, id]
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
    [filtered]
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
    []
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
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    // Filter by debounced search term
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    return result;
  }, [
    filtered,
    selectedMasses,
    showInStockOnly,
    priceRange,
    debouncedSearchTerm,
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <div className="flex flex-row p-8 gap-4 justify-center items-center">
          <Link to="/about" className="text-white hover:underline">
            Despre noi
          </Link>
          <div className="ml-auto flex gap-4  justify-center items-center">
            <div className="relative justify-center items-center">
              <input
                type="text"
                aria-label="Căutare produse"
                className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none transition-all duration-300 ease-in-out w-12 focus:w-64"
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
          <Tooltip content="Filtrează produsele" placement="right">
            <IconButton
              variant="text"
              onClick={() => setDrawerOpen(true)}
              size="sm"
              className="text-white"
            >
              <ListFilter />
            </IconButton>
          </Tooltip>
        </div>
      )}
      <CategoryGrid products={filteredProducts} />
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
    </div>
  );
}
