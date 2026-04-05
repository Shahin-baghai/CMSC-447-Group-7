const {
  getAllProducts,
  addProduct,
  updateProduct
} = require("../services/productService");

// gets all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

// adds new product to products table and returns new product ID
exports.addProduct = async (req, res, next) => {
  const { product_name, price } = req.body;
  if (!product_name || price === undefined) {
    return res.status(400).json({ error: "product_name and price are required" });
  }

  try {
    const productId = await addProduct(product_name, price);
    res.status(201).json({ message: "Product added", productId });
  } catch (err) {
    next(err);
  }
};

// updates product details
exports.updateProduct = async (req, res, next) => {
  const { productId, product_name, price } = req.body;
  if (!productId || !product_name || price === undefined) {
    return res.status(400).json({ error: "productId, product_name, and price are required" });
  }

  try {
    await updateProduct(productId, product_name, price);
    res.json({ message: "Product updated" });
  } catch (err) {
    next(err);
  }
};