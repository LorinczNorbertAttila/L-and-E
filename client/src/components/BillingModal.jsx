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
  saveError: "Eroare la salvarea datelor: ",
  invalidName: "Numele companiei nu poate fi gol.",
  invalidCUI: "Codul fiscal / CUI trebuie să aibă între 2 și 20 de caractere.",
  invalidNrRegCom:
    "Numărul de înregistrare la Registrul Comerțului nu poate fi gol.",
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

export default function BillingModal({
  open,
  onClose,
  currentUser,
  setField,
  setCurrentUser,
  loading,
  setLoading,
}) {
  const [companyName, setCompanyName] = useState("");
  const [cui, setCui] = useState("");
  const [nrRegCom, setNrRegCom] = useState("");
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [cuiError, setCuiError] = useState("");
  const [nrRegComError, setNrRegComError] = useState("");
  const [countyError, setCountyError] = useState("");
  const [cityError, setCityError] = useState("");
  const [addressError, setAddressError] = useState("");
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
      setCompanyName(currentUser?.billingCompanyData?.name || "");
      setCui(currentUser?.billingCompanyData?.cui || "");
      setNrRegCom(currentUser?.billingCompanyData?.nrRegCom || "");
      setSelectedCounty(currentUser?.billingCompanyData?.county || null);
      setCity(currentUser?.billingCompanyData?.city || "");
      setAddress(currentUser?.billingCompanyData?.address || "");
    }
  }, [open, currentUser?.billingCompanyData]);

  const closeModal = () => {
    setCompanyName("");
    setCui("");
    setNrRegCom("");
    setSelectedCounty(null);
    setCity("");
    setAddress("");
    setCompanyNameError("");
    setCuiError("");
    setNrRegComError("");
    setCountyError("");
    setCityError("");
    setAddressError("");
    onClose();
  };

  async function handleSave(e) {
    e.preventDefault();

    setCompanyNameError("");
    setCuiError("");
    setNrRegComError("");
    setCountyError("");
    setCityError("");
    setAddressError("");
    setSaveError("");

    //Validation
    if (!companyName.trim()) {
      setCompanyNameError(ERROR_MESSAGES.invalidName);
      return;
    }
    if (cui.trim().length < 2 || cui.trim().length > 20) {
      setCuiError(ERROR_MESSAGES.invalidCUI);
      return;
    }
    if (!nrRegCom.trim()) {
      setNrRegComError(ERROR_MESSAGES.invalidNrRegCom);
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

    try {
      setLoading(true);

      const updates = {
        billingCompanyData: {},
      };
      // Validation
      const currentBillingData = currentUser.billingCompanyData || {};

      const newBillingData = {
        name: companyName.trim(),
        cui: cui.trim(),
        nrRegCom: nrRegCom.trim(),
        county: selectedCounty,
        city: city.trim(),
        address: address.trim(),
      };

      const hasBillingChanged =
        currentBillingData.name !== newBillingData.name ||
        currentBillingData.cui !== newBillingData.cui ||
        currentBillingData.nrRegCom !== newBillingData.nrRegCom ||
        currentBillingData.county !== newBillingData.county ||
        currentBillingData.city !== newBillingData.city ||
        currentBillingData.address !== newBillingData.address;

      if (hasBillingChanged) {
        updates.billingCompanyData = newBillingData;
      }

      //No changes
      if (Object.keys(updates.billingCompanyData).length === 0) {
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
          Date de facturare
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
            <label htmlFor="cui" className="px-2">
              Code fiscal / CUI
            </label>
            <input
              autoComplete="off"
              id="cui"
              type="text"
              required
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-blue-gray-700 focus:outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 mb-2 p-3"
              value={cui}
              onChange={(e) => setCui(e.target.value)}
            />
            {cuiError && (
              <p className="text-red-600 text-sm mt-1">{cuiError}</p>
            )}
            <label htmlFor="companyName" className="px-2">
              Numele companiei
            </label>
            <input
              autoComplete="off"
              id="companyName"
              type="text"
              required
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-blue-gray-700 focus:outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 mb-2 p-3"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            {companyNameError && (
              <p className="text-red-600 text-sm mt-1">{companyNameError}</p>
            )}
            <label htmlFor="nrRegCom" className="px-2">
              Nr. Inregistrare Registrul Comertului
            </label>
            <input
              autoComplete="off"
              id="nrRegCom"
              type="text"
              required
              className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-blue-gray-700 focus:outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 mb-2 p-3"
              value={nrRegCom}
              onChange={(e) => setNrRegCom(e.target.value)}
            />
            {nrRegComError && (
              <p className="text-red-600 text-sm mt-1">{nrRegComError}</p>
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
