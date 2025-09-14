const express = require("express");
const router = express.Router();
const CamionStatus = require("../models/CamionStatus");

// Ophalen van kwaliteit van een camion
router.get("/:camion/kwaliteit", async (req, res) => {
  try {
    const camion = await CamionStatus.findOne({ camion: req.params.camion });
    if (!camion) return res.status(404).json({ error: "Camion niet gevonden" });

    res.json({
      // Vul kwaliteit data
      vulKwaliteit: camion.vulkwaliteit,
      vulBeschadigdeGranen: camion.vulBeschadigdeGranen,
      vulZwarteRingen: camion.vulZwarteRingen,
      vulVerkeerdGesnedenGranen: camion.vulVerkeerdGesnedenGranen,
      
      // Los kwaliteit data
      losKwaliteit: camion.loskwaliteit,
      losBeschadigdeGranen: camion.losBeschadigdeGranen,
      losZwarteRingen: camion.losZwarteRingen,
      losVerkeerdGesnedenGranen: camion.losVerkeerdGesnedenGranen,
      
      // Backwards compatibility (deprecated)
      beschadigdeGranen: camion.vulBeschadigdeGranen || 0,
      zwarteRingen: camion.vulZwarteRingen || 0,
      verkeerdGesnedenGranen: camion.vulVerkeerdGesnedenGranen || 0
    });
  } catch (err) {
    console.error("Fout bij ophalen kwaliteit:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update kwaliteit van een camion
router.post("/:camion/kwaliteit", async (req, res) => {
  const { beschadigdeGranen, zwarteRingen, verkeerdGesnedenGranen, type } = req.body; 
  
  console.log("Ontvangen data:", { beschadigdeGranen, zwarteRingen, verkeerdGesnedenGranen, type });
  
  // Validatie
  if (beschadigdeGranen == null || zwarteRingen == null || verkeerdGesnedenGranen == null || !type) {
    return res.status(400).json({ 
      error: "Ontbrekende parameters",
      received: { beschadigdeGranen, zwarteRingen, verkeerdGesnedenGranen, type }
    });
  }

  // Controleer of type geldig is
  if (type !== "vul" && type !== "los") {
    return res.status(400).json({ error: "Type moet 'vul' of 'los' zijn" });
  }

  // Controleer of waarden numeriek zijn
  const beschadigdeNum = Number(beschadigdeGranen);
  const zwarteRingenNum = Number(zwarteRingen);
  const verkeerdGesnedenNum = Number(verkeerdGesnedenGranen);

  if (isNaN(beschadigdeNum) || isNaN(zwarteRingenNum) || isNaN(verkeerdGesnedenNum)) {
    return res.status(400).json({ error: "Alle waarden moeten nummers zijn" });
  }

  // Controleer of waarden niet negatief zijn
  if (beschadigdeNum < 0 || zwarteRingenNum < 0 || verkeerdGesnedenNum < 0) {
    return res.status(400).json({ error: "Waarden kunnen niet negatief zijn" });
  }

  // Bepaal kwaliteit
  const aLimiet = 5;
  const kwaliteit = (
    beschadigdeNum <= aLimiet &&
    zwarteRingenNum <= aLimiet &&
    verkeerdGesnedenNum <= aLimiet
  ) ? "A" : "B";

  try {
    // Controleer of camion bestaat
    const existingCamion = await CamionStatus.findOne({ camion: req.params.camion });
    if (!existingCamion) {
      return res.status(404).json({ error: "Camion niet gevonden" });
    }

    // Bouw update object op basis van type
    const update = {};

    if (type === "vul") {
      // Update vul-gerelateerde velden
      update.vulBeschadigdeGranen = beschadigdeNum;
      update.vulZwarteRingen = zwarteRingenNum;
      update.vulVerkeerdGesnedenGranen = verkeerdGesnedenNum;
      update.vulkwaliteit = kwaliteit;
    } else if (type === "los") {
      // Update los-gerelateerde velden
      update.losBeschadigdeGranen = beschadigdeNum;
      update.losZwarteRingen = zwarteRingenNum;
      update.losVerkeerdGesnedenGranen = verkeerdGesnedenNum;
      update.loskwaliteit = kwaliteit;
    }

    console.log("Update object:", update);

    // Update camion
    const updatedCamion = await CamionStatus.findOneAndUpdate(
      { camion: req.params.camion },
      { $set: update },
      { new: true, runValidators: true }
    );

    console.log("Updated camion:", updatedCamion);

    res.json({ 
      success: true, 
      camion: updatedCamion,
      kwaliteit: kwaliteit,
      type: type,
      updatedFields: update
    });

  } catch (err) {
    console.error("Database fout:", err);
    
    // Meer specifieke foutafhandeling
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validatiefout", 
        details: err.message 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        error: "Ongeldige data format", 
        details: err.message 
      });
    }
    
    res.status(500).json({ 
      error: "Server fout bij opslaan", 
      details: err.message 
    });
  }
});

// Extra route voor debugging - ophalen van alle camions
router.get("/debug/all", async (req, res) => {
  try {
    const camions = await CamionStatus.find({});
    res.json(camions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;