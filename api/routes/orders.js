import express from "express";
import { admin, db } from "../../client/src/firebase/firebase_admin.js";

const router = express.Router();

const PRODUCT_CHUNK_SIZE = 10;

/**
 * GET /api/orders
 * Returns all orders with user and product details
 */
router.get("/", async (req, res) => {
  try {
    // Parse pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 20, 100)); // max 100/page
    const filter = req.query.filter || "all"; // "all", "3months", "6months"

    // Determine the date threshold for filtering
    const now = new Date();
    let dateThreshold;
    if (filter === "3months") {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      dateThreshold = admin.firestore.Timestamp.fromDate(threeMonthsAgo);
    } else if (filter === "6months") {
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      dateThreshold = admin.firestore.Timestamp.fromDate(sixMonthsAgo);
    }

    // Build base query sorted by createdAt descending
    let query = db.collection("orders").orderBy("createdAt", "desc");

    // Apply date filtering if necessary
    if (dateThreshold) {
      query = query.where("createdAt", ">=", dateThreshold);
    }

    // Fetch all filtered orders for total count
    let totalOrders = 0;
    if (typeof query.count === "function") {
      const countSnap = await query.count().get();
      totalOrders = countSnap.data().count;
    } else {
      const totalSnap = await query.get();
      totalOrders = totalSnap.size;
    }
    const totalPages = Math.ceil(totalOrders / limit);

    // Apply pagination
    const ordersSnap = await query
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const orders = ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Collect all unique userIds and productIds
    const userIds = [...new Set(orders.map((order) => order.userId))];
    const productIds = [
      ...new Set(
        orders.flatMap((order) =>
          (order.items || []).map((item) => item.productId)
        )
      ),
    ];

    // Fetch all users
    let usersMap = {};
    if (userIds.length > 0) {
      const usersSnap = await db.getAll(
        ...userIds.map((uid) => db.collection("users").doc(uid))
      );
      usersSnap.forEach((doc) => {
        if (doc.exists)
          usersMap[doc.id] = {
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            tel: doc.data().tel,
            address: doc.data().address,
          };
      });
    }

    // Fetch all products
    const productChunks = [];
    for (let i = 0; i < productIds.length; i += PRODUCT_CHUNK_SIZE) {
      productChunks.push(productIds.slice(i, i + PRODUCT_CHUNK_SIZE));
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
    const productsMap = {};
    products.forEach((prod) => {
      productsMap[prod.id] = prod;
    });

    // Attach user and product details to each order
    const ordersWithDetails = orders.map((order) => {
      let createdAtIso = null;
      if (order.createdAt?.toDate) {
        createdAtIso = order.createdAt.toDate().toISOString();
      }

      return {
        ...order,
        createdAt: createdAtIso,
        user: usersMap[order.userId] || null,
        items: (order.items || []).map((item) => ({
          ...item,
          product: productsMap[item.productId] || null,
        })),
      };
    });

    res.status(200).json({
      success: true,
      data: ordersWithDetails,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching all orders" });
  }
});

/**
 * PATCH /api/orders/:orderId/status
 * Changes the status of an order
 */

router.patch("/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Missing status." });
  }

  try {
    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }
    await orderRef.update({ status });

    return res.status(200).json({ success: true, message: "Status updated." });
  } catch (err) {
    console.error("Error updating order status:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update status." });
  }
});

export default router;
