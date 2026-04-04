const express = require("express");
const router = express.Router();
const { 
  addProduct, 
  updateProduct, 
  getAllProducts 
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.post("/add", addProduct);
router.put("/update", updateProduct);

module.exports = router;