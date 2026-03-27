const { getAllInventory } = require("../services/inventoryService");

exports.getInventory = (req, res) => {
  const inventoryItems = getAllInventory();

  res.json({
    items: inventoryItems
  });
};