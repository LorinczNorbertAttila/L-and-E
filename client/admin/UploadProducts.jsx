import React, { useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import Header from "../src/components/Header";
import EditableProductCard from "../src/components/EditableProductCard";
import { useCategory } from "../src/contexts/CategoryContext";
import { useAuth } from "../src/contexts/AuthContext";
import { Button } from "@material-tailwind/react";

export default function UploadProducts() {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info"); // "info" | "success" | "error"
  const [previewProducts, setPreviewProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { categories } = useCategory();
  const { firebaseUser } = useAuth();

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
        setStatus(`Au fost încărcate ${data.data.length} produse pentru previzualizare`);
      } else {
        setStatusType("error");
        setStatus(data.error || "A apărut o eroare");
      }
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatus("Eroare: " + err.message);
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

    try {
      setLoading(true);
      setStatusType("info");
      setStatus("Salvare în curs...");
      const token = await firebaseUser.getIdToken();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ products: previewProducts }),
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
        setStatusType(data.errors && data.errors.length > 0 ? "error" : "success");
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
      <header>
        <div className="flex flex-row p-4 gap-4 justify-center items-center" />
      </header>
      <Header />
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
          <p className={`mt-2 font-semibold px-4 py-2 ${statusColor}`}>{status}</p>
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
