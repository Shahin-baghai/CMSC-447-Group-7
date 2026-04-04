const {
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
    const updatedSlot = await restockMachineSlot(slotId, quantityAdded);
    if (updatedSlot.error) return res.status(404).json({ error: updatedSlot.error });
    res.json({ message: "Machine slot restocked", item: updatedSlot });
  } catch (err) {
    next(err);
  }
};

