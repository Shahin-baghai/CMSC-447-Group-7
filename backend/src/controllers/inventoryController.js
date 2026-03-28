const {
  getAllInventory,
  getInventorySummary
} = require("../services/inventoryService");

exports.getInventory = (req, res) => {
  const inventoryItems = getAllInventory();

  res.json({
    items: inventoryItems
  });
};

exports.getSummary = (req, res) => {
  const summary = getInventorySummary();

  res.json(summary);
};