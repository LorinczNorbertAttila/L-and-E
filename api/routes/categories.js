import express from "express";
import { db } from "../../client/src/firebase/firebase_admin.js";

const router = express.Router();

/**
 * GET /api/categories
 * Reads all categories from the Firestore "categories" collection
 */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("categories").get();
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("Error while fetching categories:", error);
    res
      .status(500)
      .json({ success: false, message: "Error while fetching categories" });
  }
});

export default router;