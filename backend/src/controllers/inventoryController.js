const inventoryItems = require("../data/inventoryData");

exports.getInventory = (req, res) => {
  res.json({
    items: inventoryItems
  });
};