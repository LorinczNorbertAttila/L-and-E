import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import CustomAlert from "./CustomAlert";
import RippleButton from "./RippleButton";
import LocationSelector from "./LocationSelector";
import countiesData from "../assets/json/judete.json";

const ERROR_MESSAGES = {
  selectCounty: "Vă rugăm să selectați un județ!",
  selectCity: "Vă rugăm să selectați un oraș!",
  saveAddressError: "Eroare la salvarea adresei",
  invalidAddress: "Adresa invalidă. Vă rugăm să introduceți o adresă validă.",
  invalidPostalCode: "Codul poștal trebuie să conțină exact 6 cifre.",
  invalidPhoneNumber: "Numărul de telefon trebuie să conțină exact 10 cifre.",
  savePhoneError: "Nu s-a putut salva numărul de telefon: ",
  saveError: "Eroare la salvarea datelor: ",
  invalidName: "Numele complet nu poate fi gol.",
};

export default function UserInfoModal({
  open,
  onClose,
  currentUser,
  setField,
  setCurrentUser,
  loading,
  setLoading,
}) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [countyError, setCountyError] = useState("");
  const [cityError, setCityError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Generate county and city options
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
    }
  }, [selectedCounty, countyOptions]);

  // Load saved data when modal opens
  useEffect(() => {
    if (open) {
      setName(currentUser?.name || "");
      setPhoneNumber(currentUser?.tel || "");
      if (currentUser?.addressData) {
        setSelectedCounty(currentUser.addressData.county || "");
        setSelectedCity(currentUser.addressData.city || "");
        setAddress(currentUser.addressData.address || "");
        setPostalCode(currentUser.addressData.postalCode || "");
      }
    }
  }, [open, currentUser?.name, currentUser?.tel, currentUser?.addressData]);

  const closeModal = () => {
    setName("");
    setPhoneNumber("");
    setSelectedCounty("");
    setSelectedCity("");
    setAddress("");
    setPostalCode("");
    setNameError("");
    setPhoneError("");
    setCountyError("");
    setCityError("");
    setAddressError("");
    setPostalCodeError("");
    onClose();
  };

  async function handleSave(e) {
    e.preventDefault();

    setNameError("");
    setPhoneError("");
    setCountyError("");
    setCityError("");
    setAddressError("");
    setPostalCodeError("");
    setSaveError("");

    //Validation
    if (!name.trim()) {
      setNameError(ERROR_MESSAGES.invalidName);
      return;
    }
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setPhoneError(ERROR_MESSAGES.invalidPhoneNumber);
      return;
    }
    if (!selectedCounty) {
      setCountyError(ERROR_MESSAGES.selectCounty);
      return;
    }
    if (!selectedCity) {
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

      const updates = {};
      // Name changed
      if (name !== currentUser.name) {
        updates.name = name.trim();
      }
      // Phone number changed
      if (phoneNumber !== currentUser.tel) {
        updates.tel = phoneNumber;
      }
      // Address changed
      const currentAddressData = currentUser.addressData || {};
      const newAddressData = {
        county: selectedCounty,
        city: selectedCity,
        address: address.trim(),
        postalCode: postalCode,
      };
      const hasAddressChanged =
        currentAddressData.county !== newAddressData.county ||
        currentAddressData.city !== newAddressData.city ||
        currentAddressData.address !== newAddressData.address ||
        currentAddressData.postalCode !== newAddressData.postalCode;

      if (hasAddressChanged) {
        updates.addressData = newAddressData;
      }

      //No changes
      if (Object.keys(updates).length === 0) {
        closeModal();
        return;
      }

      await setField("users", currentUser.uid, updates);
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      } catch (storageError) {
        console.error("Failed to save to localStorage:", storageError);
      }

      setSaveSuccess(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
      closeModal();
    } catch (error) {
      setSaveSuccess(false);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
      setSaveError(ERROR_MESSAGES.saveError + ": " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Close modal with ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);

      // Get scrollbar width
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Prevent layout shift
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);

      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    };
  }, [open]);

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
      {/* Modal */}
      <div
        className={`relative w-full md:w-3/4 lg:w-3/5 max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl transition-all duration-400 ease-in-out ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="flex items-center shrink-0 p-4 text-slate-900 antialiased font-sans text-2xl font-semibold leading-snug">
          Datele personale
          {/* Close Button */}
          <RippleButton
            onClick={closeModal}
            className="absolute! top-2 right-2 z-10 text-teal-800"
            variant="icon"
          >
            <X />
          </RippleButton>
        </div>
        {/* Content */}
        <div className="relative p-4 text-slate-500 antialiased font-sans text-base font-light leading-relaxed">
          <form onSubmit={handleSave} className="flex flex-col">
            <label htmlFor="fullName" className="px-2">
              Nume și prenume
            </label>
            <input
              autoComplete="name"
              id="fullName"
              type="text"
              required
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 mb-2 p-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {nameError && (
              <p className="text-red-600 text-sm mt-1">{nameError}</p>
            )}
            <label htmlFor="phoneNumber" className="px-2">
              Număr de telefon
            </label>
            <input
              autoComplete="off"
              id="phoneNumber"
              type="tel"
              required
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 mb-2 p-3"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneError("");
                const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                if (onlyNums.length <= 10) {
                  setPhoneNumber(onlyNums);
                }
              }}
            />
            {phoneError && (
              <p className="text-red-600 text-sm mt-1">{phoneError}</p>
            )}
            <div className="flex flex-col sm:flex-row justify-between">
              <LocationSelector
                label="Județ"
                options={countyOptions}
                value={selectedCounty}
                onChange={setSelectedCounty}
                error={countyError}
              />
              <LocationSelector
                label="Oraș"
                options={cityOptions}
                value={selectedCity}
                onChange={setSelectedCity}
                disabled={!selectedCounty}
                error={cityError}
              />
            </div>
            <label htmlFor="address" className="mt-2 px-2">
              Adresă
            </label>
            <input
              autoComplete="off"
              id="address"
              name="address"
              type="text"
              required
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!selectedCounty}
            />
            {addressError && (
              <p className="text-red-600 text-sm mt-1">{addressError}</p>
            )}
            <label htmlFor="postalcode" className="mt-2 px-2">
              Cod Poștal
            </label>
            <input
              autoComplete="off"
              id="postalcode"
              name="postalcode"
              type="text"
              required
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
              value={postalCode}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                if (onlyNums.length <= 6) {
                  setPostalCode(onlyNums);
                }
              }}
              maxLength="6"
              disabled={!selectedCounty}
            />
            {postalCodeError && (
              <p className="text-red-600 text-sm mt-1">{postalCodeError}</p>
            )}
            {saveError && (
              <p className="text-red-600 text-sm mt-1">{saveError}</p>
            )}
            <div className="items-center shrink-0 flex-wrap p-4 text-slate-500 mt-2 flex justify-center">
              <RippleButton
                variant="primary"
                type="submit"
                disabled={loading}
                className="bg-teal-800 px-4 py-2"
              >
                Actualizează
              </RippleButton>
            </div>
          </form>
        </div>
        <CustomAlert
          error={!saveSuccess}
          message={
            saveSuccess
              ? "Datele au fost salvate cu succes."
              : "Eroare la salvarea datelor."
          }
          open={showAlert}
        />
      </div>
    </div>
  );
}
