const {
  getAllInventory,
  getInventorySummary,
  getInventoryItemBySlotId,
  restockInventoryItem
} = require("../services/inventoryService");

// get all inventory items with product details and backstock
exports.getInventory = async (req, res, next) => {
  try {
    const inventoryItems = await getAllInventory();
    res.json({ items: inventoryItems });
  } catch (err) {
    next(err);
  }
};

// get inventory summary (total items, low stock count, out of stock count)
exports.getSummary = async (req, res, next) => {
  try {
    const summary = await getInventorySummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

// get inventory item by slot ID
exports.getInventoryItem = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const item = await getInventoryItemBySlotId(slotId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

// restock inventory item by slot ID
exports.restockItem = async (req, res, next) => {
  try {
    const { slotId, quantityAdded } = req.body;

    const updatedItem = await restockInventoryItem(slotId, quantityAdded);

    if (updatedItem.error) {
      return res.status(404).json({ error: updatedItem.error });
    }

    res.json({
      message: "Item restocked successfully",
      item: updatedItem
    });
  } catch (err) {
    next(err);
  }
};