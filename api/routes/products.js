import express from "express";
import { db } from "../../firebase/firebase_admin.js";

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

export default router;
