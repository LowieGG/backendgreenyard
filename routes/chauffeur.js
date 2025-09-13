const express = require("express");
const router = express.Router();
const CamionStatus = require("../models/CamionStatus");
const FactoryStatus = require("../models/FactoryStatus");

// Status ophalen
router.get("/status", async (req, res) => {
  try {
    const camions = await CamionStatus.find();
    res.json({ camions });
  } catch (err) {
    console.error("Fout bij ophalen camions:", err);
    res.status(500).json({ error: "Kan camions niet ophalen" });
  }
});

// Factory status ophalen
router.get("/factoryStatus", async (req, res) => {
  try {
    const factories = await FactoryStatus.find();
    const status = {
      Taillieu: true,
      Greenyard: true
    };
    
    factories.forEach(factory => {
      status[factory.fabriek] = factory.status;
    });
    
    res.json({ status });
  } catch (err) {
    console.error("Fout bij ophalen factory status:", err);
    res.status(500).json({ error: "Kan factory status niet ophalen" });
  }
});

// Transport starten - FIXED: task moet "Onderweg" zijn!
router.post("/startTransport", async (req, res) => {
  const { camion } = req.body;
  try {
    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        location: "Transport", 
        task: "Onderweg",  // <-- FIXED: was "Vol", moet "Onderweg" zijn!
        startRijden: new Date(), 
        stopRijden: null 
      },
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    console.error("Fout bij starten transport:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Transport stoppen - camion aangekomen bij Greenyard
router.post("/stopTransport", async (req, res) => {
  const { camion } = req.body;
  try {
    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        location: "Greenyard", 
        task: "Vol", 
        stopRijden: new Date(),
        startRijden: null  // <-- Reset startRijden
      },
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    console.error("Fout bij stoppen transport:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Camion terug naar Taillieu sturen (leeg)
router.post("/returnToTaillieu", async (req, res) => {
  const { camion } = req.body;
  try {
    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        task: "Leeg", 
        location: "Taillieu",
        startRijden: null,
        stopRijden: null,
        startVullen: null,
        stopVullen: null,
        startLossen: null,
        stopLossen: null
      },
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    console.error("Fout bij terugsturen naar Taillieu:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Alle camions op Idle zetten
router.post("/allIdle", async (req, res) => {
  try {
    await CamionStatus.updateMany({}, { 
      task: "Leeg",
      location: "Taillieu",
      startVullen: null,
      stopVullen: null,
      startRijden: null,
      stopRijden: null,
      startLossen: null,
      stopLossen: null
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Fout bij alle camions idle zetten:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;