const { recordPurchase } = require("../services/purchaseService");

// records a purchase by decrementing machine quantity and inserting purchase record
exports.recordPurchase = async (req, res, next) => {
  const { price } = req.body;
  if (price === undefined) return res.status(400).json({ error: "price is required" });

  try {
    const result = await recordPurchase(price);
    res.json(result);
  } catch (err) {
    next(err);
  }
};