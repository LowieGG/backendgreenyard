const express = require("express");
const router = express.Router();
const CamionStatus = require("../models/CamionStatus");
const Panne = require("../models/Panne");
const FactoryStatus = require("../models/FactoryStatus");

// Alle camions ophalen
router.get("/status", async (req, res) => {
  try {
    const camions = await CamionStatus.find();
    res.json({ camions });
  } catch (err) {
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

// Panne status ophalen voor Taillieu
router.get("/panneStatus", async (req, res) => {
  try {
    const panne = await Panne.findOne({ 
      fabriek: "Taillieu", 
      status: "Actief" 
    });
    res.json({ panne });
  } catch (err) {
    console.error("Fout bij ophalen panne status:", err);
    res.status(500).json({ error: "Kan panne status niet ophalen" });
  }
});

// Start vullen
router.post("/start", async (req, res) => {
  const { camion } = req.body;
  try {
    // Check of Taillieu operationeel is
    const factory = await FactoryStatus.findOne({ fabriek: "Taillieu" });
    if (factory && !factory.status) {
      return res.status(400).json({ success: false, error: "Fabriek heeft panne" });
    }

    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        task: "Vullen", 
        startVullen: new Date(), 
        stopVullen: null,
        location: "Taillieu" 
      },
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Stop vullen en start transport
router.post("/startTransport", async (req, res) => {
  const { camion } = req.body;
  try {
    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        task: "Vol", 
        location: "Taillieu",
        stopVullen: new Date() 
      },
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Verplaats naar Greenyard
router.post("/moveToGreenyard", async (req, res) => {
  const { camion } = req.body;
  try {
    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        task: "Vol", 
        location: "Greenyard" 
      },
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Panne melden voor Taillieu
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

// Panne oplossen voor Taillieu
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

// Stop vullen (oude functie, behouden voor compatibiliteit)
router.post("/stop", async (req, res) => {
  const { camion } = req.body;
  try {
    const task = await CamionStatus.findOneAndUpdate(
      { camion },
      { 
        task: "Vol",
        stopVullen: new Date()
      },
      { new: true }
    );
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false });
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
      stopLossen: null,
      // Voeg alle kwaliteitsvelden toe:
      vulBeschadigdeGranen: 0,
      vulZwarteRingen: 0,
      vulVerkeerdGesnedenGranen: 0,
      losBeschadigdeGranen: 0,
      losZwarteRingen: 0,
      losVerkeerdGesnedenGranen: 0,
      vulkwaliteit: null,
      loskwaliteit: null
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;