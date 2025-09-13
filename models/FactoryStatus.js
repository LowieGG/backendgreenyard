// backend/models/FactoryStatus.js
const mongoose = require("mongoose");

const FactoryStatusSchema = new mongoose.Schema({
  fabriek: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ["Taillieu", "Greenyard"] 
  },
  status: { 
    type: Boolean, 
    default: true // true = operationeel, false = panne
  },
  activePanneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Panne',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("FactoryStatus", FactoryStatusSchema);