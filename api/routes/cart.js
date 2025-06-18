import express from "express";
import { db } from "../../firebase/firebase_admin.js";
import admin from "firebase-admin";
const router = express.Router();

// Helper function to validate IDs
function isValidId(id) {
  return typeof id === "string" && id.trim().length > 0;
}

// Helper to get detailed cart for a user
async function getDetailedCart(uid) {
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const cart = userSnap.exists ? userSnap.data().cart || [] : [];

  if (cart.length === 0) return [];

  const productIds = cart.map((item) => item.productId);
  const productChunks = [];
  // Split productIds into chunks of 10 for Firestore query limits
  for (let i = 0; i < productIds.length; i += 10) {
    productChunks.push(productIds.slice(i, i + 10));
  }

  let products = [];
  for (const chunk of productChunks) {
    const snaps = await db
      .collection("products")
      .where(admin.firestore.FieldPath.documentId(), "in", chunk)
      .get();
    products = products.concat(
      snaps.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  }

  // Map productId to product for quick lookup
  const productMap = {};
  products.forEach((p) => {
    productMap[p.id] = p;
  });

  const detailedCart = [];
  for (const item of cart) {
    const product = productMap[item.productId];
    if (!product) continue;
    detailedCart.push({
      product,
      quantity: item.quantity,
    });
  }
  return detailedCart;
}

/**
 * GET /api/cart/details/:uid
 * Returns the user's cart with product details
 */
router.get("/details/:uid", async (req, res) => {
  const { uid } = req.params;
  if (!isValidId(uid)) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid uid" });
  }

  try {
    const detailedCart = await getDetailedCart(uid);
    if (!detailedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    return res.status(200).json({ success: true, cart: detailedCart });
  } catch (error) {
    console.error("Error fetching cart details:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/cart/place-order
 * Body: { uid, productId }
 * Adds a product to the user's cart
 */
router.post("/add", async (req, res) => {
  const { uid, productId } = req.body;
  if (!isValidId(uid) || !isValidId(productId))
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid uid/productId" });

  try {
    const userRef = db.collection("users").doc(uid);
    const productRef = db.collection("products").doc(productId);

    await db.runTransaction(async (t) => {
      const [userSnap, productSnap] = await Promise.all([
        t.get(userRef),
        t.get(productRef),
      ]);
      const product = productSnap.data();
      const cart = userSnap.exists ? userSnap.data().cart || [] : [];

      const cartItem = cart.find((item) => item.productId === productId);
      const currentQty = cartItem?.quantity || 0;

      if (currentQty + 1 > product.quantity) {
        throw new Error("Out of stock");
      }

      if (cartItem) {
        cartItem.quantity += 1;
      } else {
        cart.push({ productId, quantity: 1 });
      }

      t.update(userRef, { cart });
    });
    const updatedCart = await getDetailedCart(uid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({ success: true, cart: updatedCart });
  } catch (err) {
    const message =
      err.message === "Out of stock" ? err.message : "Server error";
    res.status(500).json({ success: false, message });
  }
});

/**
 * PATCH /api/cart/update-quantity
 * Body: { uid, productId, change }
 * Updates the quantity of a product in the user's cart
 */
router.patch("/update-quantity", async (req, res) => {
  const { uid, productId, change } = req.body;
  if (!isValidId(uid) || !isValidId(productId) || typeof change !== "number")
    return res.status(400).json({ success: false, message: "Invalid input" });

  try {
    const userRef = db.collection("users").doc(uid);
    const productRef = db.collection("products").doc(productId);

    await db.runTransaction(async (t) => {
      const [userSnap, productSnap] = await Promise.all([
        t.get(userRef),
        t.get(productRef),
      ]);

      if (!productSnap.exists || !userSnap.exists) {
        throw new Error("User or product not found");
      }

      const userData = userSnap.data();
      const product = productSnap.data();
      const cart = userData.cart || [];
      const cartItem = cart.find((item) => item.productId === productId);
      if (!cartItem) throw new Error("Item not in cart");

      if (change > 0) {
        const maxQuantity = product.quantity - cartItem.quantity;
        if (change > maxQuantity) {
          throw new Error("Out of stock");
        }
      }

      cartItem.quantity += change;
      if (cartItem.quantity <= 0) {
        const index = cart.findIndex((i) => i.productId === productId);
        cart.splice(index, 1);
      }
      t.update(userRef, { cart });
    });
    const updatedCart = await getDetailedCart(uid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({ success: true, cart: updatedCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/cart/remove
 * Body: { uid, productId }
 * Removes a product from the user's cart
 */
router.delete("/remove", async (req, res) => {
  const { uid, productId } = req.body;
  if (!isValidId(uid) || !isValidId(productId))
    return res.status(400).json({ success: false, message: "Missing data" });

  try {
    const userRef = db.collection("users").doc(uid);

    await db.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);
      const cart = userSnap.exists ? userSnap.data().cart || [] : [];

      const index = cart.findIndex((item) => item.productId === productId);
      if (index < 0) throw new Error("Product not in cart");

      cart.splice(index, 1);

      t.update(userRef, { cart });
    });
    const updatedCart = await getDetailedCart(uid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({ success: true, cart: updatedCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/cart/add
 * Body: { uid, productId }
 * Places an order
 */
router.post("/place-order", async (req, res) => {
  const { uid, total } = req.body;
  if (!isValidId(uid) || typeof total !== "number")
    return res
      .status(400)
      .json({ success: false, message: "Invalid order data" });

  try {
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const cart = userSnap.data().cart || [];
    if (cart.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    const productRefs = cart.map((item) =>
      db.collection("products").doc(item.productId)
    );

    await db.runTransaction(async (t) => {
      const productSnaps = await Promise.all(
        productRefs.map((ref) => t.get(ref))
      );

      const items = [];
      for (let i = 0; i < cart.length; i++) {
        const cartItem = cart[i];
        const productSnap = productSnaps[i];

        if (!productSnap.exists) throw new Error("Product not found");
        const product = productSnap.data();

        if (product.quantity < cartItem.quantity) {
          throw new Error(`Not enough stock for product ${cartItem.productId}`);
        }

        items.push({
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          unitPrice: product.price,
        });

        t.update(productRefs[i], {
          quantity: product.quantity - cartItem.quantity,
        });
      }

      const orderData = {
        userId: uid,
        items,
        total,
        status: "Procesare",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const orderRef = db.collection("orders").doc();
      t.set(orderRef, orderData);
      t.update(userRef, { cart: [] });
    });
    const updatedCart = await getDetailedCart(uid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    res.status(201).json({ success: true, cart: updatedCart });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ success: false, message: "Order error" });
  }
});

export default router;
