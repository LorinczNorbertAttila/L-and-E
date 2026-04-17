import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../src/components/Header";
import { Pencil, X, Camera, ChevronDown } from "lucide-react";
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
import countiesData from "../src/assets/json/countiesList.json"; //Counties and cities json

const ERROR_MESSAGES = {
  selectCounty: "Vă rugăm să selectați un județ!",
  selectCity: "Vă rugăm să selectați un oraș!",
  saveAddressError: "Eroare la salvarea adresei",
  invalidPhoneNumber: "Numărul de telefon trebuie să conțină exact 10 cifre.",
  savePhoneError: "Nu s-a putut salva numărul de telefon: ",
  invalidAddress: "Adresa invalidă. Vă rugăm să introduceți o adresă validă.",
  invalidPostalCode: "Codul poștal trebuie să conțină exact 6 cifre.",
};

function LocationSelector({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
}) {
  const selectId = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="w-full sm:w-1/2 sm:pr-2">
      <label htmlFor={selectId} className="mb-2 px-2 block text-sm font-medium">
        {label}
      </label>
      <Select
        id={selectId}
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
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countyError, setCountyError] = useState("");
  const [cityError, setCityError] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [previewURL, setPreviewURL] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const countyOptions = useMemo(() => {
    return countiesData.map((county) => ({
      label: county.nume,
      value: county.nume,
    }));
  }, []);

  // Load saved address data when modal opens
  useEffect(() => {
    if (showAddressInput && currentUser?.addressData) {
      setSelectedCounty(currentUser.addressData.county || null);
      setCity(currentUser.addressData.city || "");
      setAddress(currentUser.addressData.address || "");
      setPostalCode(currentUser.addressData.postalCode || "");
    }
  }, [showAddressInput, currentUser?.addressData]);

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
      try {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.error("Failed to save to localStorage:", storageError);
      }
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
    setPostalCodeError("");

    if (!selectedCounty) {
      setCountyError(ERROR_MESSAGES.selectCounty);
      return;
    }
    if (!city) {
      setCityError(ERROR_MESSAGES.selectCity);
      return;
    }
    if (address.trim().length < 1) {
      setAddressError(ERROR_MESSAGES.invalidAddress);
      return;
    }
    if (!/^[0-9]{6}$/.test(postalCode)) {
      setPostalCodeError(ERROR_MESSAGES.invalidPostalCode);
      return;
    }

    try {
      setLoading(true);
      const addressData = {
        county: selectedCounty,
        city: city,
        address: address,
        postalCode: postalCode,
      };
      await setField("users", currentUser.uid, "addressData", addressData);
      const updatedUser = { ...currentUser, addressData: addressData };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.error("Failed to save to localStorage:", storageError);
      }

      setAddressInput(false);

      // Reset the state values after saving
      setSelectedCounty(null);
      setCity("");
      setAddress("");
      setPostalCode("");
    } catch (error) {
      setAddressError(ERROR_MESSAGES.saveAddressError + ": " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const closeModal = () => {
    setAddressInput(false);
    // Reset the state values after closing
    setSelectedCounty(null);
    setCity("");
    setAddress("");
    setPostalCode("");
    setCountyError("");
    setCityError("");
    setAddressError("");
    setPostalCodeError("");
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
                            const onlyNums = e.target.value.replace(
                              /[^0-9]/g,
                              "",
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
                  {currentUser?.addressData?.address ? (
                    <div className="flex justify-center sm:justify-between items-center w-full">
                      <h2>
                        {`${currentUser.addressData?.address}, ${currentUser.addressData?.city}, jud. ${currentUser.addressData?.county}${currentUser.addressData?.postalCode ? `, ${currentUser.addressData.postalCode}` : ""}`}
                      </h2>
                      <button
                        onClick={() => {
                          if (currentUser?.addressData) {
                            setSelectedCounty(
                              currentUser.addressData.county || null,
                            );
                            setCity(currentUser.addressData.city || "");
                            setAddress(currentUser.addressData.address || "");
                            setPostalCode(
                              currentUser.addressData.postalCode || "",
                            );
                          }
                          setAddressInput(true);
                        }}
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
                value={selectedCounty}
                onChange={setSelectedCounty}
                error={countyError}
              />
              <div className="w-full sm:w-1/2 sm:pr-2 relative">
                <label htmlFor="city" className="mt-2 px-2">
                  Localitate
                </label>
                <Input
                  label="Localitate"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!selectedCounty}
                />
              </div>
            </div>
            <label htmlFor="address" className="mt-2 px-2">
              Adresă
            </label>
            <Input
              id="address"
              label="Strada, numărul, etc."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {addressError && (
              <p className="text-red-600 text-sm mt-1">{addressError}</p>
            )}
            <label htmlFor="address" className="mt-2 px-2">
              Cod Poștal
            </label>
            <Input
              id="postalcode"
              label="Cod poștal"
              value={postalCode}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                if (onlyNums.length <= 6) {
                  setPostalCode(onlyNums);
                }
              }}
              maxLength="6"
            />
            {postalCodeError && (
              <p className="text-red-600 text-sm mt-1">{postalCodeError}</p>
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
              const file = e.target.files?.[0];
              if (file) {
                // Validate file size (max 5MB)
                const maxSizeMB = 5;
                const maxSizeBytes = maxSizeMB * 1024 * 1024;
                if (file.size > maxSizeBytes) {
                  setImageError(
                    `Imaginea este prea mare. Maxim ${maxSizeMB}MB permis.`,
                  );
                  return;
                }
                // Validate file type
                if (!file.type.startsWith("image/")) {
                  setImageError(
                    "Vă rugăm să selectați un fișier imagine valid.",
                  );
                  return;
                }
                setImageError("");
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
                  selectedImage,
                );
                const updatedUser = { ...currentUser, img: url };
                await setField("users", currentUser.uid, "img", url);
                setCurrentUser(updatedUser);
                try {
                  localStorage.setItem(
                    "currentUser",
                    JSON.stringify(updatedUser),
                  );
                } catch (storageError) {
                  console.error(
                    "Failed to save to localStorage:",
                    storageError,
                  );
                }
                setPreviewURL(null);
                setSelectedImage(null);
                setShowImageModal(false);
              } catch (err) {
                setImageError(
                  "Eroare la încărcarea imaginii de profil: " +
                    (err?.message || err),
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
