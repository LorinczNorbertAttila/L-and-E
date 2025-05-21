import React, { useState, useMemo } from "react";
import Header from "../src/components/Header";
import { useCart } from "../src/contexts/CartContext";
import { useAuth } from "../src/contexts/AuthContext";
import { Button, IconButton } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";

export default function Cart() {
  const { cart, updateCartItemQuantity, removeFromCart, placeOrder } =
    useCart();
  const { currentUser } = useAuth();
  const [error, setError] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const total = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
  }, [cart]);

  const handleQuantityChange = async (item, newQuantity) => {
    if (isNaN(newQuantity) || newQuantity < 0) return;
    const difference = newQuantity - item.quantity;
    if (difference === 0) return;
    setLoadingItemId(item.product.id);
    try {
      if (newQuantity === 0) {
        await removeFromCart(item.product.id);
      } else {
        await updateCartItemQuantity(item.product.id, difference);
      }
    } finally {
      setLoadingItemId(null);
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      await placeOrder(currentUser?.uid, total);
      alert("Comanda ta a fost plasată cu succes!");
    } catch (error) {
      alert("A apărut o eroare la plasarea comenzii.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      <header>
        <div className="flex flex-row p-4 gap-4 justify-center items-center" />
      </header>
      <Header />
      <div className="p-4">
        <h2 className="text-white text-2xl font-bold mb-4">Coșul meu</h2>
        {cart.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-4 md:w-3/4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white bg-opacity-85 rounded-md shadow-md flex relative"
                >
                  <div className="w-36 h-48 bg-white flex items-center justify-center rounded-l-md">
                    <img
                      src={item.product.imageUrl || ""}
                      alt={item.product.name}
                      className="object-contain h-full"
                    />
                  </div>
                  <div className="p-4 flex flex-row justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{item.product.name}</h3>
                      <p>{item.product.type}</p>
                      <p>{item.product.mass} g</p>
                    </div>
                    <p className="absolute right-4 p-4 font-bold">
                      {item.product.price} RON
                    </p>
                  </div>
                  <div className="absolute flex flex-col md:flex-row items-center gap-x-2 right-4 p-4 self-end">
                    <span>Cantitate: </span>
                    <div className="flex items-center gap-x-2">
                      <IconButton
                        variant="outlined"
                        className="rounded-full w-6 h-6"
                        onClick={() =>
                          handleQuantityChange(item, item.quantity - 1)
                        }
                        disabled={loadingItemId === item.product.id}
                      >
                        <Minus className="w-4 h-4" />
                      </IconButton>
                      <span
                        className="border rounded bg-white px-2 py-1 w-10 text-center"
                        id={`quantity-${item.product.id}`}
                      >
                        {item.quantity}{" "}
                      </span>
                      <IconButton
                        variant="outlined"
                        className="rounded-full w-6 h-6"
                        onClick={() =>
                          handleQuantityChange(item, item.quantity + 1)
                        }
                        disabled={loadingItemId === item.product.id}
                      >
                        <Plus className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="md:w-1/4">
              <div className="bg-white bg-opacity-85 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Sumar comandă</h2>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>{total.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Cost livrare</span>
                  <span>0.00 RON</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{total.toFixed(2)} RON</span>
                </div>
                {currentUser ? (
                  <Button
                    type="submit"
                    onClick={handlePlaceOrder}
                    className="bg-teal-800 text-white py-2 px-4 rounded-lg mt-4 w-full"
                  >
                    {isPlacingOrder ? "Se procesează..." : "Trimite comanda"}
                  </Button>
                ) : (
                  <Link to="/sign-in">
                    <Button
                      type="submit"
                      className="bg-teal-800 text-white py-2 px-4 rounded-lg mt-4 w-full"
                    >
                      Loghează-te pentru a comanda
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center text-lg">
            Coșul tău este gol. Pentru a adauga produse in coș te rugăm să
            <Link className="text-teal-800" to="/">
              {" "}
              te întorci în magazin.
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
