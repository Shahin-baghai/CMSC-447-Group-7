const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors()); // 👈 THIS FIXES YOUR ISSUE
app.use(express.json());

const inventoryRoutes = require("./routes/inventoryRoutes");

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/inventory", inventoryRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});