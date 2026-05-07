import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import {
  Alert,
  Button,
  IconButton,
  Input,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import CustomAlert from "./CustomAlert";
import countiesData from "../assets/json/countiesList.json";

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
      <label htmlFor={selectId} className="mt-2 px-2">
        {label}
      </label>
      <Select
        id={selectId}
        onChange={onChange}
        value={value}
        className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-blue-gray-700 focus:outline-none focus:border-green-600"
        labelProps={{
          className: "hidden",
        }}
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
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [city, setCity] = useState("");
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

  // Generate county options
  const countyOptions = useMemo(() => {
    return countiesData.map((county) => ({
      label: county.nume,
      value: county.nume,
    }));
  }, []);

  // Load saved data when modal opens
  useEffect(() => {
    if (open) {
      setName(currentUser?.name || "");
      setPhoneNumber(currentUser?.tel || "");
      if (currentUser?.addressData) {
        setSelectedCounty(currentUser.addressData.county || null);
        setCity(currentUser.addressData.city || "");
        setAddress(currentUser.addressData.address || "");
        setPostalCode(currentUser.addressData.postalCode || "");
      }
    }
  }, [
    open,
    currentUser?.name,
    currentUser?.tel,
    currentUser?.addressData,
  ]);

  const closeModal = () => {
    setName("");
    setPhoneNumber("");
    setSelectedCounty(null);
    setCity("");
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
    if (!city.trim()) {
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
        city: city.trim(),
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

  return (
    <>
      <Dialog
        open={open}
        handler={closeModal}
        aria-labelledby="address-modal-title"
        aria-describedby="address-modal-description"
        className="w-full max-w-xs sm:max-w-md"
      >
        <DialogHeader id="address-modal-title">
          Date personale
          <IconButton
            variant="text"
            onClick={closeModal}
            className="!absolute top-2 right-2 text-teal-800"
          >
            <X />
          </IconButton>
        </DialogHeader>
        <DialogBody id="address-modal-description">
          <form onSubmit={handleSave} className="flex flex-col">
            <label htmlFor="fullName" className="px-2">
              Nume și prenume
            </label>
            <input
              autoComplete="name"
              id="fullName"
              type="text"
              required
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-blue-gray-700 focus:outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 mb-2 p-3"
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
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-blue-gray-700 focus:outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 mb-2 p-3"
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
              <div className="w-full sm:w-1/2 sm:pr-2 relative">
                <label htmlFor="city" className="mt-2 px-2">
                  Localitate
                </label>
                <input
                  autoComplete="off"
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-blue-gray-700 focus:outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!selectedCounty}
                />
                {cityError && (
                  <p className="text-red-600 text-sm mt-1">{cityError}</p>
                )}
              </div>
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
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-blue-gray-700 focus:outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
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
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-blue-gray-700 focus:outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
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
            <DialogFooter className="mt-2 flex justify-center">
              <Button
                size="sm"
                type="submit"
                disabled={loading}
                className="bg-teal-800 text-white rounded-md"
              >
                Actualizează
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </Dialog>
      <CustomAlert
        error={!saveSuccess}
        message={
          saveSuccess
            ? "Datele au fost salvate cu succes."
            : "Eroare la salvarea datelor."
        }
        open={showAlert}
      />
    </>
  );
}
