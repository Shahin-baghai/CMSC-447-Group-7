const express = require("express");
const router = express.Router();
const { 
  getBackstockInventory, 
  getBackstockItem, 
  restockBackstockItem, 
  addBackstockProduct
} = require("../controllers/backstockController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.get("/", requireAuth, requireRole("admin"), getBackstockInventory);
router.post("/restock", requireAuth, requireRole("admin"), restockBackstockItem);
router.post("/add-product", requireAuth, requireRole("admin"), addBackstockProduct);
router.get("/:productId", requireAuth, requireRole("admin"), getBackstockItem);
module.exports = router;
