const express = require("express");
const router = express.Router();
const { 
  getBackstockInventory, 
  getBackstockItem, 
  restockBackstockItem 
} = require("../controllers/backstockController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.get("/", requireAuth, requireRole("admin"), getBackstockInventory);
router.get("/:productId", requireAuth, requireRole("admin"), getBackstockItem);
router.post("/restock", requireAuth, requireRole("admin"), restockBackstockItem);

module.exports = router;
