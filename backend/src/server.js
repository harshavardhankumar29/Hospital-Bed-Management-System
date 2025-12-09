// src/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bedRoutes = require("./routes/bedRoutes");
const patientRoutes = require("./routes/patientRoutes");
const authRoutes = require("./routes/authRoutes");
const { protect, restrictTo } = require("./middleware/authMiddleware")

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);

// protect subsequent API routes
app.use("/api/beds", protect, restrictTo(["admin", "staff"]), bedRoutes);
app.use("/api/patients", protect, restrictTo(["admin", "staff"]), patientRoutes);


app.get("/", (req, res) => res.send("Hospital Bed Availability API running 🚑"));

// create HTTP server and attach Socket.IO
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" } // allow all origins in dev; tighten in production
});

// make io available to routes/controllers
app.set("io", io);

// optional: log connections
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
