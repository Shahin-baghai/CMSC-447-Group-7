const express = require("express");
const router = express.Router();

const {
  getInventory,
  getSummary,
  getInventoryItem,
  restockItem
} = require("../controllers/inventoryController");

const validateRestock = require("../middleware/validateRestock");

router.get("/summary", getSummary);
router.get("/:slotId", getInventoryItem);
router.get("/", getInventory);
router.post("/restock", validateRestock, restockItem);

module.exports = router;