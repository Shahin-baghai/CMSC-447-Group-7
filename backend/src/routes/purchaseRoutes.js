const express = require("express");
const router = express.Router();
const { recordPurchase, getPurchaseReport } = require("../controllers/purchaseController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.get("/report", requireAuth, requireRole("admin"), getPurchaseReport);
router.post("/record", recordPurchase);

module.exports = router;
