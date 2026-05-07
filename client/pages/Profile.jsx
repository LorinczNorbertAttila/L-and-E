import React, { useState, useEffect, useMemo } from "react";
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
import UserInfoModal from "../src/components/UserInfoModal";

export default function Profile() {
  const { currentUser, logout, setField, setCurrentUser } = useAuth();
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [showInfoInput, setShowInfoInput] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [previewURL, setPreviewURL] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

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

  //Blob cleanup function
  const cleanupPreviewURL = () => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }
  };

  return (
    <>
      <header className="p-4" />
      <div className="pb-20">
        <Header />
      </div>
      <div className="py-1 flex flex-col items-center sm:py-12">
        <div className="bg-white overflow-hidden shadow rounded-2xl border item mx-4 sm:max-w-md">
          <div className="flex justify-between items-center px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mr-4">
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
            <dl className="divide-y divide-gray-200">
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
                  <div className="flex sm:justify-between items-center w-full">
                    <span>{currentUser?.tel}</span>
                  </div>
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Adresă</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentUser?.addressData?.address ? (
                    <div className="flex justify-center sm:justify-between items-center w-full">
                      <span>
                        {`${currentUser.addressData?.address}, ${currentUser.addressData?.city}, jud. ${currentUser.addressData?.county}${currentUser.addressData?.postalCode ? `, ${currentUser.addressData.postalCode}` : ""}`}
                      </span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowInfoInput(true)}
                      className="bg-teal-800 text-white rounded-md px-2 py-1 ml-2"
                    >
                      Adaugă adresă
                    </Button>
                  )}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 flex items-center justify-between">
                <Button
                  size="sm"
                  disabled={loading}
                  onClick={handleLogout}
                  className="bg-teal-800 rounded-md"
                >
                  Log out
                </Button>
                <div></div>
                <button
                  onClick={() => setShowInfoInput(true)}
                  className=" text-teal-800 justify-self-end"
                >
                  <Pencil />
                </button>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/*Address Modal*/}
      <UserInfoModal
        open={showInfoInput}
        onClose={() => setShowInfoInput(false)}
        currentUser={currentUser}
        setField={setField}
        setCurrentUser={setCurrentUser}
        loading={loading}
        setLoading={setLoading}
      />

      {/*Image Modal*/}
      <Dialog open={showImageModal} handler={() => setShowImageModal(false)}>
        <DialogHeader>
          Schimbă poza de profil{" "}
          <IconButton
            variant="text"
            onClick={() => {
              cleanupPreviewURL();
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
                cleanupPreviewURL();
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
