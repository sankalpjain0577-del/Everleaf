const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'per event',
        limits: { photos: 100, guests: 30, aiFaceSearch: false, bestShot: false },
        features: ['100 photo uploads', 'Up to 30 guests', 'Shareable event code', 'Basic gallery']
      },
      {
        id: 'plus',
        name: 'Plus',
        price: 1499,
        period: 'per event',
        limits: { photos: 1000, guests: 150, aiFaceSearch: true, bestShot: true },
        features: ['1,000 photo uploads', 'Up to 150 guests', 'Guest selfie face search', 'Best-shot detection', 'Downloadable albums']
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 3499,
        period: 'per event',
        limits: { photos: -1, guests: -1, aiFaceSearch: true, bestShot: true },
        features: ['Unlimited uploads', 'Unlimited guests', 'Bride & Groom auto-separation', 'Priority processing', 'Custom event branding']
      }
    ]
  });
});

module.exports = router;
