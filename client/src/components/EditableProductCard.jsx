import React, { useState, useEffect, useRef } from "react";
import RippleButton from "./RippleButton";

export default function EditableProductCard({
  product,
  index,
  onChange,
  onDelete,
  categories,
}) {
  const [errors, setErrors] = useState({});
  const [previewURL, setPreviewURL] = useState(product.imageUrl || "");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // preview image
  useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setPreviewURL(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewURL(product.imageUrl || "");
    }
  }, [selectedImage, product.imageUrl]);

  // Verification
  useEffect(() => {
    const newErrors = {};
    if (!product.name?.trim()) newErrors.name = "Numele este obligatoriu.";
    if (product.price === "" || isNaN(product.price))
      newErrors.price = "Preț valid necesar.";
    if (product.quantity === "" || isNaN(product.quantity))
      newErrors.quantity = "Cantitate validă necesară.";
    if (!product.type && product.type !== 0)
      newErrors.type = "Selectarea categoriei este obligatorie.";
    setErrors(newErrors);
  }, [product]);

  //Change handleing
  const handleChange = (field, value) => {
    onChange(index, { ...product, [field]: value });
  };

  // File select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    // no Firebase save, only change it locally
    onChange(index, {
      ...product,
      imageUrl: "",
      selectedImageFile: file,
    });
  };

  const onImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative flex flex-col bg-clip-border rounded-xl text-gray-700 bg-white bg-opacity-90 p-4 w-80 shadow-md">
      {/* Image preview */}
      <div
        className="relative bg-clip-border mx-4 rounded-xl overflow-hidden bg-white text-gray-700 shadow-lg -mt-6 h-40 flex justify-center"
        onClick={onImageClick}
      >
        <img
          src={previewURL}
          alt={product.name || "Imagine produs"}
          className="object-contain h-full cursor-pointer"
          style={{ userSelect: "none" }}
        />
      </div>

      <div className="flex flex-col gap-1 p-6">
        <div>
          <label htmlFor="name" className="text-xs px-2">
            Nume produs
          </label>
          <input
            autoComplete="off"
            id="name"
            type="text"
            required
            className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
            value={product.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="mass" className="text-xs px-2">
            Greutate
          </label>
          <input
            autoComplete="off"
            id="mass"
            type="text"
            required
            className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
            value={product.mass}
            onChange={(e) => handleChange("mass", e.target.value)}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="price" className="text-xs px-2">
            Preț (RON) *
          </label>
          <input
            autoComplete="off"
            id="price"
            type="number"
            required
            className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
            value={product.price ?? ""}
            onChange={(e) =>
              handleChange(
                "price",
                e.target.value === "" ? "" : parseFloat(e.target.value),
              )
            }
          />
          {errors.price && (
            <p className="text-red-500 text-xs">{errors.price}</p>
          )}
        </div>
        <div>
          <label htmlFor="stock" className="text-xs px-2">
            Stoc
          </label>
          <input
            autoComplete="off"
            id="stock"
            type="number"
            required
            className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
            value={product.quantity ?? ""}
            onChange={(e) =>
              handleChange(
                "quantity",
                e.target.value === "" ? "" : parseInt(e.target.value),
              )
            }
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs">{errors.quantity}</p>
          )}
        </div>
        <label htmlFor="description" className="text-xs px-2">
          Descriere
        </label>
        <input
          autoComplete="off"
          id="description"
          type="text"
          className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100 p-3"
          value={product.description ?? ""}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div>
          <label htmlFor="categorySelect" className="text-xs px-2">
            Categorie
          </label>
          <select
            id="categorySelect"
            onChange={(e) => handleChange("type", parseInt(e.target.value))}
            value={String(product.type)}
            className="h-10 w-full text-sm rounded-lg border-2 border-gray-300 text-slate-700 focus:outline-hidden focus:border-green-600"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.ro_short || cat.ro}
              </option>
            ))}
          </select>
          {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
        </div>
        {onDelete && (
          <RippleButton
            variant="secondary"
            onClick={() => onDelete(index)}
            className="w-full mt-4 px-4 py-2 border-red-600 text-red-600"
          >
            Șterge
          </RippleButton>
        )}
      </div>
    </div>
  );
}
