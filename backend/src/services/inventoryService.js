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

exports.getInventoryItemBySlotId = (slotId) => {
  return inventoryItems.find((item) => item.slotId === slotId);
};

exports.restockInventoryItem = (slotId, quantityAdded) => {
  const item = inventoryItems.find((inventoryItem) => inventoryItem.slotId === slotId);

  if (!item) {
    return { error: "Item not found" };
  }

  item.quantity += quantityAdded;

  if (item.quantity <= 0) {
    item.status = "Out of Stock";
  } else if (item.quantity <= 3) {
    item.status = "Low Stock";
  } else {
    item.status = "In Stock";
  }

  return item;
};