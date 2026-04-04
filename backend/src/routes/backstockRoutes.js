const express = require("express");
const router = express.Router();
const { 
  getBackstockInventory, 
  getBackstockItem, 
  restockBackstockItem 
} = require("../controllers/backstockController");

router.get("/", getBackstockInventory);
router.get("/:productId", getBackstockItem);
router.post("/restock", restockBackstockItem);

module.exports = router;