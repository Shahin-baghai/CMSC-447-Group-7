const express = require("express");
const cors = require("cors");

const inventoryRoutes = require("./routes/inventoryRoutes");
const productRoutes = require("./routes/productRoutes");
const backstockRoutes = require("./routes/backstockRoutes");
const machineRoutes = require("./routes/machineRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => res.send("Backend is running"));

// API routes
app.use("/inventory", inventoryRoutes);
app.use("/products", productRoutes);
app.use("/backstock", backstockRoutes);
app.use("/machine", machineRoutes);
app.use("/purchases", purchaseRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;