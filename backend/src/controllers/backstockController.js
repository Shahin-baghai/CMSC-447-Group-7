const {
  getBackstockInventory,
  getBackstockItem,
  restockBackstockItem
} = require("../services/backstockService");

// gets all backstock items with product details
exports.getBackstockInventory = async (req, res, next) => {
  try {
    const items = await getBackstockInventory();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// gets backstock item by product ID
exports.getBackstockItem = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const item = await getBackstockItem(productId);
    if (!item) return res.status(404).json({ error: "Backstock item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// restocks backstock item by adding quantity
exports.restockBackstockItem = async (req, res, next) => {
  const { productId, quantityAdded } = req.body;
  if (!productId || quantityAdded === undefined) {
    return res.status(400).json({ error: "productId and quantityAdded are required" });
  }

  if (typeof quantityAdded !== "number" || quantityAdded <= 0) {
    return res.status(400).json({ error: "quantityAdded must be a positive number" });
  }

  try {
    const item = await restockBackstockItem(productId, quantityAdded);
    res.json({ message: "Backstock restocked successfully", item });
  } catch (err) {
    next(err);
  }
};
