const express = require("express");
const router = express.Router();
const { 
  addProduct, 
  updateProduct, 
  getAllProducts 
} = require("../controllers/productController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.get("/", requireAuth, requireRole("admin"), getAllProducts);
router.post("/add", requireAuth, requireRole("admin"), addProduct);
router.put("/update", requireAuth, requireRole("admin"), updateProduct);

module.exports = router;
