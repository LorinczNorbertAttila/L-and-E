import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, ShoppingCart, Power, ChevronDown } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import {
  Navbar,
  Avatar,
  Menu,
  MenuHandler,
  Button,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const { cart } = useCart();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartTotalPrice, setCartTotalPrice] = useState(0.0);
  const [animate, setAnimate] = useState(false);
  const prevCartRef = useRef(cart);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Memoized calculation of the total number of items in the cart
  const itemCount = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  // Memoized calculation of the total price of items in the cart
  const totalPrice = React.useMemo(
    () =>
      cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    // Update the state with the new item count and total price
    setCartItemCount(itemCount);
    setCartTotalPrice(totalPrice);

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
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
      <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
        <MenuHandler>
          <Button
            variant="text"
            color="blue-gray"
            className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
          >
            <Avatar
              src={currentUser?.img || import.meta.env.VITE_DEFAULT_PICTURE}
              size="sm"
              alt="profile_picture"
            />
            <ChevronDown
              strokeWidth={2.5}
              className={`h-3 w-3 transition-transform ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </MenuHandler>
        <MenuList className="p-1">
          <Link to="/profile">
            <MenuItem className="flex items-center gap-2 rounded">
              <User className="h-4 w-4" />
              <span className="font-normal">Profilul meu</span>
            </MenuItem>
          </Link>
          <MenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 rounded hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
          >
            <Power className="h-4 w-4 text-red-500" />
            <span className="font-normal text-red-500" disabled={loading}>
              Sign Out
            </span>
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Navbar className="mx-auto max-w-screen-2xl p-2 shadow-md rounded-3xl justify-center items-center">
      <div className="flex justify-between items-center">
        <Link className="pl-3" to="/">
          <img
            src="src/assets/images/lande.png"
            className="w-20 h-20"
            alt="Home"
          />
        </Link>
        <ul className="flex flex-row gap-4 items-center">
          {currentUser && <ProfileMenu />}
          <Link to="/cart">
            <div className="relative bg-teal-600 hover:bg-black w-20 h-20 rounded-3xl shadow-md flex flex-col items-center justify-center cursor-pointer">
              {/* Cart item count */}
              <div
                data-testid="cart-item-count"
                className={`absolute top-3 right-4 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                  animate ? "animate-jump animate-duration-[300ms]" : ""
                }`}
              >
                {cartItemCount.toFixed(0)}
              </div>
              <ShoppingCart className="text-white w-6 h-6 mb-1" />
              <span className="text-white text-xs font-semibold">
                {cartTotalPrice.toFixed(2)} RON
              </span>
            </div>
          </Link>
        </ul>
      </div>
    </Navbar>
  );
}
