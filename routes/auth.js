const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Code schema en model
const CodeSchema = new mongoose.Schema({
  code: String
});
const Code = mongoose.model('Code', CodeSchema, 'codes'); // collection 'codes'

// POST login endpoint
router.post('/login', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Code is verplicht' });

  try {
    const exists = await Code.findOne({ code });
    if (exists) {
      return res.json({ success: true, message: 'Code geldig!' });
    } else {
      return res.status(401).json({ success: false, message: 'Ongeldige code' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
