import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS settings
app.use(cors());
app.use(express.json());

// Routes
import productRoutes from "./routes/products.js";
import userRoutes from "./routes/user.js";
import cartRoutes from "./routes/cart.js";
import categoriesRoutes from "./routes/categories.js";
import ordersRoutes from "./routes/orders.js";

// Mount routes
app.use("/api/products", productRoutes); // GET /api/products /api/products/:id /process-file /upload
app.use("/api/user", userRoutes); // POST /api/user/create, /merge-cart, /set-field
app.use("/api/cart", cartRoutes); // POST /api/cart/add, /update, /place-order
app.use("/api/categories", categoriesRoutes); // GET /api/categories
app.use("/api/orders", ordersRoutes); // GET /api/orders

// Fallback route
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
