import React, { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../src/components/Header";
import { Pencil, X } from "lucide-react";
import {
  Button,
  IconButton,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  Select,
  Option,
  DialogFooter,
  Avatar,
} from "@material-tailwind/react";
import countiesData from "../src/assets/json/judete.json"; //Counties and cities json

export default function Profile() {
  const { currentUser, logout, setField, setCurrentUser } = useAuth();
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showAddressInput, setAddressInput] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [address, setAddress] = useState("");
  const [countyError, setCountyError] = useState("");
  const [cityError, setCityError] = useState("");
  const navigate = useNavigate();

  const [countyOptions, setCountyOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  useEffect(() => {
    // Load counties
    const countyOptions = countiesData.judete.map((county) => ({
      label: county.nume,
      value: county.nume,
      cities: county.localitati.map((city) => ({
        label: city.nume,
        value: city.nume,
      })),
    }));
    setCountyOptions(countyOptions);
  }, []);

  useEffect(() => {
    // If the county changes, update the cities
    if (selectedCounty) {
      const county = countyOptions.find((c) => c.value === selectedCounty);
      setCityOptions(county ? county.cities : []);
      setSelectedCity(null); // Reset city when county changes
    }
  }, [selectedCounty, countyOptions]);

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

  // Function to handle adding phone number
  async function handleTel(e) {
    e.preventDefault();
    try {
      setPhoneError(""); // Reset error message
      setLoading(true);
      await setField("users", currentUser.uid, "tel", phoneNumber); // Set the phone number

      // Update the `currentUser` object locally to reflect the new phone number
      setCurrentUser({
        ...currentUser,
        tel: phoneNumber, // Update the local user object with the new phone number
      });

      setShowPhoneInput(false); // Hide the input field after saving
    } catch (error) {
      setPhoneError("Failed to save phone number: " + error.message); // Set error message if failed
    }
    setLoading(false);
  }

  //Function to handle address saving
  async function handleAddress(e) {
    e.preventDefault();
    setCountyError(""); // Reset error message
    setCityError(""); // Reset error message
    setAddressError(""); // Reset error message
    let isValid = true;
    if (!selectedCounty) {
      setCountyError("Vă rugăm să selectați un județ!");
      isValid = false;
    }
    if (!selectedCity) {
      setCityError("Vă rugăm să selectați un oraș!");
      isValid = false;
    }
    if (address.trim() === "") {
      setAddressError("Vă rugăm să introduceți o adresă detaliată!");
      isValid = false;
    }
    if (!isValid) return; // Ha bármelyik mező hibás, ne folytassuk
    try {
      setLoading(true);
      const fullAddress =
        address + ", " + selectedCity + ", jud." + selectedCounty;
      await setField("users", currentUser.uid, "address", fullAddress); // Set the address
      // Update the `currentUser` object locally to reflect the new address
      setCurrentUser({
        ...currentUser,
        address: fullAddress, // Update the local user object with the new address
      });

      setAddressInput(false); // Hide the input field after saving
    } catch (error) {
      setAddressError("Eroare la salvarea adresei: " + error.message); // Set error message if failed
    }
    setLoading(false);
  }

  const closeModal = () => {
    setAddressInput(false);
  };

  return (
    <>
      <header className="p-4" />
      <div className="pb-20">
        <Header />
      </div>
      <div className="py-1 flex flex-col items-center sm:py-12">
        <div className="bg-white overflow-hidden shadow rounded-2xl border item">
          <div className="flex justify-between items-center px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Datele contului
            </h3>
            <Avatar
              src={currentUser?.img || import.meta.env.VITE_DEFAULT_PICTURE}
              size="xl"
              alt="profile"
            />
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nume</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentUser?.name}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentUser?.email}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex justify-center sm:justify-between items-center w-full">
                    {showPhoneInput ? (
                      <div className="relative flex w-full max-w-[24rem]">
                        <Input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                            if (onlyNums.length <= 10) {
                              setPhoneNumber(onlyNums);
                            }
                          }}
                          label="Număr telefon"
                          className="pr-20"
                          containerProps={{
                            className: "min-w-0",
                          }}
                        />
                        <Button
                          onClick={handleTel}
                          size="sm"
                          disabled={!phoneNumber}
                          className="!absolute right-1 top-1 rounded bg-teal-800 disabled:bg-gray-400"
                        >
                          Modifică
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span>{currentUser?.tel}</span>
                        <button
                          onClick={() => setShowPhoneInput(true)}
                          className="text-teal-800 ml-6"
                        >
                          <Pencil />
                        </button>
                      </>
                    )}
                  </div>
                  {phoneError && <p className="text-red-600 mt-2">{error}</p>}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Adresă</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentUser?.address ? (
                    <div className="flex justify-center sm:justify-between items-center w-full">
                      <h2>{currentUser?.address}</h2>
                      <button
                        onClick={() => setAddressInput(true)}
                        className="text-teal-800 ml-6"
                      >
                        <Pencil />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddressInput(true)}
                      className="bg-teal-800 text-white rounded-md px-2 py-1 ml-2"
                    >
                      Adaugă adresă
                    </button>
                  )}
                </dd>
                {addressError && <p className="text-red-600 mt-2">{error}</p>}
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <Button
                  size="sm"
                  disabled={loading}
                  onClick={handleLogout}
                  className="bg-teal-800 rounded-md"
                >
                  Log out
                </Button>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/*Modal*/}
      <Dialog
        open={showAddressInput}
        handler={closeModal}
        className="w-full max-w-xs sm:max-w-md"
      >
        <DialogHeader>
          <IconButton
            variant="text"
            onClick={closeModal}
            className="!absolute top-2 right-2 text-teal-800"
          >
            <X />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleAddress} className="flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between">
              <div className="w-full sm:w-1/2 sm:pr-2">
                <h2 className="mb-2 px-2">Județ</h2>
                <Select
                  label="Alege județul"
                  onChange={setSelectedCounty}
                  className="w-full"
                >
                  {countyOptions.map((county, index) => (
                    <Option
                      key={`${county.value}-${index}`}
                      value={county.value}
                    >
                      {county.label}
                    </Option>
                  ))}
                </Select>
                {countyError && (
                  <p className="text-red-600 text-sm mt-1">{countyError}</p>
                )}
              </div>
              <div className="w-full sm:w-1/2 sm:pl-2">
                <h2 className="mb-2 px-2">Oraș</h2>
                <Select
                  key={selectedCounty}
                  label="Alege orașul"
                  onChange={setSelectedCity}
                  className="w-full"
                  disabled={!selectedCounty}
                >
                  {cityOptions.map((city, index) => (
                    <Option key={`${city.value}-${index}`} value={city.value}>
                      {city.label}
                    </Option>
                  ))}
                </Select>
                {cityError && (
                  <p className="text-red-600 text-sm mt-1">{cityError}</p>
                )}
              </div>
            </div>
            <h2 className="mt-2 px-2">Adresă</h2>
            <textarea
              onChange={(e) => setAddress(e.target.value)}
              className="border rounded h-24 px-1 py-1 mt-2 flex-grow"
              style={{ resize: "none" }}
            />
            {addressError && (
              <p className="text-red-600 text-sm mt-1">{addressError}</p>
            )}
            <DialogFooter className="mt-2 flex justify-center">
              <Button
                size="sm"
                onClick={handleAddress}
                className="bg-teal-800 text-white rounded-md"
              >
                Salvează
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </Dialog>
    </>
  );
}
