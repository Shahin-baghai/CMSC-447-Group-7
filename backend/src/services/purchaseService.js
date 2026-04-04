const db = require("../db");

// records a purchase by decrementing machine quantity and inserting purchase record
exports.recordPurchase = async (price) => {
  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    // finds product ID based on price (best effort, assumes unique prices or that any product with that price is valid)
    const [rows] = await conn.query(
      "SELECT product_id FROM products WHERE price = ?",
      [price]
    );

    let productId = null;

    // if a product is found with the price, try to decrement machine quantity (best effort)
    if (rows.length === 1) {
      productId = rows[0].product_id;

      // tries to decrement quantity of a machine slot with the product, only if quantity > 0
      await conn.query(
        "UPDATE machine SET quantity = quantity - 1 WHERE product_id = ? AND quantity > 0 LIMIT 1",
        [productId]
      );
    }

    // records purchase
    await conn.query(
      `INSERT INTO purchases (product_id, date, time, price)
       VALUES (?, CURDATE(), CURTIME(), ?)`,
      [productId, price]
    );

    await conn.commit();

    return { success: true };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};