const express = require("express");
const cors = require("cors");
const inventoryRoutes = require("./routes/inventoryRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Backend is running"));

app.use("/inventory", inventoryRoutes);

app.use(errorHandler);

module.exports = app;