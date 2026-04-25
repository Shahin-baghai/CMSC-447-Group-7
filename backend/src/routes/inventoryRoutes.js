const express = require("express");
const router = express.Router();
const { 
  getAllInventory, 
  getMachineInventorySummary, 
  getMachineSlot 
} = require("../controllers/inventoryController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, getAllInventory);
router.get("/summary", requireAuth, getMachineInventorySummary);
router.get("/:slotId", requireAuth, getMachineSlot);

module.exports = router;
