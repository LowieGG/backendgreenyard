require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes importeren
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const taillieuRoutes = require('./routes/taillieu');
app.use('/api/taillieu', taillieuRoutes);

const chauffeurRoutes = require("./routes/chauffeur"); // hier
app.use("/api/chauffeur", chauffeurRoutes);

app.use('/api/greenyard', require('./routes/greenyard'));

// VOEG DEZE REGEL TOE:
app.use('/api/kwaliteit', require('./routes/kwaliteit'));

app.use("/api/camions", require('./routes/camions'));
const lotRoutes = require("./routes/lot");
app.use("/api/lot", lotRoutes);


// Verbinding met MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB connection error ❌", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
