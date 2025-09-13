// backend/models/CamionStatus.js
const mongoose = require("mongoose");

const CamionStatusSchema = new mongoose.Schema({
  camion: { type: String, required: true, unique: true },
  task: { type: String, default: "Idle" },
  location: { type: String, default: "Taillieu" }, // Taillieu, Transport, Greenyard
  
  // Tijdstippen voor alle processen
  startVullen: { type: Date, default: null },
  stopVullen: { type: Date, default: null },
  startRijden: { type: Date, default: null },
  stopRijden: { type: Date, default: null },
  startLossen: { type: Date, default: null }, // <-- NIEUW: voor lossen bij Greenyard
  stopLossen: { type: Date, default: null },  // <-- NIEUW: voor lossen bij Greenyard
  startFabricage: { type: Date, default: null },
  stopFabricage: { type: Date, default: null },
}, {
  timestamps: true // Voegt automatisch createdAt en updatedAt toe
});

module.exports = mongoose.model("CamionStatus", CamionStatusSchema);