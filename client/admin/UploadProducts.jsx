import React, { useState, useRef } from "react";
import Header from "../src/components/Header";
import EditableProductCard from "../src/components/EditableProductCard";
import { useCategory } from "../src/contexts/CategoryContext";
import { useAuth } from "../src/contexts/AuthContext";
import { Button } from "@material-tailwind/react";
import { uploadProductImage } from "../src/firebase/storage";

// Helper function: removes fields with null values from an object
function removeNullFields(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null));
}

export default function UploadProducts() {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info"); // "info" | "success" | "error"
  const [previewProducts, setPreviewProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { categories } = useCategory();
  const { firebaseUser } = useAuth();
  const [csvErrors, setCsvErrors] = useState([]);
  const [imageUploadErrors, setImageUploadErrors] = useState([]);

  const fileInputRef = useRef();

  const handleFile = async (e) => {
    const fileInput = e.target;
    const file = fileInput.files[0];
    if (!file) return;

    fileInput.value = "";

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setStatusType("info");
      setStatus("Procesare...");
      setCsvErrors([]);
      if (!firebaseUser) throw new Error("Neautentificat");

      const token = await firebaseUser.getIdToken();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/process-file`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok && data.data) {
        setPreviewProducts(data.data);
        setStatusType("success");
        setStatus(
          `Au fost încărcate ${data.data.length} produse pentru previzualizare`
        );
      } else {
        setStatusType("error");
        setStatus(data.error || "A apărut o eroare");
        setCsvErrors(data.errors || []);
      }
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatus("Eroare: " + err.message);
      setCsvErrors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSave = async () => {
    const hasInvalidProduct = previewProducts.some((p) => {
      return (
        !p.name?.trim() ||
        p.price === "" ||
        isNaN(p.price) ||
        p.price < 0 ||
        p.quantity === "" ||
        isNaN(p.quantity) ||
        p.quantity < 0 ||
        p.type === undefined ||
        p.type === null
      );
    });

    if (hasInvalidProduct) {
      setStatusType("error");
      setStatus("Eroare: Verifică câmpurile obligatorii.");
      return;
    }
    setImageUploadErrors([]);
    try {
      setLoading(true);
      setStatusType("info");
      setStatus("Salvare în curs...");
      const token = await firebaseUser.getIdToken();

      const updatedProducts = [];
      const imageErrors = [];

      for (const product of previewProducts) {
        if (product.selectedImageFile) {
          try {
            const url = await uploadProductImage(product.selectedImageFile);
            //Filter the selectedImage field, no need in Firestore
            const { selectedImageFile, ...cleanProduct } = product;
            updatedProducts.push(
              removeNullFields({
                ...cleanProduct,
                imageUrl: url,
              })
            );
          } catch (err) {
            imageErrors.push({
              name: product.name,
              message:
                err.message || "Eroare necunoscută la încărcarea imaginii",
            });
            const { selectedImageFile, ...cleanProduct } = product;
            updatedProducts.push(
              removeNullFields({
                ...cleanProduct,
                imageUrl: url,
              })
            );
          }
        } else {
          const { selectedImageFile, ...cleanProduct } = product;
          updatedProducts.push(removeNullFields(cleanProduct));
        }
      }
      setImageUploadErrors(imageErrors);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ products: updatedProducts }),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        let msg = `${data.created} produse noi salvate, ${data.updated} actualizate.`;
        if (data.errors && data.errors.length > 0) {
          msg += `\n Produse cu erori: ${data.errors
            .map((e) => e.id)
            .join(", ")}.`;
        }
        if (imageErrors.length > 0) {
          msg += `\n Imagini care nu au putut fi încărcate: ${imageErrors
            .map((e) => e.name)
            .join(", ")}.`;
        }
        setStatusType(
          (data.errors && data.errors.length > 0) || imageErrors.length > 0
            ? "error"
            : "success"
        );
        setStatus(msg);
        setPreviewProducts([]);
      } else {
        setStatusType("error");
        setStatus("Eroare la salvare: " + (data.error || "Eroare necunoscută"));
      }
    } catch (err) {
      setStatusType("error");
      setStatus("Eroare la salvare: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (index, updatedProduct) => {
    const newProducts = [...previewProducts];
    newProducts[index] = updatedProduct;
    setPreviewProducts(newProducts);
  };

  const handleDeleteProduct = (index) => {
    const updated = [...previewProducts];
    updated.splice(index, 1);
    setPreviewProducts(updated);
  };

  // Status color
  const statusColor =
    statusType === "success"
      ? "text-green-700 bg-green-100 "
      : statusType === "error"
      ? "text-red-500 bg-red-100"
      : "text-black";

  return (
    <>
      <header className="p-4" />
      <div className="pb-4">
        <Header />
      </div>
      <div className="min-h-screen flex flex-col items-center justify-start p-4 gap-10">
        <div className="flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-2xl p-6 rounded-md shadow-md">
          <h1>CSV upload:</h1>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
            disabled={loading}
          />
          <Button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={loading}
            className="mb-2"
          >
            {loading ? "Procesare..." : "Selectează fișier CSV"}
          </Button>
          <p className={`mt-2 font-semibold px-4 py-2 ${statusColor}`}>
            {status}
          </p>
          {csvErrors.length > 0 && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
              <div className="font-bold mb-1">
                Erori la procesarea CSV-ului:
              </div>
              <ul className="list-disc pl-5">
                {csvErrors.map((err, idx) => (
                  <li key={idx}>
                    {typeof err === "string"
                      ? err
                      : `Linia ${err.row ?? "?"}: ${
                          err.message ?? JSON.stringify(err)
                        }`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {imageUploadErrors.length > 0 && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
              <div className="font-bold mb-1">
                Erori la încărcarea imaginilor:
              </div>
              <ul className="list-disc pl-5">
                {imageUploadErrors.map((err, idx) => (
                  <li key={idx}>
                    {err.name ? <b>{err.name}:</b> : null} {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-6 justify-center mt-8">
          {previewProducts.map((product, index) => (
            <EditableProductCard
              key={product.id ?? index}
              index={index}
              product={product}
              onChange={handleProductChange}
              onDelete={handleDeleteProduct}
              categories={categories}
            />
          ))}
        </div>
        <Button
          className="mt-6"
          onClick={handleFinalSave}
          disabled={previewProducts.length === 0 || loading}
        >
          {loading ? "Salvare în curs..." : "Salvează în baza de date"}
        </Button>
      </div>
    </>
  );
}
