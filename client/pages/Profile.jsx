import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../src/components/Header";
import { Pencil, X, Camera } from "lucide-react";
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
import { uploadProfilePicture } from "../src/firebase/storage";
import countiesData from "../src/assets/json/judete.json"; //Counties and cities json

const ERROR_MESSAGES = {
  selectCounty: "Vă rugăm să selectați un județ!",
  selectCity: "Vă rugăm să selectați un oraș!",
  saveAddressError: "Eroare la salvarea adresei",
  invalidPhoneNumber: "Numărul de telefon trebuie să conțină exact 10 cifre.",
  savePhoneError: "Nu s-a putut salva numărul de telefon: ",
  invalidAddress: "Adresa trebuie să conțină cel puțin 5 caractere.",
};

function LocationSelector({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
}) {
  return (
    <div className="w-full sm:w-1/2 sm:pr-2">
      <h2 className="mb-2 px-2">{label}</h2>
      <Select
        label={`Alege ${label.toLowerCase()}`}
        onChange={onChange}
        value={value}
        className="w-full"
        disabled={disabled}
      >
        {options.map((option, index) => (
          <Option key={`${option.value}-${index}`} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [previewURL, setPreviewURL] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const countyOptions = useMemo(() => {
    return countiesData.judete.map((county) => ({
      label: county.nume,
      value: county.nume,
      cities: county.localitati.map((city) => ({
        label: city.nume,
        value: city.nume,
      })),
    }));
  }, []);

  const [cityOptions, setCityOptions] = useState([]);

  useEffect(() => {
    // If the county changes, update the cities
    if (selectedCounty) {
      const county = countyOptions.find((c) => c.value === selectedCounty);
      setCityOptions(county ? county.cities : []);
      setSelectedCity(null); // Reset city when county changes
    }
  }, [selectedCounty, countyOptions]);

  const validatePhoneNumber = (number) => /^[0-9]{10}$/.test(number);

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

      if (!validatePhoneNumber(phoneNumber)) {
        setPhoneError(ERROR_MESSAGES.invalidPhoneNumber); // Set error message if phone number is invalid
        return;
      }

      await setField("users", currentUser.uid, "tel", phoneNumber); // Set the phone number

      // Update the `currentUser` object locally to reflect the new phone number
      const updatedUser = { ...currentUser, tel: phoneNumber };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setShowPhoneInput(false); // Hide the input field after saving
    } catch (error) {
      setPhoneError(ERROR_MESSAGES.savePhoneError + error.message); // Set error message if failed
    }
    setLoading(false);
  }

  //Function to handle address saving
  async function handleAddress(e) {
    e.preventDefault();
    setCountyError("");
    setCityError("");
    setAddressError("");

    if (!selectedCounty) {
      setCountyError(ERROR_MESSAGES.selectCounty);
      return;
    }
    if (!selectedCity) {
      setCityError(ERROR_MESSAGES.selectCity);
      return;
    }
    if (address.trim().length < 5) {
      setAddressError(ERROR_MESSAGES.invalidAddress);
      return;
    }

    try {
      setLoading(true);
      const fullAddress = `${address}, ${selectedCity}, jud. ${selectedCounty}`;
      await setField("users", currentUser.uid, "address", fullAddress);
      const updatedUser = { ...currentUser, address: fullAddress };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setAddressInput(false);

      // Reset the state values after saving
      setSelectedCounty(null);
      setSelectedCity(null);
      setAddress("");
    } catch (error) {
      setAddressError(ERROR_MESSAGES.saveAddressError + ": " + error.message);
    } finally {
      setLoading(false);
    }
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
            <div className="relative group">
              <Avatar
                src={currentUser?.img || import.meta.env.VITE_DEFAULT_PICTURE}
                size="xl"
                alt="profile"
              />
              <div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                onClick={() => setShowImageModal(true)}
              >
                <Camera className="text-white w-6 h-6" />
              </div>
            </div>
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
                            setPhoneError("");
                            setLoading(false);
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
                          disabled={!phoneNumber || loading}
                          className="!absolute right-1 top-1 rounded bg-teal-800 disabled:bg-gray-400"
                        >
                          Modifică
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span>{currentUser?.tel}</span>
                        <button
                          data-testid="modify-phone"
                          onClick={() => {
                            setPhoneNumber(currentUser?.tel || "");
                            setShowPhoneInput(true);
                          }}
                          className="text-teal-800 ml-6"
                        >
                          <Pencil />
                        </button>
                      </>
                    )}
                  </div>
                  {phoneError && (
                    <p className="text-red-600 mt-2">{phoneError}</p>
                  )}
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
                    <Button
                      onClick={() => setAddressInput(true)}
                      className="bg-teal-800 text-white rounded-md px-2 py-1 ml-2"
                    >
                      Adaugă adresă
                    </Button>
                  )}
                </dd>
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

      {/*Address Modal*/}
      <Dialog
        open={showAddressInput}
        handler={closeModal}
        aria-labelledby="address-modal-title"
        aria-describedby="address-modal-description"
        className="w-full max-w-xs sm:max-w-md"
      >
        <DialogHeader id="address-modal-title">
          Adaugă Adresă
          <IconButton
            variant="text"
            onClick={closeModal}
            className="!absolute top-2 right-2 text-teal-800"
          >
            <X />
          </IconButton>
        </DialogHeader>
        <DialogBody id="address-modal-description">
          <form onSubmit={handleAddress} className="flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between">
              <LocationSelector
                label="Județ"
                options={countyOptions}
                onChange={setSelectedCounty}
                error={countyError}
              />
              <LocationSelector
                label="Oraș"
                options={cityOptions}
                onChange={setSelectedCity}
                disabled={!selectedCounty}
                error={cityError}
              />
            </div>
            <label htmlFor="address" className="mt-2 px-2">
              Adresă
            </label>
            <textarea
              id="address"
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
                type="submit"
                disabled={loading}
                className="bg-teal-800 text-white rounded-md"
              >
                Salvează
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </Dialog>

      {/*Image Modal*/}
      <Dialog open={showImageModal} handler={() => setShowImageModal(false)}>
        <DialogHeader>
          Schimbă poza de profil{" "}
          <IconButton
            variant="text"
            onClick={() => {
              setPreviewURL(null);
              setSelectedImage(null);
              setShowImageModal(false);
            }}
            className="!absolute top-2 right-2 text-teal-800"
          >
            <X />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          {imageError && (
            <p className="text-red-600 text-sm mt-2">{imageError}</p>
          )}
          {previewURL && (
            <img
              src={previewURL}
              alt="Preview"
              className="rounded-full mx-auto w-40 h-40 object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedImage(file);
                setPreviewURL(URL.createObjectURL(file));
              }
            }}
            className="mt-4"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            className="bg-teal-800 text-white"
            disabled={!selectedImage || loading}
            onClick={async () => {
              if (!selectedImage) return;
              setLoading(true);
              setImageError("");
              try {
                const url = await uploadProfilePicture(
                  currentUser.uid,
                  selectedImage
                );
                const updatedUser = { ...currentUser, img: url };
                await setField("users", currentUser.uid, "img", url);
                setCurrentUser(updatedUser);
                localStorage.setItem(
                  "currentUser",
                  JSON.stringify(updatedUser)
                );
                setPreviewURL(null);
                setSelectedImage(null);
                setShowImageModal(false);
              } catch (err) {
                setImageError(
                  "Eroare la încărcarea imaginii de profil: " +
                    (err?.message || err)
                );
              }
              setLoading(false);
            }}
          >
            Salvează
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
