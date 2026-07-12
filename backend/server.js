require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
const pricingRoutes = require('./routes/pricing');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'https://everleaf-henna.vercel.app', credentials: true }));app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/pricing', pricingRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Wedding Gallery API running on port ${PORT}`));
