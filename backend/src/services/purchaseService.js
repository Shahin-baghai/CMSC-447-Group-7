const db = require("../db");
const { getEmployeeRestockLogs } = require("./restockLogService");

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

// returns summary metrics and recent activity for reports dashboard
exports.getPurchaseReport = async () => {
  const [summaryRows] = await db.promise().query(`
    SELECT
      COUNT(*) AS totalPurchases,
      COALESCE(SUM(price), 0) AS totalRevenue,
      COUNT(CASE WHEN date = CURDATE() THEN 1 END) AS purchasesToday,
      COALESCE(SUM(CASE WHEN date = CURDATE() THEN price ELSE 0 END), 0) AS revenueToday
    FROM purchases
  `);

  const [topProducts] = await db.promise().query(`
    SELECT
      COALESCE(p.product_name, 'Unknown Product') AS productName,
      COUNT(*) AS purchaseCount,
      COALESCE(SUM(pc.price), 0) AS revenue
    FROM purchases pc
    LEFT JOIN products p ON pc.product_id = p.product_id
    GROUP BY pc.product_id, p.product_name
    ORDER BY purchaseCount DESC, revenue DESC
    LIMIT 5
  `);

  const [recentPurchases] = await db.promise().query(`
    SELECT
      pc.purchase_id AS purchaseId,
      COALESCE(p.product_name, 'Unknown Product') AS productName,
      pc.price,
      pc.date,
      pc.time
    FROM purchases pc
    LEFT JOIN products p ON pc.product_id = p.product_id
    ORDER BY pc.date DESC, pc.time DESC, pc.purchase_id DESC
    LIMIT 10
  `);

  const [dailySales] = await db.promise().query(`
    SELECT
      date,
      COUNT(*) AS purchaseCount,
      COALESCE(SUM(price), 0) AS revenue
    FROM purchases
    GROUP BY date
    ORDER BY date DESC
    LIMIT 7
  `);

  const [inventoryAlerts] = await db.promise().query(`
    SELECT
      m.slot_id AS slotId,
      p.product_name AS productName,
      m.quantity,
      m.capacity,
      b.stock AS backstock
    FROM machine m
    LEFT JOIN products p ON m.product_id = p.product_id
    LEFT JOIN backstock b ON m.product_id = b.product_id
    WHERE p.product_name IS NOT NULL
      AND (m.quantity = 0 OR m.quantity <= LEAST(3, GREATEST(1, FLOOR(m.capacity * 0.3))))
    ORDER BY m.quantity ASC, b.stock ASC, m.slot_id ASC
    LIMIT 10
  `);

  const employeeRestocks = await getEmployeeRestockLogs(20);

  return {
    summary: summaryRows[0],
    topProducts,
    recentPurchases,
    dailySales,
    inventoryAlerts,
    employeeRestocks
  };
};
