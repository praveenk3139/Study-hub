const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { optionalAuth } = require('../middleware/auth');

// GET /api/study-rooms - List study rooms
router.get('/', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;

  let rooms = db.prepare('SELECT * FROM study_rooms ORDER BY id DESC').all();

  if (rooms.length === 0) {
    const r1 = db.prepare("INSERT INTO study_rooms (user_id, name, topic, code, timer_mins) VALUES (?, 'Data Structures Exam Prep', 'Trees & Graphs', 'DS-SPRINT-2025', 25)").run(userId);
    const r2 = db.prepare("INSERT INTO study_rooms (user_id, name, topic, code, timer_mins) VALUES (?, 'DBMS Normalization Room', 'Normalization & SQL', 'DBMS-ROOM-404', 45)").run(userId);

    db.prepare("INSERT INTO study_room_messages (room_id, user_id, user_name, content) VALUES (?, ?, 'Praveen Kumar', 'Welcome everyone! Let us review Trees and Graphs today.')").run(r1.lastInsertRowid, userId);
    db.prepare("INSERT INTO study_room_messages (room_id, user_id, user_name, content) VALUES (?, ?, 'Alex Mercer', 'Ready for the 25 min Pomodoro sprint!')").run(r1.lastInsertRowid, userId);

    rooms = db.prepare('SELECT * FROM study_rooms ORDER BY id DESC').all();
  }

  res.json({ rooms });
});

// POST /api/study-rooms - Create a new study room
router.post('/', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { name, topic, timer_mins } = req.body;

  if (!name) return res.status(400).json({ error: 'Room name is required' });

  const code = 'ROOM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const result = db.prepare(`
    INSERT INTO study_rooms (user_id, name, topic, code, timer_mins)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, name, topic || 'General Study', code, timer_mins || 25);

  const room = db.prepare('SELECT * FROM study_rooms WHERE id = ?').get(result.lastInsertRowid);
  res.json({ success: true, room });
});

// GET /api/study-rooms/:id/messages - Get messages in study room
router.get('/:id/messages', optionalAuth, (req, res) => {
  const roomId = req.params.id;
  const messages = db.prepare('SELECT * FROM study_room_messages WHERE room_id = ? ORDER BY id ASC').all(roomId);
  res.json({ messages });
});

// POST /api/study-rooms/:id/messages - Send message to study room
router.post('/:id/messages', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const userName = (req.user && req.user.username) ? req.user.username : 'Praveen Kumar';
  const roomId = req.params.id;
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: 'Message content required' });

  const result = db.prepare(`
    INSERT INTO study_room_messages (room_id, user_id, user_name, content)
    VALUES (?, ?, ?, ?)
  `).run(roomId, userId, userName, content);

  const msg = db.prepare('SELECT * FROM study_room_messages WHERE id = ?').get(result.lastInsertRowid);
  res.json({ success: true, message: msg });
});

module.exports = router;
