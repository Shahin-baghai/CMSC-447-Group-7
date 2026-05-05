const db = require("../db");

// gets all backstock items with product details
exports.getBackstockInventory = async () => {
  const [rows] = await db.promise().query(`
    SELECT 
      p.product_id AS productId,
      p.product_name AS productName,
      COALESCE(b.stock, 0) AS stock
    FROM products p
    LEFT JOIN backstock b ON b.product_id = p.product_id
    ORDER BY p.product_id ASC
  `);

  return rows;
};

// gets backstock item by product ID
exports.getBackstockItem = async (productId) => {
  const [rows] = await db.promise().query(`
    SELECT 
      p.product_id AS productId,
      p.product_name AS productName,
      COALESCE(b.stock, 0) AS stock
    FROM products p
    LEFT JOIN backstock b ON b.product_id = p.product_id
    WHERE p.product_id = ?
  `, [productId]);

  return rows[0] || null;
};

// restocks backstock item by adding quantity
exports.restockBackstockItem = async (productId, quantityAdded) => {
  await db.promise().query(
    `INSERT INTO backstock (product_id, stock)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE stock = stock + VALUES(stock)`,
    [productId, quantityAdded]
  );

  return this.getBackstockItem(productId);
};

exports.addBackstockProduct = async (productName, stock) => {
  const [productResult] = await db.promise().query(
    `INSERT INTO products (product_name, price)
     VALUES (?, ?)`,
    [productName, 0.00]
  );

  const productId = productResult.insertId;

  await db.promise().query(
    `INSERT INTO backstock (product_id, stock)
     VALUES (?, ?)`,
    [productId, stock]
  );

  return {
    message: "New backstock item added successfully",
    productId
  };
};