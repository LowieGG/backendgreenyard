const express = require("express");
const router = express.Router();
const CamionStatus = require("../models/CamionStatus");
const Panne = require("../models/Panne");
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

// Panne status ophalen voor specifieke fabriek
router.get("/panneStatus", async (req, res) => {
  try {
    const panne = await Panne.findOne({ 
      fabriek: "Greenyard", 
      status: "Actief" 
    });
    res.json({ panne });
  } catch (err) {
    console.error("Fout bij ophalen panne status:", err);
    res.status(500).json({ error: "Kan panne status niet ophalen" });
  }
});

// Start lossen
router.post("/startUnloading", async (req, res) => {
  const { camion } = req.body;
  try {
    // Check of Greenyard operationeel is
    const factory = await FactoryStatus.findOne({ fabriek: "Greenyard" });
    if (factory && !factory.status) {
      return res.status(400).json({ success: false, error: "Fabriek heeft panne" });
    }

    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        task: "Lossen",
        startLossen: new Date(),
        stopLossen: null
      },
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    console.error("Fout bij starten lossen:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Stop lossen - camion is leeg
router.post("/stopUnloading", async (req, res) => {
  const { camion } = req.body;
  try {
    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        task: "Leeg",
        stopLossen: new Date(),
        startLossen: null
      },
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    console.error("Fout bij stoppen lossen:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Panne melden
router.post("/reportPanne", async (req, res) => {
  const { fabriek, oorzaak, beschrijving } = req.body;
  try {
    // Maak nieuwe panne record
    const panne = new Panne({
      fabriek,
      oorzaak,
      beschrijving
    });
    await panne.save();

    // Update factory status
    await FactoryStatus.findOneAndUpdate(
      { fabriek },
      { 
        status: false, 
        activePanneId: panne._id 
      },
      { upsert: true }
    );

    res.json({ success: true, panne });
  } catch (err) {
    console.error("Fout bij melden panne:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Panne oplossen
router.post("/fixPanne", async (req, res) => {
  const { fabriek } = req.body;
  try {
    // Vind actieve panne
    const panne = await Panne.findOne({ fabriek, status: "Actief" });
    if (panne) {
      // Update panne record
      panne.endTime = new Date();
      panne.status = "Opgelost";
      await panne.save();
    }

    // Update factory status
    await FactoryStatus.findOneAndUpdate(
      { fabriek },
      { 
        status: true, 
        activePanneId: null 
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Fout bij oplossen panne:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Lege camion terug naar Taillieu
router.post("/returnToTaillieu", async (req, res) => {
  const { camion } = req.body;
  try {
    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        task: "Leeg",
        location: "Taillieu",
        startLossen: null,
        stopLossen: null,
        startRijden: null,
        stopRijden: null,
        startVullen: null,
        stopVullen: null
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