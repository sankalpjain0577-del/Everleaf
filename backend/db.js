const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'wedding.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest', -- couple | guest | admin
  plan TEXT NOT NULL DEFAULT 'free',  -- free | plus | premium
  event_code TEXT,                    -- links guests to a couple's event
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  event_code TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  uploader_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  burst_group TEXT,
  sharpness REAL DEFAULT 0,
  is_best_shot INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS face_tags (
  id TEXT PRIMARY KEY,
  photo_id TEXT NOT NULL,
  descriptor TEXT NOT NULL, -- JSON array (128-d face-api.js descriptor), computed client-side and stored
  label TEXT,               -- e.g. 'Bride', 'Groom', or guest name once assigned
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;
