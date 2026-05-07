import express from "express";
import { db } from "../firebase/firebase_admin.js";
import admin from "firebase-admin";

const router = express.Router();

// Helper function to validate IDs
function isValidId(id) {
  return typeof id === "string" && id.trim().length > 0;
}

// Helper function to fetch products by IDs
async function fetchProductsByIds(ids) {
  if (!ids.length) return [];
  const productChunks = [];
  for (let i = 0; i < ids.length; i += 10) {
    productChunks.push(ids.slice(i, i + 10));
  }

  let products = [];
  for (const chunk of productChunks) {
    const snaps = await db
      .collection("products")
      .where(admin.firestore.FieldPath.documentId(), "in", chunk)
      .get();
    products = products.concat(
      snaps.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    );
  }
  return products;
}

// Auth middleware to verify user owns the UID
async function verifyUserAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Missing token" });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

// Middleware to verify user is accessing their own data
function requireOwnUser(req, res, next) {
  const targetUid = req.params.uid || req.query.uid || req.body.uid;
  if (targetUid && req.uid !== targetUid) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

/**
 * GET /api/user/profile/:uid
 * Fetch user profile by UID
 */
router.get(
  "/profile/:uid",
  verifyUserAuth,
  requireOwnUser,
  async (req, res) => {
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
  },
);

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
router.post("/create", verifyUserAuth, async (req, res) => {
  const { uid, email, name, lname, photoURL } = req.body;

  // User can only create their own account
  if (uid !== req.uid) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

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
      addressData: {},
      billingCompanyData: {},
      cart: [],
      favorites: [],
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
router.post("/merge-cart", verifyUserAuth, requireOwnUser, async (req, res) => {
  const { uid, localCart } = req.body;

  if (!uid || !Array.isArray(localCart)) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  try {
    const userRef = db.collection("users").doc(uid);

    // Batch fetch all products outside transaction to avoid timeout
    const allProductIds = localCart
      .map((item) => item.productId || item.product?.id)
      .filter(Boolean);
    const productsMap = new Map();

    if (allProductIds.length > 0) {
      const products = await fetchProductsByIds(allProductIds);
      products.forEach((p) => productsMap.set(p.id, p));
    }

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

      // Merge localCart using pre-fetched products
      for (const item of localCart) {
        const id = item.productId || item.product?.id;
        if (!id || typeof item.quantity !== "number" || item.quantity <= 0)
          continue;

        const product = productsMap.get(id);
        if (!product) continue;

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
 * PATCH /api/user/update-fields
 * Body: { collection, id, fields }
 *  Update specific field in a user or product document
 */
router.patch(
  "/update-fields",
  verifyUserAuth,
  requireOwnUser,
  async (req, res) => {
    const { collection, id, fields } = req.body;

    const allowedCollections = ["users", "products"];
    const allowedFields = [
      "tel",
      "addressData",
      "billingCompanyData",
      "cart",
      "img",
      "name",
    ];

    if (!allowedCollections.includes(collection)) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized collection" });
    }

    if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fields object",
      });
    }

    //Validate fields
    for (const [field, value] of Object.entries(fields)) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({
          success: false,
          message: `Unauthorized field: ${field}`,
        });
      }
      //Name validation: non-empty string, min 2 chars after trim
      if (field === "name") {
        if (typeof value !== "string" || value.trim().length < 2) {
          return res.status(400).json({
            success: false,
            message: "Invalid name",
          });
        }
      }
      //Phone number validation: must be 10 digits
      if (field === "tel") {
        if (!/^[0-9]{10}$/.test(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid phone number",
          });
        }
      }
      //Address validation:
      if (field === "addressData") {
        if (typeof value !== "object" || Array.isArray(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid address data",
          });
        }
        const { county, city, address, postalCode } = value;
        if (!county || !city || !address || !postalCode) {
          return res.status(400).json({
            success: false,
            message: "All address fields are required",
          });
        }
        if (!/^[0-9]{6}$/.test(postalCode)) {
          return res.status(400).json({
            success: false,
            message: "Invalid postal code",
          });
        }
        if (address.trim().length < 5) {
          return res.status(400).json({
            success: false,
            message: "Address must be at least 5 characters",
          });
        }
      }
      //Billing company data validation:
      if (field === "billingCompanyData") {
        if (typeof value !== "object" || Array.isArray(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid billing company data",
          });
        }
        // If provided, validate required fields
        if (Object.keys(value).length > 0) {
          const { name, cui, nrRegCom, county, city, address } = value;
          if (!name || !cui || !nrRegCom || !county || !city || !address) {
            return res.status(400).json({
              success: false,
              message:
                "All billing company fields are required when billingCompanyData is provided",
            });
          }
        }
      }
    }

    try {
      const docRef = db.collection(collection).doc(id);
      await docRef.update(fields);

      return res.status(200).json({ success: true, message: "Fields updated" });
    } catch (error) {
      console.error("Error updating fields:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update fields" });
    }
  },
);

/**
 * GET /api/user/favorites?uid=...
 * Returns the user's favorite products (with full product data)
 */
router.get("/favorites", verifyUserAuth, requireOwnUser, async (req, res) => {
  const { uid } = req.query;

  if (!isValidId(uid)) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid uid" });
  }

  try {
    const userSnap = await db.collection("users").doc(uid).get();

    if (!userSnap.exists) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const favorites = userSnap.data()?.favorites ?? [];
    if (!favorites.length) {
      return res.status(200).json({ success: true, favorites: [] });
    }

    // Fetch products outside of any transaction
    const detailedFavorites = await fetchProductsByIds(favorites);

    res.status(200).json({ success: true, favorites: detailedFavorites });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/user/add-to-favorites
 * Body: { uid, productId }
 * Adds a product to the user's favorites
 */
router.post(
  "/add-to-favorites",
  verifyUserAuth,
  requireOwnUser,
  async (req, res) => {
    const { uid, productId } = req.body;

    if (!isValidId(uid) || !isValidId(productId))
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid uid/productId" });

    try {
      const userRef = db.collection("users").doc(uid);

      await db.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        if (!userSnap.exists) throw new Error("User not found");

        const favorites = userSnap.data().favorites || [];
        if (favorites.includes(productId)) {
          throw new Error("Already in favorites");
        }

        // Check product exists
        const productRef = db.collection("products").doc(productId);
        const productSnap = await t.get(productRef);
        if (!productSnap.exists) throw new Error("Product not found");

        t.update(userRef, {
          favorites: admin.firestore.FieldValue.arrayUnion(productId),
        });
      });

      // Fetch updated favorites outside transaction
      const userSnap = await db.collection("users").doc(uid).get();
      const updatedFavorites = userSnap.data().favorites || [];
      const detailedFavorites = await fetchProductsByIds(updatedFavorites);

      res.status(200).json({ success: true, favorites: detailedFavorites });
    } catch (err) {
      const msg =
        err.message === "User not found" ||
        err.message === "Already in favorites" ||
        err.message === "Product not found"
          ? err.message
          : "Server error";
      res.status(err.message === "Already in favorites" ? 409 : 500).json({
        success: false,
        message: msg,
      });
    }
  },
);

/**
 * POST /api/user/remove-from-favorites
 * Body: { uid, productId }
 * Removes a product from the user's favorites
 */
router.post(
  "/remove-from-favorites",
  verifyUserAuth,
  requireOwnUser,
  async (req, res) => {
    const { uid, productId } = req.body;

    if (!isValidId(uid) || !isValidId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid uid/productId" });
    }

    try {
      const userRef = db.collection("users").doc(uid);

      await db.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        if (!userSnap.exists) throw new Error("User not found");

        const favorites = userSnap.data().favorites || [];
        if (!favorites.includes(productId)) {
          throw new Error("Product not in favorites");
        }

        t.update(userRef, {
          favorites: admin.firestore.FieldValue.arrayRemove(productId),
        });
      });

      // Fetch updated favorites outside transaction
      const userSnap = await db.collection("users").doc(uid).get();
      const updatedFavorites = userSnap.data().favorites || [];
      const detailedFavorites = await fetchProductsByIds(updatedFavorites);

      res.status(200).json({ success: true, favorites: detailedFavorites });
    } catch (err) {
      const msg =
        err.message === "User not found" ||
        err.message === "Product not in favorites"
          ? err.message
          : "Server error";
      res.status(500).json({ success: false, message: msg });
    }
  },
);

/**
 * GET /api/user/orders?uid=...
 * Returns the user's orders
 */
router.get("/orders", verifyUserAuth, requireOwnUser, async (req, res) => {
  const { uid } = req.query;

  if (!isValidId(uid)) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid uid" });
  }

  try {
    const orderQuery = await db
      .collection("orders")
      .where("userId", "==", uid)
      .get();

    if (orderQuery.empty) {
      return res.status(200).json({ success: true, orders: [] });
    }
    const orders = await Promise.all(
      orderQuery.docs.map(async (doc) => {
        const data = doc.data();
        //Timestamp → ISO string
        const createdAtIso = data.createdAt.toDate().toISOString();
        // Fetch detailed product information for each order item
        const productIds = (data.items ?? []).map((i) => i.productId);
        const detailedProducts = await fetchProductsByIds(productIds);

        const detailedItems = (data.items ?? []).map((i) => ({
          ...i,
          product: detailedProducts.find((p) => p.id === i.productId) ?? null,
        }));

        return {
          id: doc.id,
          ...data,
          createdAt: createdAtIso,
          items: detailedItems,
        };
      }),
    );
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/user/facebook/profile?accessToken=...
 * Returns the user's Facebook profile information
 */
router.get("/facebook/profile", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res
      .status(400)
      .json({ success: false, message: "Missing access token" });
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,picture.type(large)&access_token=${accessToken}`,
    );

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: "Failed to fetch Facebook profile",
      });
    }

    const data = await response.json();

    if (data.error) {
      return res
        .status(400)
        .json({ success: false, message: data.error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error fetching Facebook profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
