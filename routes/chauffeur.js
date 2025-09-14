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
    const status = { Taillieu: true, Greenyard: true };
    factories.forEach(f => { status[f.fabriek] = f.status; });
    res.json({ status });
  } catch (err) {
    console.error("Fout bij ophalen factory status:", err);
    res.status(500).json({ error: "Kan factory status niet ophalen" });
  }
});

// Transport starten
router.post("/startTransport", async (req, res) => {
  const { camion, from, to } = req.body;

  try {
    let update = { location: "Transport" };

    if (to === "Greenyard") {
      update = { ...update, task: "Onderweg", startRijden: new Date(), stopRijden: null };
    } else if (to === "Taillieu") {
      update = { ...update, task: "Leeg onderweg", startTerugRijden: new Date(), stopTerugRijden: null };
    }

    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      update,
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    console.error("Fout bij starten transport:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Transport stoppen
router.post("/stopTransport", async (req, res) => {
  const { camion, location } = req.body;
  try {
    let update = { location, startRijden: null };

    if (location === "Greenyard") {
      update = { ...update, task: "Vol", stopRijden: new Date() };
    } else if (location === "Taillieu") {
      update = { ...update, task: "Leeg", stopTerugRijden: new Date(), startTerugRijden: null };
    }

    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      update,
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
        startTerugRijden: null,
        stopTerugRijden: null,
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

      // Reset proces-tijdstippen
      startVullen: null,
      stopVullen: null,
      startRijden: null,
      stopRijden: null,
      startTerugRijden: null,
      stopTerugRijden: null,
      startLossen: null,
      stopLossen: null,
      startFabricage: null,
      stopFabricage: null,

      // Reset kwaliteitsmetingen vullen
      vulBeschadigdeGranen: 0,
      vulZwarteRingen: 0,
      vulVerkeerdGesnedenGranen: 0,
      vulkwaliteit: null,

      // Reset kwaliteitsmetingen lossen
      losBeschadigdeGranen: 0,
      losZwarteRingen: 0,
      losVerkeerdGesnedenGranen: 0,
      loskwaliteit: null
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Fout bij alle camions idle zetten:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});



module.exports = router;
