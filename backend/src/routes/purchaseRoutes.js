const express = require("express");
const router = express.Router();
const { recordPurchase } = require("../controllers/purchaseController");

router.post("/record", recordPurchase);

module.exports = router;