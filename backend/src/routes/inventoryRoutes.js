const express = require("express");
const router = express.Router();

const {
  getInventory,
  getSummary,
  restockItem
} = require("../controllers/inventoryController");

router.get("/", getInventory);
router.get("/summary", getSummary);
router.post("/restock", restockItem);

module.exports = router;