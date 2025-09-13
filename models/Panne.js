// backend/models/Panne.js
const mongoose = require("mongoose");

const PanneSchema = new mongoose.Schema({
  fabriek: { 
    type: String, 
    required: true, 
    enum: ["Taillieu", "Greenyard"] 
  },
  oorzaak: { 
    type: String, 
    required: true 
  },
  beschrijving: { 
    type: String, 
    default: "" 
  },
  startTime: { 
    type: Date, 
    default: Date.now 
  },
  endTime: { 
    type: Date, 
    default: null 
  },
  durationMinutes: { 
    type: Number, 
    default: null 
  },
  status: { 
    type: String, 
    enum: ["Actief", "Opgelost"], 
    default: "Actief" 
  },
  opgelostDoor: { 
    type: String, 
    default: null 
  }
}, {
  timestamps: true
});

// Bereken duur automatisch bij oplossen
PanneSchema.pre('save', function(next) {
  if (this.endTime && this.startTime && !this.durationMinutes) {
    this.durationMinutes = Math.floor((this.endTime - this.startTime) / (1000 * 60));
  }
  next();
});

module.exports = mongoose.model("Panne", PanneSchema);