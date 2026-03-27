const express = require("express");

const app = express();
const PORT = 3001;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/inventory", (req, res) => {
  res.json({
    items: [
      {
        slotId: "A2",
        productName: "Flash Drive",
        price: 5.0,
        quantity: 3,
        capacity: 8,
        status: "Low Stock",
        backstock: 12
      },
      {
        slotId: "D0",
        productName: "Tissues",
        price: 1.0,
        quantity: 10,
        capacity: 10,
        status: "In Stock",
        backstock: 20
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});