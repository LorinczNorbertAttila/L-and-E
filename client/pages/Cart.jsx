import React, { useState, useEffect } from "react";
import Header from "../src/components/Header";
import { useCart } from "../src/contexts/CartContext";
import { useAuth } from "../src/contexts/AuthContext";

export default function Cart() {
  const { cart, updateCartItemQuantity, removeFromCart, placeOrder } =
    useCart();
  const { currentUser } = useAuth();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const calculatedTotal = cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    setTotal(calculatedTotal);
  }, [cart]);

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(item.product.id);
      console.log(cart);
    } else if (newQuantity > item.quantity) {
      updateCartItemQuantity(item.product.id, 1);
    } else if (newQuantity < item.quantity) {
      updateCartItemQuantity(item.product.id, -1);
    }
  };

  const handlePlaceOrder = async () => {
    await placeOrder(cart, total, currentUser?.uid);
    alert("Comanda ta a fost plasată cu succes!");
  };

  return (
    <>
      <header>
        <div className="flex flex-row p-4 gap-4 justify-center items-center" />
      </header>
      <Header />
      <div className="p-4">
        <h2 className="text-white text-2xl font-bold mb-4">Coșul meu</h2>
        {cart.length > 0 ? (
          <div className="space-y-4">
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
                <form className="absolute right-4 p-4 self-end">
                  <div className="flex items-center">
                    <label className="p-4">Cantitate: </label>
                    <input
                      id="quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item, parseInt(e.target.value))
                      }
                      className="border rounded px-2 py-1 w-16"
                    />
                  </div>
                </form>
              </div>
            ))}
            <div className="text-white text-right font-bold text-xl mt-4">
              Total: {total.toFixed(2)} RON
            </div>
            {currentUser ? (
              <div className="flex justify-center items-center">
                <button
                  type="submit"
                  onClick={handlePlaceOrder}
                  className="bg-teal-800 text-white rounded-md px-4 py-2"
                >
                  Trimite comanda
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Coșul tău este gol</p>
        )}
      </div>
    </>
  );
}
