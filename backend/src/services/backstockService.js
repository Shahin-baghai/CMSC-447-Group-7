const db = require("../db");

// gets all backstock items with product details
exports.getBackstockInventory = async () => {
  const [rows] = await db.promise().query(`
    SELECT 
      p.product_id,
      p.product_name,
      b.stock
    FROM backstock b
    JOIN products p ON b.product_id = p.product_id
  `);

  return rows;
};

// gets backstock item by product ID
exports.getBackstockItem = async (productId) => {
  const [rows] = await db.promise().query(`
    SELECT 
      p.product_id,
      p.product_name,
      b.stock
    FROM backstock b
    JOIN products p ON b.product_id = p.product_id
    WHERE p.product_id = ?
  `, [productId]);

  return rows[0] || null;
};

// restocks backstock item by adding quantity
exports.restockBackstockItem = async (productId, quantityAdded) => {
  await db.promise().query(
    "UPDATE backstock SET stock = stock + ? WHERE product_id = ?",
    [quantityAdded, productId]
  );
};