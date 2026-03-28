const express = require("express");
const router = express.Router();

const {
  getInventory,
  getSummary
} = require("../controllers/inventoryController");

router.get("/", getInventory);
router.get("/summary", getSummary);

module.exports = router;