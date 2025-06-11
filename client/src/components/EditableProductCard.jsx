import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  Option,
  Button,
} from "@material-tailwind/react";

export default function EditableProductCard({
  product,
  index,
  onChange,
  onDelete,
  categories,
}) {
  const [errors, setErrors] = useState({});

  // Ellenőrzés minden változáskor
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

  const handleChange = (field, value) => {
    onChange(index, { ...product, [field]: value });
  };

  return (
    <Card className="bg-white bg-opacity-90 p-4 w-80 shadow-md">
      {/* Previzualizare imagine */}
      <CardHeader className="h-40 flex justify-center">
        <img
          src={product.imageUrl || ""}
          alt={product.name}
          className="object-contain h-full"
        />
      </CardHeader>

      <CardBody className="flex flex-col gap-4">
        <div>
          <Input
            label="Nume produs *"
            value={product.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!!errors.name}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>
        <Input
          label="Greutate"
          value={product.mass}
          onChange={(e) => handleChange("mass", e.target.value)}
        />
        <div>
          <Input
            label="Preț (RON) *"
            type="number"
            min={0}
            value={product.price ?? ""}
            onChange={(e) =>
              handleChange(
                "price",
                e.target.value === "" ? "" : parseFloat(e.target.value)
              )
            }
            error={!!errors.price}
          />
          {errors.price && (
            <p className="text-red-500 text-xs">{errors.price}</p>
          )}
        </div>
        <div>
          <Input
            label="Stoc *"
            type="number"
            min={0}
            value={product.quantity ?? ""}
            onChange={(e) =>
              handleChange(
                "quantity",
                e.target.value === "" ? "" : parseInt(e.target.value)
              )
            }
            error={!!errors.quantity}
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs">{errors.quantity}</p>
          )}
        </div>
        <Input
          label="Descriere"
          value={product.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        <div>
          <Select
            label="Categorie"
            value={String(product.type)}
            onChange={(val) => handleChange("type", parseInt(val))}
            error={!!errors.type}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={String(cat.id)}>
                {cat.ro_short || cat.ro}
              </Option>
            ))}
          </Select>
          {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
        </div>
        {onDelete && (
          <Button
            variant="outlined"
            color="red"
            onClick={() => onDelete(index)}
          >
            Șterge
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
