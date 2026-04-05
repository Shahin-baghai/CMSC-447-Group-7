const {
  getAllInventory,
  getMachineInventorySummary,
  getMachineSlot
} = require("../services/inventoryService");

// gets all inventory items with product details and backstock
exports.getAllInventory = async (req, res, next) => {
  try {
    const items = await getAllInventory();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// gets summary of stock levels of items in machine (total items, low stock count, out of stock count, etc)
exports.getMachineInventorySummary = async (req, res, next) => {
  try {
    const summary = await getMachineInventorySummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

// gets item in machine slot by slot ID
exports.getMachineSlot = async (req, res, next) => {
  const { slotId } = req.params;
  try {
    const slot = await getMachineSlot(slotId);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    res.json(slot);
  } catch (err) {
    next(err);
  }
};