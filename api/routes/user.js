import express from "express";
import { db } from "../../firebase/firebase_admin.js";
import admin from "firebase-admin";

const router = express.Router();

/**
 * GET /api/user/profile/:uid
 * Fetch user profile by UID
 */
router.get("/profile/:uid", async (req, res) => {
  const { uid } = req.params;
  if (!uid)
    return res.status(400).json({ success: false, message: "Missing UID" });

  try {
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, data: userSnap.data() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/user/exists/:uid
 * Check if a user exists by UID
 */
router.get("/exists/:uid", async (req, res) => {
  const { uid } = req.params;
  if (!uid)
    return res.status(400).json({ success: false, message: "Missing UID" });

  try {
    const userSnap = await db.collection("users").doc(uid).get();
    return res.status(200).json({ success: true, exists: userSnap.exists });
  } catch (err) {
    console.error("Error checking user existence:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/user/create
 * Body: { uid, email, name, lname, photoURL }
 * Create a new user document in Firestore
 */
router.post("/create", async (req, res) => {
  const { uid, email, name, lname, photoURL } = req.body;

  if (!uid || !email || !name) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const userDocRef = db.collection("users").doc(uid);

    const userSnap = await userDocRef.get();
    if (userSnap.exists) {
      return res
        .status(200)
        .json({ success: true, message: "User already exists" });
    }

    await userDocRef.set({
      email,
      name: `${lname} ${name}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      img: photoURL,
      tel: "",
      address: "",
      cart: [],
    });

    return res.status(201).json({ success: true, message: "User created" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/user/merge-cart
 * Body: { uid, localCart }
 * Merge local cart with Firestore cart
 */
router.post("/merge-cart", async (req, res) => {
  const { uid, localCart } = req.body;

  if (!uid || !Array.isArray(localCart)) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  try {
    const userRef = db.collection("users").doc(uid);

    await db.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);
      const existingCart = userSnap.exists ? userSnap.data().cart || [] : [];

      const cartMap = new Map();

      // Add existing cart to map
      for (const item of existingCart) {
        cartMap.set(item.productId, {
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      // Merge localCart
      for (const item of localCart) {
        const id = item.productId || item.product?.id;
        if (!id || typeof item.quantity !== "number" || item.quantity <= 0)
          continue;

        const productRef = db.collection("products").doc(id);
        const productSnap = await t.get(productRef);
        if (!productSnap.exists) continue;

        const product = productSnap.data();
        const availableStock = product.quantity;

        const prevQuantity = cartMap.get(id)?.quantity || 0;
        const requestedTotal = prevQuantity + item.quantity;

        const finalQuantity = Math.min(requestedTotal, availableStock);

        if (finalQuantity > 0) {
          cartMap.set(id, { productId: id, quantity: finalQuantity });
        }
      }

      const mergedCart = Array.from(cartMap.values());
      t.update(userRef, { cart: mergedCart });
    });

    return res.status(200).json({ success: true, message: "Cart merged" });
  } catch (error) {
    console.error("Error merging cart:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
});

/**
 * PATCH /api/user/set-field
 * Body: { collection, id, field, value }
 *  Update a specific field in a user or product document
 */
router.patch("/set-field", async (req, res) => {
  const { collection, id, field, value } = req.body;

  const allowedCollections = ["users", "products"];
  const allowedFields = ["tel", "address", "cart"];

  if (
    !allowedCollections.includes(collection) ||
    !allowedFields.includes(field)
  ) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized field or collection" });
  }

  try {
    const docRef = db.collection(collection).doc(id);
    await docRef.update({ [field]: value });

    return res.status(200).json({ success: true, message: "Field updated" });
  } catch (error) {
    console.error("Error updating field:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
