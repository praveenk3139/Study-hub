const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { optionalAuth } = require('../middleware/auth');

// GET /api/my-study/subjects - Get all subjects with units & progress
router.get('/subjects', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;

  let subjects = db.prepare('SELECT * FROM subjects WHERE user_id = ? ORDER BY id DESC').all(userId);

  // If user has no subjects yet, seed realistic default subjects per requirements
  if (subjects.length === 0) {
    const s1 = db.prepare("INSERT INTO subjects (user_id, name, code, target_grade, color) VALUES (?, 'Data Structures', 'CS301', 'A+', '#4f46e5')").run(userId);
    const s2 = db.prepare("INSERT INTO subjects (user_id, name, code, target_grade, color) VALUES (?, 'Machine Learning', 'CS402', 'A', '#059669')").run(userId);
    const s3 = db.prepare("INSERT INTO subjects (user_id, name, code, target_grade, color) VALUES (?, 'DBMS', 'CS305', 'A+', '#dc2626')").run(userId);
    const s4 = db.prepare("INSERT INTO subjects (user_id, name, code, target_grade, color) VALUES (?, 'Operating Systems', 'CS302', 'A', '#2563eb')").run(userId);

    // Seed units for Data Structures
    db.prepare("INSERT INTO syllabus (subject_id, unit_number, unit_title, topics_json, estimated_hours, status) VALUES (?, 1, 'Unit 1: Arrays, Stacks & Queues', ?, 12, 'completed')").run(s1.lastInsertRowid, JSON.stringify(['Arrays', 'Stack Operations', 'Queue & Deque']));
    db.prepare("INSERT INTO syllabus (subject_id, unit_number, unit_title, topics_json, estimated_hours, status) VALUES (?, 2, 'Unit 2: Trees & Graphs', ?, 15, 'in_progress')").run(s1.lastInsertRowid, JSON.stringify(['Binary Trees', 'AVL Trees', 'Graphs & BFS/DFS']));
    db.prepare("INSERT INTO syllabus (subject_id, unit_number, unit_title, topics_json, estimated_hours, status) VALUES (?, 3, 'Unit 3: Sorting & Searching', ?, 10, 'in_progress')").run(s1.lastInsertRowid, JSON.stringify(['QuickSort', 'MergeSort', 'Binary Search']));

    subjects = db.prepare('SELECT * FROM subjects WHERE user_id = ? ORDER BY id DESC').all(userId);
  }

  const enriched = subjects.map(sub => {
    const units = db.prepare('SELECT * FROM syllabus WHERE subject_id = ? ORDER BY unit_number ASC').all(sub.id);
    const formattedUnits = units.map(u => ({
      ...u,
      topics: JSON.parse(u.topics_json || '[]'),
      progress_pct: u.status === 'completed' ? 100 : (u.status === 'in_progress' ? 65 : 20)
    }));

    const totalProgress = formattedUnits.length > 0 
      ? Math.round(formattedUnits.reduce((acc, curr) => acc + curr.progress_pct, 0) / formattedUnits.length)
      : 50;

    return {
      ...sub,
      units: formattedUnits,
      overall_progress: totalProgress
    };
  });

  res.json({ subjects: enriched });
});

// POST /api/my-study/subjects - Create new subject
router.post('/subjects', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { name, code, target_grade, color } = req.body;

  if (!name) return res.status(400).json({ error: 'Subject name required' });

  const result = db.prepare(`
    INSERT INTO subjects (user_id, name, code, target_grade, color)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, name, code || 'CS101', target_grade || 'A+', color || '#3b82f6');

  const newSub = db.prepare('SELECT * FROM subjects WHERE id = ?').get(result.lastInsertRowid);
  res.json({ success: true, subject: newSub });
});

// DELETE /api/my-study/subjects/:id - Delete subject
router.delete('/subjects/:id', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const subId = req.params.id;

  db.prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?').run(subId, userId);
  res.json({ success: true });
});

// POST /api/my-study/units - Add unit to subject
router.post('/units', optionalAuth, (req, res) => {
  const { subject_id, unit_number, unit_title, topics } = req.body;

  if (!subject_id || !unit_title) return res.status(400).json({ error: 'Subject ID and unit title required' });

  const topicsArray = Array.isArray(topics) ? topics : (topics ? String(topics).split(',').map(t => t.trim()) : []);

  const result = db.prepare(`
    INSERT INTO syllabus (subject_id, unit_number, unit_title, topics_json, status)
    VALUES (?, ?, ?, ?, 'in_progress')
  `).run(subject_id, unit_number || 1, unit_title, JSON.stringify(topicsArray));

  res.json({ success: true, unit_id: result.lastInsertRowid });
});

module.exports = router;
