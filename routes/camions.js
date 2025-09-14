// routes/camionRoutes.js
const express = require("express");
const router = express.Router();
const CamionStatus = require("../models/CamionStatus");

// GET alle records
router.get("/", async (req, res) => {
  try {
    const camions = await CamionStatus.find();
    res.json(camions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
