const express = require("express");
const router = express.Router();
const { login, getCurrentUser } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;
