import React, { useState, useMemo } from "react";
import Header from "../src/components/Header";
import { useCart } from "../src/contexts/CartContext";
import { useAuth } from "../src/contexts/AuthContext";
import { useCategory } from "../src/contexts/CategoryContext";
import { Button, IconButton, Radio } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { Minus, Plus, Pencil, Trash2 } from "lucide-react";
import UserInfoModal from "../src/components/UserInfoModal";
import BillingModal from "../src/components/BillingModal";
import CustomAlert from "../src/components/CustomAlert";
import { set } from "date-fns";

export default function Cart() {
  const { cart, updateCartItemQuantity, removeFromCart, placeOrder } =
    useCart();
  const { currentUser, setField, setCurrentUser } = useAuth();
  const { categories } = useCategory();
  const [error, setError] = useState(null);
  const [showInfoInput, setShowInfoInput] = useState(false);
  const [showBillingInput, setBillingInput] = useState(false);
  const [billingOption, setBillingOption] = useState(false);
  const [payingOption, setPayingOption] = useState("cash");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placeOrderSuccess, setPlaceOrderSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [showingAddressModal, setShowingAddressModal] = useState(false);
  const [showingBillingModal, setShowingBillingModal] = useState(false);

  //Price calculation
  const total = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  }, [cart]);

  //Mass calculation
  const totalWeight = useMemo(() => {
    const parseWeight = (mass) => {
      if (!mass || typeof mass !== "string") return 0;
      const value = parseFloat(mass.replace(",", "."));
      const lower = mass.toLowerCase();
      if (lower.includes("kg")) {
        return value;
      }
      if (lower.includes("g")) {
        return value / 1000;
      }
      if (lower.includes("ml")) {
        return value / 1000;
      }
      if (lower.includes("l")) {
        return value;
      }
      return 0;
    };
    return cart.reduce((acc, item) => {
      const itemWeight = parseWeight(item.product.mass);
      return acc + itemWeight * item.quantity;
    }, 0);
  }, [cart]);

  //Shipping cost calculation
  const shippingCost = useMemo(() => {
    if (totalWeight < 2) return 17;
    if (totalWeight < 3) return 20;
    if (totalWeight < 5) return 22.5;
    if (totalWeight < 10) return 33.9;
    if (totalWeight < 15) return 35.15;
    if (totalWeight < 20) return 36.8;
    if (totalWeight < 25) return 38.9;
    if (totalWeight < 31.5) return 45.4;
    return 50;
  }, [totalWeight]);

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
      await placeOrder(
        currentUser?.uid,
        total + shippingCost,
        shippingCost,
        billingOption,
        payingOption,
      );
      setPlaceOrderSuccess(true);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } catch (error) {
      setPlaceOrderSuccess(false);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      <header className="p-4" />
      <div className="pb-4">
        <Header />
      </div>
      <div className="p-4">
        <h2 className="text-white text-2xl font-bold md:px-20 mb-4">
          Coșul meu
        </h2>
        {cart.length > 0 ? (
          <>
            {currentUser ? (
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 lg:px-20">
                <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 rounded-lg shadow-md p-6 lg:w-1/4">
                  <h2 className="text-lg font-semibold mb-4">Livrare</h2>
                  {currentUser?.addressData ? (
                    <div className="flex flex-col justify-between mb-2">
                      <span>
                        {currentUser.name} - {currentUser.tel}
                      </span>
                      <span>{currentUser.addressData.address}</span>
                      <span>
                        {currentUser.addressData.city},{" "}
                        {currentUser.addressData.postalCode}
                      </span>
                      <span>{currentUser.addressData.county}</span>
                      <button
                        onClick={() => setShowInfoInput(true)}
                        className="!absolute bottom-8 right-4  text-teal-800 justify-end"
                      >
                        <Pencil />
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowInfoInput(true)}
                      className="bg-teal-800 text-white rounded-md px-2 py-1 ml-2"
                    >
                      Adaugă adresă
                    </Button>
                  )}
                </div>

                <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 rounded-lg shadow-md p-6 lg:w-1/4">
                  <h2 className="text-lg font-semibold mb-4">Facturare</h2>
                  <div className="flex justify-between items-center mb-4">
                    <label className="flex flex-row items-center gap-2 select-none">
                      <input
                        type="radio"
                        name="billing"
                        checked={billingOption === false}
                        onChange={() => setBillingOption(false)}
                        className="accent-teal-800 hover:accent-teal-600"
                      />
                      Persoană fizică
                    </label>
                    <label className="flex flex-row items-center gap-2 select-none">
                      <input
                        type="radio"
                        name="billing"
                        checked={billingOption === true}
                        onChange={() => setBillingOption(true)}
                        className="accent-teal-800 hover:accent-teal-600"
                      />
                      Persoană juridică
                    </label>
                  </div>
                  {billingOption === true &&
                    (currentUser?.billingCompanyData ? (
                      <div className="flex flex-col justify-between mb-2">
                        <span>{currentUser.billingCompanyData.name}</span>
                        <span>{currentUser.billingCompanyData.address}</span>
                        <span>{currentUser.billingCompanyData.city}</span>
                        <span>{currentUser.billingCompanyData.county}</span>
                        <button
                          onClick={() => setBillingInput(true)}
                          className="!absolute bottom-8 right-4 text-teal-800 justify-end"
                        >
                          <Pencil />
                        </button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setBillingInput(true)}
                        className="bg-teal-800 text-white rounded-md px-2 py-1 ml-2"
                      >
                        Adaugă adresă de facturare
                      </Button>
                    ))}
                  {billingOption === false && (
                    <div className="flex flex-col justify-between mb-2">
                      <span>{currentUser.name}</span>
                    </div>
                  )}
                </div>

                <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 rounded-lg shadow-md p-6 lg:w-1/4">
                  <h2 className="text-lg font-semibold mb-4">Plata</h2>
                  <div className="flex justify-between items-center mb-4">
                    <label className="flex flex-row items-center gap-2 select-none">
                      <input
                        type="radio"
                        name="cash-or-card"
                        checked={payingOption === "cash"}
                        onChange={() => setPayingOption("cash")}
                        className="accent-teal-800 hover:accent-teal-600"
                      />
                      Ramburs, la livrare
                    </label>
                    <label className="flex flex-row items-center gap-2 select-none">
                      <input
                        type="radio"
                        name="cash-or-card"
                        checked={payingOption === "card"}
                        onChange={() => setPayingOption("card")}
                        className="accent-teal-800 hover:accent-teal-600"
                      />
                      Plată online
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-4 md:w-3/4">
                {cart.map((item) => {
                  const category = categories.find(
                    (c) => c.id == item.product.type,
                  );
                  return (
                    <div
                      key={item.product.id}
                      className="bg-white/50 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 rounded-md shadow-md flex relative"
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
                          <h3 className="text-lg font-bold">
                            {item.product.name}
                          </h3>
                          <p>
                            {category?.ro_short ||
                              category?.ro ||
                              "Fără categorie"}
                          </p>
                          <p>{item.product.mass}</p>
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
                        <IconButton
                          variant="text"
                          className="md:ml-4"
                          onClick={async () =>
                            await removeFromCart(item.product.id)
                          }
                          disabled={loadingItemId === item.product.id}
                        >
                          <Trash2 className="w-6 h-6 text-red-800 text-center" />
                        </IconButton>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="md:w-1/4">
                <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4">Sumar comandă</h2>
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>{total.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Cost livrare</span>
                    <span>{shippingCost.toFixed(2)} RON</span>
                  </div>
                  {/* Total mass check
                  <div className="flex justify-between mb-2">
                    <span>Greutate totală</span>
                    <span>{totalWeight.toFixed(2)} kg</span>
                  </div>
                  */}

                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">
                      {(total + shippingCost).toFixed(2)} RON
                    </span>
                  </div>
                  {currentUser ? (
                    <>
                      <Button
                        type="submit"
                        onClick={handlePlaceOrder}
                        disabled={
                          isPlacingOrder ||
                          !currentUser?.tel ||
                          !currentUser?.addressData ||
                          (billingOption === true &&
                            !currentUser?.billingCompanyData)
                        }
                        className="bg-teal-800 text-white py-2 px-4 rounded-lg mt-4 w-full"
                      >
                        {isPlacingOrder
                          ? "Se procesează..."
                          : "Trimite comanda"}
                      </Button>
                      {/*Validation of phone number and address*/}
                      {(!currentUser?.tel || !currentUser?.addressData) && (
                        <p className="text-red-600 text-sm mt-2 text-center">
                          Te rugăm să completezi numărul de telefon și adresa
                          pentru a putea finaliza comanda
                        </p>
                      )}
                      {/*Validation of billing address*/}
                      {billingOption === true &&
                        !currentUser?.billingCompanyData && (
                          <p className="text-red-600 text-sm mt-2 text-center">
                            Te rugăm să completezi adresa de facturare în pentru
                            a putea finaliza comanda.
                          </p>
                        )}
                    </>
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
          </>
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
      <UserInfoModal
        open={showInfoInput}
        onClose={() => setShowInfoInput(false)}
        currentUser={currentUser}
        setField={setField}
        setCurrentUser={setCurrentUser}
        loading={showingAddressModal}
        setLoading={setShowingAddressModal}
      />
      <BillingModal
        open={showBillingInput}
        onClose={() => setBillingInput(false)}
        currentUser={currentUser}
        setField={setField}
        setCurrentUser={setCurrentUser}
        loading={showingBillingModal}
        setLoading={setShowingBillingModal}
      />
      <CustomAlert
        error={!placeOrderSuccess}
        message={
          placeOrderSuccess
            ? "Comanda a fost plasată cu succes."
            : "Eroare la plasarea comenzii."
        }
        open={showAlert}
      />
    </>
  );
}
