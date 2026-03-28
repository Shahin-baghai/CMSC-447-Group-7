const express = require("express");
const router = express.Router();

const {
  getInventory,
  getSummary,
  getInventoryItem,
  restockItem
} = require("../controllers/inventoryController");

router.get("/summary", getSummary);
router.get("/:slotId", getInventoryItem);
router.get("/", getInventory);
router.post("/restock", restockItem);

module.exports = router;