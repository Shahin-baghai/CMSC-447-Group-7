const db = require("../db");
const calculateStatus = require("../utils/calculateStatus");

// gets all inventory items with product details and backstock
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
    status: calculateStatus(item.productName, item.quantity, item.capacity)
  }));
};

// gets summary of stock levels of items in machine (total items, low stock count, out of stock count, etc)
exports.getMachineInventorySummary = async () => {
  const items = await this.getAllInventory();
  return {
    totalItems: items.filter(i => i.status !== "Empty Slot").length,
    inStockItems: items.filter(i => i.status === "In Stock").length,
    lowStockItems: items.filter(i => i.status === "Low Stock").length,
    outOfStockItems: items.filter(i => i.status === "Out of Stock").length,
    emptySlots: items.filter(i => i.status === "Empty Slot").length
  };
};

// gets item in machine slot by slot ID
exports.getMachineSlot = async (slotId) => {
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

  if (rows.length === 0) {
    return null;
  }

  const item = rows[0];
  item.status = calculateStatus(item.productName, item.quantity, item.capacity);
  return item;
};