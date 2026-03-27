const express = require("express");

const app = express();
const PORT = 3001;

app.use(express.json());

const inventoryRoutes = require("./routes/inventoryRoutes");

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/inventory", inventoryRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});