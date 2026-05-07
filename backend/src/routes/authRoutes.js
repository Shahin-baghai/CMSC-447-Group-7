const express = require("express");
const router = express.Router();
const { login, getCurrentUser, getAccounts, createAccount } = require("../controllers/authController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.get("/accounts", requireAuth, requireRole("admin"), getAccounts);
router.post("/accounts", requireAuth, requireRole("admin"), createAccount);

module.exports = router;
