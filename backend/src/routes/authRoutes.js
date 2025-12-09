// backend/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login, registerStaff } = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Public endpoints
router.post("/register", register); // keep for bootstrapping (or remove if you prefer)
router.post("/login", login);

// Admin-only: create staff/admin accounts
router.post("/register-staff", protect, restrictTo(["admin"]), registerStaff);

module.exports = router;
