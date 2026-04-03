function validateRestock(req, res, next) {
  const { slotId, quantityAdded } = req.body;

  if (!slotId || quantityAdded === undefined) {
    return res.status(400).json({ error: "slotId and quantityAdded are required" });
  }

  if (typeof quantityAdded !== "number" || quantityAdded <= 0) {
    return res.status(400).json({ error: "quantityAdded must be a positive number" });
  }

  next(); // if input is valid, continue to controller
}

module.exports = validateRestock;