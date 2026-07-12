const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const sharp = require('sharp');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage Setup for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'everleaf_gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => uuidv4()
  }
});

const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

function getEvent(req) {
  return db.prepare('SELECT * FROM events WHERE event_code = ?').get(req.user.event_code);
}

// Sharpness calculation using buffer from Cloudinary URL
async function sharpnessScore(url) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    
    const { data, info } = await sharp(Buffer.from(buffer))
      .resize(400, 400, { fit: 'inside' })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
      
    const { width, height } = info;
    let sum = 0, sumSq = 0, count = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        const lap = 4 * data[i] - data[i - 1] - data[i + 1] - data[i - width] - data[i + width];
        sum += lap;
        sumSq += lap * lap;
        count++;
      }
    }
    const mean = sum / count;
    return sumSq / count - mean * mean;
  } catch (e) {
    return 0;
  }
}

// Upload photos direct to Cloudinary
router.post('/upload', requireAuth, upload.array('photos', 30), async (req, res) => {
  const event = getEvent(req);
  if (!event) return res.status(404).json({ error: 'No event found for your account' });

  const burstGroup = uuidv4();
  const results = [];

  for (const file of req.files) {
    const cloudUrl = file.path; 
    const filename = file.filename;
    
    let score = 0;
    let meta = {};
    try {
      score = await sharpnessScore(cloudUrl);
      const response = await fetch(cloudUrl);
      const buffer = await response.arrayBuffer();
      meta = await sharp(Buffer.from(buffer)).metadata();
    } catch (e) {
      score = 0;
    }
    
    const id = uuidv4();
    db.prepare(`INSERT INTO photos (id, event_id, uploader_id, filename, url, burst_group, sharpness, width, height)
                VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(id, event.id, req.user.id, filename, cloudUrl, burstGroup, score, meta.width || null, meta.height || null);
      
    results.push({ id, url: cloudUrl, sharpness: score });
  }

  if (results.length > 1) {
    const best = results.reduce((a, b) => (b.sharpness > a.sharpness ? b : a));
    db.prepare('UPDATE photos SET is_best_shot = 1 WHERE id = ?').run(best.id);
  } else if (results.length === 1) {
    db.prepare('UPDATE photos SET is_best_shot = 1 WHERE id = ?').run(results[0].id);
  }

  res.json({ uploaded: results.length, burst_group: burstGroup });
});

// List all photos
router.get('/', requireAuth, (req, res) => {
  const event = getEvent(req);
  if (!event) return res.status(404).json({ error: 'No event found for your account' });
  const photos = db.prepare('SELECT * FROM photos WHERE event_id = ? ORDER BY created_at DESC').all(event.id);
  res.json({ photos, event: { title: event.title, code: event.event_code } });
});

// Delete photo from database and Cloudinary
router.delete('/:id', requireAuth, async (req, res) => {
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });
  if (photo.uploader_id !== req.user.id && req.user.role !== 'couple') {
    return res.status(403).json({ error: 'You can only delete your own photos' });
  }
  
  try {
    if (photo.filename) {
      await cloudinary.uploader.destroy(photo.filename);
    }
  } catch (e) {
    console.error("Cloudinary delete failed", e);
  }

  db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM face_tags WHERE photo_id = ?').run(req.params.id);
  res.json({ success: true });
});

// Store face descriptors
router.post('/:id/faces', requireAuth, (req, res) => {
  const { descriptors } = req.body;
  if (!Array.isArray(descriptors)) return res.status(400).json({ error: 'descriptors array required' });
  const insert = db.prepare('INSERT INTO face_tags (id, photo_id, descriptor, label) VALUES (?,?,?,?)');
  const tx = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(uuidv4(), req.params.id, JSON.stringify(row.descriptor), row.label || null);
    }
  });
  tx(descriptors);
  res.json({ success: true, count: descriptors.length });
});

// Face Search logic
router.post('/face-search', requireAuth, (req, res) => {
  const { descriptor, threshold = 0.6 } = req.body;
  if (!Array.isArray(descriptor)) return res.status(400).json({ error: 'descriptor array required' });
  const event = getEvent(req);
  if (!event) return res.status(404).json({ error: 'No event found for your account' });

  const rows = db.prepare(`
    SELECT ft.descriptor, ft.photo_id, p.url, p.is_best_shot
    FROM face_tags ft
    JOIN photos p ON p.id = ft.photo_id
    WHERE p.event_id = ?
  `).all(event.id);

  const dist = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));

  const matchesByPhoto = new Map();
  for (const row of rows) {
    const d = dist(descriptor, JSON.parse(row.descriptor));
    if (d <= threshold) {
      const existing = matchesByPhoto.get(row.photo_id);
      if (!existing || d < existing.distance) {
        matchesByPhoto.set(row.photo_id, { photo_id: row.photo_id, url: row.url, is_best_shot: row.is_best_shot, distance: d });
      }
    }
  }

  const matches = [...matchesByPhoto.values()].sort((a, b) => a.distance - b.distance);
  res.json({ matches });
});

module.exports = router;