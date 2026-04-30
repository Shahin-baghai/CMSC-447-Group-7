const {
  adjustMachineSlot,
  restockMachineSlot,
  updateMachineSlot
} = require("../services/machineService");

// updates machine slot with new product and capacity
exports.updateMachineSlot = async (req, res, next) => {
  const { slotId, productId, quantity, capacity } = req.body;
  if (!slotId || (!productId && quantity === undefined && capacity === undefined)) {
    return res.status(400).json({ 
      error: "slotId is required and at least one of productId, quantity, or capacity must be provided"
    });
  }

  try {
    const updatedSlot = await updateMachineSlot(slotId, { productId, quantity, capacity });
    if (updatedSlot.error) return res.status(404).json({ error: updatedSlot.error });
    res.json({ message: "Machine slot updated", item: updatedSlot });
  } catch (err) {
    next(err);
  }
};

// restocks machine slot by adding quantity and reducing backstock
exports.restockMachineSlot = async (req, res, next) => {
  const { slotId, quantityAdded } = req.body;

  try {
    const updatedSlot = await restockMachineSlot(slotId, quantityAdded, req.user);
    if (updatedSlot.error) return res.status(404).json({ error: updatedSlot.error });
    res.json({ message: "Machine slot restocked", item: updatedSlot });
  } catch (err) {
    next(err);
  }
};

exports.adjustMachineSlot = async (req, res, next) => {
  const { slotId, quantityChange } = req.body;

  if (!slotId || typeof quantityChange !== "number" || quantityChange === 0) {
    return res.status(400).json({
      error: "slotId is required and quantityChange must be a non-zero number"
    });
  }

  try {
    const updatedSlot = await adjustMachineSlot(slotId, quantityChange, req.user);
    if (updatedSlot.error) {
      return res.status(400).json({ error: updatedSlot.error });
    }
    res.json({ message: "Machine slot adjusted", item: updatedSlot });
  } catch (err) {
    next(err);
  }
};
