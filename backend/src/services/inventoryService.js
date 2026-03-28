const inventoryItems = require("../data/inventoryData");

exports.getAllInventory = () => {
  return inventoryItems;
};

exports.getInventorySummary = () => {
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(
    (item) => item.status === "Low Stock"
  ).length;
  const outOfStockItems = inventoryItems.filter(
    (item) => item.status === "Out of Stock"
  ).length;

  return {
    totalItems,
    lowStockItems,
    outOfStockItems
  };
};