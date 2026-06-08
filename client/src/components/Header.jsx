import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  ShoppingCart,
  Power,
  ChevronDown,
  Heart,
  ShoppingBasket,
  Upload,
  List,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCategory } from "../contexts/CategoryContext";
import logo from "../assets/images/lande.png";
import RippleButton from "./RippleButton";

export default function Header() {
  const { currentUser, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { categories } = useCategory();
  const [animate, setAnimate] = useState(false);
  const prevCartRef = useRef(cart);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Memoized calculation of the total number of items in the cart
  const itemCount = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart],
  );

  // Memoized calculation of the total price of items in the cart
  const totalPrice = React.useMemo(
    () =>
      cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart],
  );

  useEffect(() => {
    // Check if the cart has changed
    if (prevCartRef.current !== cart) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500); // Reset animation after 0.5s
    }

    // Update the previous cart reference
    prevCartRef.current = cart;
  }, [cart]);

  // Function to handle logout
  async function handleLogout(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await logout();
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  function ProfileMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
      function handleClickOutside(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setIsMenuOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className="relative lg:ml-auto" ref={menuRef}>
        <RippleButton
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 hover:bg-slate-500/10"
          variant="default"
        >
          <img
            src={currentUser?.img || import.meta.env.VITE_DEFAULT_PICTURE}
            alt="profile_picture"
            className="h-8 w-8 rounded-full object-cover"
          />
          <ChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform duration-200 text-slate-500 ${
              isMenuOpen ? "-rotate-180" : ""
            }`}
          />
        </RippleButton>
        <div
          className={`absolute right-0 z-100 mt-2 w-64 origin-top-right rounded-xl border border-gray-200 bg-white text-sm p-1 shadow-lg transition-all duration-200 ${
            isMenuOpen
              ? "visible scale-100 opacity-100"
              : "invisible scale-95 opacity-0"
          }`}
        >
          <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
              <User className="h-4 w-4" />
              <span>Profilul meu</span>
            </div>
          </Link>

          <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
              <Heart className="h-4 w-4" />
              <span>Favoritele mele</span>
            </div>
          </Link>

          <Link to="/orders" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
              <ShoppingBasket className="h-4 w-4" />
              <span>Comenzile mele</span>
            </div>
          </Link>
          {isAdmin && (
            <>
              <Link to="/admin-upload" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
                  <Upload className="h-4 w-4" />
                  <span>Panou de administrare (Upload)</span>
                </div>
              </Link>
              <Link to="/admin-order" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
                  <List className="h-4 w-4" />
                  <span>Panou de administrare (Comenzi)</span>
                </div>
              </Link>
            </>
          )}
          <RippleButton
            onClick={handleLogout}
            disabled={loading}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-red-500/10"
            variant="danger"
          >
            <Power className="h-4 w-4 text-red-500" />
            <span className="text-red-500">Sign Out</span>
          </RippleButton>
        </div>
      </div>
    );
  }

  function CategoryNavigation({ categories }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // close dropdown when clicking outside
    useEffect(() => {
      function handleClickOutside(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="flex items-center gap-4 relative">
        {/* Horizontal list */}
        <div className="hidden lg:flex gap-10">
          {categories?.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="text-gray-800 hover:text-teal-700 hover:underline font-semibold text-sm"
              >
                {category.ro}
              </Link>
            ))
          ) : (
            <p className="text-gray-600">Nu există categorii disponibile.</p>
          )}
        </div>

        {/* Dropdown */}
        <div className="block lg:hidden relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-gray-800 font-semibold flex items-center gap-2 text-sm capitalize"
          >
            Produse
            <ChevronDown
              strokeWidth={2.5}
              className={`h-3 w-3 transition-transform  ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`absolute left-0 mt-2 w-48 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-lg z-100 transition-all duration-200 ${
              isOpen
                ? "visible scale-100 opacity-100"
                : "invisible scale-95 opacity-0"
            }`}
          >
            {categories?.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                >
                  {category.ro}
                </Link>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                Nu există categorii
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="relative z-50 mx-auto max-w-7xl bg-white/50 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 p-2 shadow-md rounded-3xl justify-center items-center">
      <div className="flex justify-between items-center">
        <div className="flex items-center md:gap-10 gap-2">
          <Link className="pl-3" to="/">
            <img src={logo} className="w-20 h-20" alt="Home" />
          </Link>
          <CategoryNavigation categories={categories} />
        </div>
        <ul className="flex flex-row gap-4 items-center">
          {currentUser && <ProfileMenu />}
          <Link to="/cart">
            <div className="relative bg-teal-600 hover:bg-black w-20 h-20 rounded-3xl shadow-md flex flex-col items-center justify-center cursor-pointer">
              {/* Cart item count */}
              <div
                data-testid="cart-item-count"
                className={`absolute top-3 right-4 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                  animate
                    ? "motion-scale-in-50 motion-opacity-in-[0%] motion-duration-300 motion-ease-spring-bouncier"
                    : ""
                }`}
              >
                {itemCount.toFixed(0)}
              </div>
              <ShoppingCart className="text-white w-6 h-6 mb-1" />
              <span className="text-white text-xs font-semibold">
                {totalPrice.toFixed(2)} RON
              </span>
            </div>
          </Link>
        </ul>
      </div>
    </nav>
  );
}
