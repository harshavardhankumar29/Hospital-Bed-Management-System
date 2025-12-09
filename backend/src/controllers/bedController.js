// backend/src/controllers/bedController.js
const Bed = require("../models/Bed");

// helper: emit full beds list (populated)
const emitBedsRefresh = async (req) => {
  try {
    const io = req.app.get("io");
    if (!io) return;
    const beds = await Bed.find().populate({
      path: "patientId",
      select: "name _id" // only bring name and id
    });
    io.emit("beds:refresh", beds);
  } catch (err) {
    console.error("emitBedsRefresh error:", err);
  }
};

// Add bed
exports.addBed = async (req, res) => {
  try {
    const bed = await Bed.create(req.body);
    await emitBedsRefresh(req);
    res.status(201).json(bed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all beds (populate patient)
exports.getBeds = async (req, res) => {
  try {
    const beds = await Bed.find().populate({
      path: "patientId",
      select: "name _id"
    });
    res.status(200).json(beds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update bed status
exports.updateBedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bed = await Bed.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    await emitBedsRefresh(req);
    res.status(200).json(bed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete bed
exports.deleteBed = async (req, res) => {
  try {
    const { id } = req.params;
    await Bed.findByIdAndDelete(id);
    await emitBedsRefresh(req);
    res.status(200).json({ message: "Bed deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
