// backend/scripts/createAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../src/models/User");
const bcrypt = require("bcryptjs");
dotenv.config();
const connectDB = require("../src/config/db");

(async () => {
  await connectDB();
  const email = "admin@example.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    process.exit(0);
  }
  const hashed = await bcrypt.hash("Admin@123", 10);
  const u = await User.create({ name: "Admin", email, password: hashed, role: "admin" });
  console.log("Created admin:", u.email);
  process.exit(0);
})();
