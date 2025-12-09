const mongoose = require("mongoose");

const wardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // ICU, General, etc.
    totalBeds: { type: Number, default: 0 },
    occupiedBeds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ward", wardSchema);
