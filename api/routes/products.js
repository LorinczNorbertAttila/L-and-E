import express from "express";
import { admin, db } from "../../firebase/firebase_admin.js";
import multer from "multer";
import os from "os";
import csv from "csv-parser";
import fs from "fs";

const router = express.Router();

/**
 * GET /api/products
 * Reads all products from the Firestore "products" collection
 */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error while fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Error while fetching products" });
  }
});

/**
 * GET /api/products/:id
 * Reads one product by id from the Firestore "products" collection
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== "string" || id.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product id" });
  }
  try {
    const docSnap = await db.collection("products").doc(id).get();
    if (!docSnap.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res
      .status(200)
      .json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
});

/**
 * POST /api/products/upload
 * Handles CSV file processes and uploads product data
 */
function capitalizeName(name) {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
function extractMassRaw(name) {
  const regex = /(\d+(?:[.,]\d+)?)(\s?)(ml|l|gr|kg)/i;
  const match = name.match(regex);
  return match
    ? `${match[1].replace(",", ".")} ${match[3].toUpperCase()}`
    : null;
}
const upload = multer({ dest: os.tmpdir() });
router.post("/process-file", upload.single("file"), async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!idToken || !req.file) {
    return res.status(400).json({ error: "Missing token or file" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.admin) {
      return res.status(403).json({ error: "Not admin" });
    }
    const products = [];
    const filePath = req.file.path;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const id = String(row.cod_art || "").trim();
        if (!id) return;
        const name = row.denumire || "";
        const price = Number(row.valoare);
        const quantity = Number(row.disponibil);
        const mass = extractMassRaw(row.denumire || "");
        const type = Number(row.tip);
        products.push({
          id: id,
          name: capitalizeName(name),
          price: price,
          quantity: quantity,
          imageUrl: row.imageUrl || "",
          mass,
          type: type,
        });
      })
      .on("end", () => {
        fs.unlink(req.file.path, () => {}); // delete the file after processing
        res.status(200).json({ success: true, data: products });
      })
      .on("error", (streamErr) => {
        console.error("CSV read error:", streamErr);
        fs.unlink(req.file.path, () => {}); // delete the file on error
        res.status(500).json({ error: "CSV read error" });
      });
  } catch (err) {
    res.status(401).json({ error: "Invalid token or permission" });
  }
});

router.post("/upload", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const products = req.body.products;

  if (!idToken || !Array.isArray(products)) {
    return res.status(400).json({ error: "Missing token or products" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.admin) {
      return res.status(403).json({ error: "Not admin" });
    }

    let updatedCount = 0;
    let createdCount = 0;
    let errors = [];
    let priceChanges = [];

    await Promise.all(
      products.map(async (product) => {
        try {
          const docRef = db.collection("products").doc(product.id);
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            const existingData = docSnap.data();
            const updatedQuantity =
              Number(existingData.quantity || 0) + Number(product.quantity);

            // Csak akkor frissítjük az árat/típust, ha változott
            let updateData = { quantity: updatedQuantity };
            if (existingData.price !== product.price) {
              updateData.price = product.price;
              priceChanges.push({
                id: product.id,
                oldPrice: existingData.price,
                newPrice: product.price,
              });
            }
            if (existingData.type !== product.type) {
              updateData.type = product.type;
            }

            await docRef.update(updateData);
            updatedCount++;
          } else {
            await docRef.set(product);
            createdCount++;
          }
        } catch (err) {
          errors.push({ id: product.id, error: err.message });
        }
      })
    );

    res.status(200).json({
      success: true,
      message: "Products processed",
      updated: updatedCount,
      created: createdCount,
      errors,
      priceChanges,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save products" });
  }
});

export default router;
