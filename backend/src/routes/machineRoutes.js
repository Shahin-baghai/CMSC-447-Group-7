const express = require("express");
const router = express.Router();
const {
  restockMachineSlot,
  updateMachineSlot
} = require("../controllers/machineController");
const validateRestock = require("../middleware/validateRestock");

router.post("/restock", validateRestock, restockMachineSlot);
router.put("/update", updateMachineSlot);

module.exports = router;