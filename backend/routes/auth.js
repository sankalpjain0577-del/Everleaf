const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, event_code: user.event_code },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '30d' }
  );
}

// Register as a couple (creates a new event) or as a guest (joins an event via code)
router.post('/register', (req, res) => {
  const { name, email, password, role, event_title, event_code } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (!['couple', 'guest'].includes(role)) return res.status(400).json({ error: 'Role must be couple or guest' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const id = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);

  if (role === 'couple') {
    if (!event_title) return res.status(400).json({ error: 'Event title is required for couples' });
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    db.prepare('INSERT INTO users (id, name, email, password, role, event_code) VALUES (?,?,?,?,?,?)')
      .run(id, name, email, hashed, 'couple', code);
    db.prepare('INSERT INTO events (id, owner_id, title, event_code) VALUES (?,?,?,?)')
      .run(uuidv4(), id, event_title, code);
  } else {
    if (!event_code) return res.status(400).json({ error: 'Event code is required to join as a guest' });
    const event = db.prepare('SELECT * FROM events WHERE event_code = ?').get(event_code.toUpperCase());
    if (!event) return res.status(404).json({ error: 'No event found with that code' });
    db.prepare('INSERT INTO users (id, name, email, password, role, event_code) VALUES (?,?,?,?,?,?)')
      .run(id, name, email, hashed, 'guest', event_code.toUpperCase());
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, event_code: user.event_code } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, event_code: user.event_code } });
});

router.get('/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    res.json({ user: payload });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
