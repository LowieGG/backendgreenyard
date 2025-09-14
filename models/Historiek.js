const mongoose = require("mongoose");

const HistoriekSchema = new mongoose.Schema({
  camion: { type: String, required: true },
  task: { type: String, default: "Idle" },
  location: { type: String, default: "Taillieu" },

  startVullen: { type: Date, default: null },
  stopVullen: { type: Date, default: null },
  startRijden: { type: Date, default: null },
  stopRijden: { type: Date, default: null },
  startLossen: { type: Date, default: null },
  stopLossen: { type: Date, default: null },
  startFabricage: { type: Date, default: null },
  stopFabricage: { type: Date, default: null },
  startTerugRijden: { type: Date, default: null },
  stopTerugRijden: { type: Date, default: null },

  vulBeschadigdeGranen: { type: Number, default: 0 },
  vulZwarteRingen: { type: Number, default: 0 },
  vulVerkeerdGesnedenGranen: { type: Number, default: 0 },

  losBeschadigdeGranen: { type: Number, default: 0 },
  losZwarteRingen: { type: Number, default: 0 },
  losVerkeerdGesnedenGranen: { type: Number, default: 0 },

  vulkwaliteit: { type: String, enum: ["A", "B", null], default: null },
  loskwaliteit: { type: String, enum: ["A", "B", null], default: null },

  lotnummer: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Historiek", HistoriekSchema);
