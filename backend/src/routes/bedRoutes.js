const express = require("express");
const router = express.Router();
const { addBed, getBeds, updateBedStatus, deleteBed } = require("../controllers/bedController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Get all beds (any authenticated staff/admin)
router.get("/", protect, getBeds);

// Add a bed (admin only)
router.post("/", protect, restrictTo(["admin"]), addBed);

// Update bed status (staff/admin)
router.put("/:id", protect, restrictTo(["admin","staff"]), updateBedStatus);

// Delete bed (admin only)
router.delete("/:id", protect, restrictTo(["admin"]), deleteBed);

module.exports = router;

