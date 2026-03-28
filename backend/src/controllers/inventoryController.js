const {
  getAllInventory,
  getInventorySummary,
  restockInventoryItem
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

exports.restockItem = (req, res) => {
  const { slotId, quantityAdded } = req.body;

  const updatedItem = restockInventoryItem(slotId, quantityAdded);

  if (updatedItem.error) {
    return res.status(404).json({
      error: updatedItem.error
    });
  }

  res.json({
    message: "Item restocked successfully",
    item: updatedItem
  });
};