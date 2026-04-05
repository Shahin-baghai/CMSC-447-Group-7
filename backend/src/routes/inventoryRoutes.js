const express = require("express");
const router = express.Router();
const { 
  getAllInventory, 
  getMachineInventorySummary, 
  getMachineSlot 
} = require("../controllers/inventoryController");

router.get("/", getAllInventory);
router.get("/summary", getMachineInventorySummary);
router.get("/:slotId", getMachineSlot);

module.exports = router;