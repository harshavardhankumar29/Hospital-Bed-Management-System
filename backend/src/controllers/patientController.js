// src/controllers/patientController.js
const Patient = require("../models/Patient");
const Bed = require("../models/Bed");

// helper to emit beds refresh
const emitBedsRefresh = async (req) => {
  try {
    const io = req.app.get("io");
    if (!io) return;
    const beds = await Bed.find();
    io.emit("beds:refresh", beds);
  } catch (err) {
    console.error("emitBedsRefresh error:", err);
  }
};

// Admit a patient and allocate an available bed (no transactions)
exports.admitPatient = async (req, res) => {
  try {
    const { name, age, disease, preferredWard, preferredType } = req.body;

    // Atomically reserve a bed by changing status from "Available" -> "Occupied"
    const bedQuery = { status: "Available" };
    if (preferredWard) bedQuery.ward = preferredWard;
    if (preferredType) bedQuery.type = preferredType;

    const bed = await Bed.findOneAndUpdate(
      bedQuery,
      { status: "Occupied" },
      { new: true }
    );

    if (!bed) {
      return res.status(404).json({ error: "No available bed found" });
    }

    // Create patient and link bed
    const patient = await Patient.create({
      name,
      age,
      disease,
      bedId: bed._id
    });

    // Link patientId to bed
    bed.patientId = patient._id;
    await bed.save();

    // emit events
    const io = req.app.get("io");
    if (io) io.emit("patients:admitted", { patient, bed });
    await emitBedsRefresh(req);

    res.status(201).json({ patient, bed });
  } catch (error) {
    console.error("admitPatient error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Discharge patient and release bed (no transactions)
exports.dischargePatient = async (req, res) => {
  try {
    const { id } = req.params; // patient id
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    let releasedBed = null;
    // If patient had a bed, release it
    if (patient.bedId) {
      releasedBed = await Bed.findByIdAndUpdate(patient.bedId, {
        status: "Available",
        patientId: null
      }, { new: true });
    }

    await Patient.findByIdAndDelete(id);

    const io = req.app.get("io");
    if (io) io.emit("patients:discharged", { patientId: id, bed: releasedBed });
    await emitBedsRefresh(req);

    res.status(200).json({ message: "Patient discharged and bed released" });
  } catch (error) {
    console.error("dischargePatient error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Transfer patient to another available bed (no transactions)
exports.transferPatient = async (req, res) => {
  try {
    const { id } = req.params; // patient id
    const { targetWard, targetType } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Atomically reserve a new bed
    const newBedQuery = { status: "Available" };
    if (targetWard) newBedQuery.ward = targetWard;
    if (targetType) newBedQuery.type = targetType;

    const newBed = await Bed.findOneAndUpdate(
      newBedQuery,
      { status: "Occupied" },
      { new: true }
    );

    if (!newBed) {
      return res.status(404).json({ error: "No available target bed" });
    }

    // Release old bed if exists
    if (patient.bedId) {
      await Bed.findByIdAndUpdate(patient.bedId, {
        status: "Available",
        patientId: null
      });
    }

    // Update patient record
    patient.bedId = newBed._id;
    await patient.save();

    // Link patient to new bed
    newBed.patientId = patient._id;
    await newBed.save();

    const io = req.app.get("io");
    if (io) io.emit("patients:transferred", { patient, newBed });
    await emitBedsRefresh(req);

    res.status(200).json({ patient, newBed });
  } catch (error) {
    console.error("transferPatient error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate("bedId");
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single patient
exports.getPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id).populate("bedId");
    if (!patient) return res.status(404).json({ error: "Not found" });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
