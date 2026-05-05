const express = require("express");
const router = express.Router();
const { login, getCurrentUser, createAccount } = require("../controllers/authController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/accounts", requireAuth, requireRole("admin"), createAccount);

module.exports = router;
