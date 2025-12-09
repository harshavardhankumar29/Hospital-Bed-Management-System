// backend/src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const u = await User.create({ name, email, password: hashed, role: role || "staff" });

    const token = signToken(u);
    res.status(201).json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin-only: create a staff or admin user (does NOT auto-login / return a token)
 * Route should be protected with protect + restrictTo(["admin"])
 */
exports.registerStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    // ensure role is either staff or admin (reject anything else)
    const r = role === "admin" ? "admin" : "staff";

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const u = await User.create({ name, email, password: hashed, role: r });

    // Return created user without password
    res.status(201).json({ user: { id: u._id, name: u.name, email: u.email, role: u.role } });
  } catch (err) {
    console.error("registerStaff error:", err);
    res.status(500).json({ error: err.message });
  }
};
