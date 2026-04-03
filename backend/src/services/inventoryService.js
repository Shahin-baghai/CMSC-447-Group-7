const db = require("../db");
const calculateStatus = require("../utils/calculateStatus");

// get all inventory items with product details and backstock
exports.getAllInventory = async () => {
  const query = `
    SELECT 
      m.slot_id, 
      p.product_name AS productName, 
      p.price, 
      m.quantity, 
      m.capacity, 
      b.stock AS backstock
    FROM machine m
    LEFT JOIN products p ON m.product_id = p.product_id
    LEFT JOIN backstock b ON m.product_id = b.product_id;
  `;
  const [rows] = await db.promise().query(query);

  return rows.map(item => ({
    ...item,
    status: calculateStatus(item.quantity, item.capacity)
  }));
};

// get inventory summary (total items, low stock count, out of stock count)
exports.getInventorySummary = async () => {
  const items = await this.getAllInventory();
  return {
    totalItems: items.length,
    lowStockItems: items.filter(i => i.status === "Low Stock").length,
    outOfStockItems: items.filter(i => i.status === "Out of Stock").length
  };
};

// get inventory item by slot ID
exports.getInventoryItemBySlotId = async (slotId) => {
  const query = `
    SELECT 
      m.slot_id, 
      p.product_name AS productName, 
      p.price, 
      m.quantity, 
      m.capacity, 
      b.stock AS backstock
    FROM machine m
    LEFT JOIN products p ON m.product_id = p.product_id
    LEFT JOIN backstock b ON m.product_id = b.product_id
    WHERE m.slot_id = ?;
  `;
  const [rows] = await db.promise().query(query, [slotId]);

  if (rows.length === 0) return null;

  const item = rows[0];
  item.status = calculateStatus(item.quantity, item.capacity);
  return item;
};

// restock inventory item by slot ID
exports.restockInventoryItem = async (slotId, quantityAdded) => {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    // Lock row for update
    const [rows] = await conn.query(
      "SELECT product_id, quantity FROM machine WHERE slot_id = ? FOR UPDATE",
      [slotId]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return { error: "Item not found" };
    }
    
    // Update machine quantity and backstock stock
    await conn.query(`
      UPDATE machine m
      JOIN backstock b ON m.product_id = b.product_id
      SET m.quantity = m.quantity + ?, b.stock = b.stock - ?
      WHERE m.slot_id = ?`,
      [quantityAdded, quantityAdded, slotId]
    );

    await conn.commit();

    // Return updated item
    const updatedItem = await this.getInventoryItemBySlotId(slotId);
    return updatedItem;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};