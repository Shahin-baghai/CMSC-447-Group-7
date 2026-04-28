const express = require("express");
const router = express.Router();
const {
  adjustMachineSlot,
  restockMachineSlot,
  updateMachineSlot
} = require("../controllers/machineController");
const validateRestock = require("../middleware/validateRestock");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.post("/adjust", requireAuth, adjustMachineSlot);
router.post("/restock", requireAuth, validateRestock, restockMachineSlot);
router.put("/update", requireAuth, requireRole("admin"), updateMachineSlot);

module.exports = router;
