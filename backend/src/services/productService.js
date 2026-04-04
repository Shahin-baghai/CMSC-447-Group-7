const db = require("../db");

// gets all products
exports.getAllProducts = async () => {
  const [rows] = await db.promise().query("SELECT * FROM products");
  return rows;
};

// adds new product to products table and returns new product ID
exports.addProduct = async (product_name, price) => {
  const [result] = await db.promise().query(
    "INSERT INTO products (product_name, price) VALUES (?, ?)",
    [product_name, price]
  );
  return result.insertId;
};

// updates product details
exports.updateProduct = async (productId, product_name, price) => {
  await db.promise().query(
    "UPDATE products SET product_name = ?, price = ? WHERE product_id = ?",
    [product_name, price, productId]
  );
};