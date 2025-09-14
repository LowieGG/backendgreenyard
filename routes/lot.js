const express = require("express");
const router = express.Router();
const CamionStatus = require("../models/CamionStatus");
const Historiek = require("../models/Historiek");

// Update lotnummer + voeg naar Historiek
router.post("/updateLot", async (req, res) => {
  const { camion, lotnummer } = req.body;

  if (!camion || !lotnummer) {
    return res.status(400).json({ success: false, message: "Camion en lotnummer verplicht" });
  }

  try {
    // 1️⃣ Update lotnummer in originele CamionStatus
    const updatedCamion = await CamionStatus.findOneAndUpdate(
      { camion },
      { lotnummer },
      { new: true }
    );

    if (!updatedCamion) {
      return res.status(404).json({ success: false, message: "Camion niet gevonden" });
    }

    // 2️⃣ Voeg naar Historiek toe
    const historiekEntry = new Historiek({ ...updatedCamion.toObject() });
    await historiekEntry.save();

    res.json({ success: true, camion: updatedCamion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Serverfout" });
  }
});

module.exports = router;
