import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCategory } from "../contexts/CategoryContext";
import { X, Check } from "lucide-react";
import RippleButton from "./RippleButton";

export default function CartDrawer({ open, onClose, cart }) {
  const { categories } = useCategory();
  const navigate = useNavigate();

  // Auto close when changing page
  const location = useLocation();

  useEffect(() => {
    if (open) onClose();
  }, [location.pathname]);

  //Memo for category changes
  const cartItems = useMemo(
    () =>
      cart.map((item) => ({
        ...item,
        category: categories.find((c) => c.id === item.product.type) || {},
      })),
    [cart, categories],
  );

  // Close modal with ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);

      // Prevent layout shift
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);

      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center p-4 transition-all duration-400 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur transition-opacity duration-400 ease-in-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-sm z-50 p-6 flex flex-col bg-white/80 backdrop-blur-2xl backdrop-saturate-200 border-l border-white/80 shadow-none transition-transform duration-400 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6 font-bold">
          <h1>Coșul meu</h1>
          <RippleButton
            variant="icon"
            onClick={onClose}
            className="text-gray-900"
          >
            <X />
          </RippleButton>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className="bg-white/50 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 rounded-xl shadow-md flex mb-2"
            >
              <div className="w-20 h-24 bg-white flex items-center justify-center rounded-l-xl">
                <img
                  src={item.product.imageUrl || ""}
                  alt={item.product.name}
                  className="object-contain h-full w-full"
                />
              </div>
              <div className="p-4 text-sm text-slate-500">
                <h2 className="font-bold text-slate-900">
                  {item.product.name}
                </h2>
                <p>{item.product.mass}</p>
                <div className="flex gap-2">
                  <p>{item.quantity} × </p>
                  <p className="text-teal-800 font-bold">
                    {item.product.price} RON
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <RippleButton
            variant="primary"
            onClick={() => {
              navigate("/cart");
            }}
            className="bg-teal-800 px-6 py-3"
          >
            Vezi coșul de cumpărături
          </RippleButton>
          <RippleButton
            variant="secondary"
            onClick={onClose}
            className="px-6 py-3"
          >
            Continuă cumpărăturile
          </RippleButton>
        </div>
      </div>
    </div>
  );
}
