const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ward: {
      type: String,
      required: true, // ICU, General, Emergency
    },
    type: {
      type: String,
      enum: ["General", "ICU", "Emergency"],
      default: "General",
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance"],
      default: "Available",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bed", bedSchema);
