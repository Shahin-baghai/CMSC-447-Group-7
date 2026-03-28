const {
  getAllInventory,
  getInventorySummary,
  getInventoryItemBySlotId,
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

exports.getInventoryItem = (req, res) => {
  const { slotId } = req.params;
  const item = getInventoryItemBySlotId(slotId);

  if (!item) {
    return res.status(404).json({
      error: "Item not found"
    });
  }

  res.json(item);
};

exports.restockItem = (req, res) => {
  const { slotId, quantityAdded } = req.body;

  if (!slotId || quantityAdded === undefined) {
    return res.status(400).json({
      error: "slotId and quantityAdded are required"
    });
  }

  if (typeof quantityAdded !== "number") {
    return res.status(400).json({
      error: "quantityAdded must be a number"
    });
  }

  if (quantityAdded <= 0) {
    return res.status(400).json({
      error: "quantityAdded must be greater than 0"
    });
  }

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