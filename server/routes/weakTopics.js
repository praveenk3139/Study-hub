const express = require('express');
const router = express.Router();
const { db, seedDefaultTopicPerformance } = require('../db');
const { optionalAuth } = require('../middleware/auth');

// GET /api/weak-topics - Fetch all topic performance items for user
router.get('/', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;

  // Ensure default seed performance exists if empty
  seedDefaultTopicPerformance(userId);

  const topics = db.prepare(`
    SELECT * FROM topic_performance 
    WHERE user_id = ? 
    ORDER BY 
      CASE status 
        WHEN 'weak' THEN 1 
        WHEN 'needs_practice' THEN 2 
        WHEN 'strong' THEN 3 
      END ASC, accuracy_pct ASC
  `).all(userId);

  const totalWeak = topics.filter(t => t.status === 'weak').length;
  const needsPractice = topics.filter(t => t.status === 'needs_practice').length;
  const strong = topics.filter(t => t.status === 'strong').length;

  res.json({
    summary: {
      total_weak: totalWeak,
      needs_practice: needsPractice,
      strong: strong,
      total_topics: topics.length
    },
    topics
  });
});

// POST /api/weak-topics/update - Update topic accuracy and status
router.post('/update', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { topic_name, subject_name, unit_name, accuracy_pct, score_delta } = req.body;

  if (!topic_name) return res.status(400).json({ error: 'Topic name required' });

  let existing = db.prepare('SELECT * FROM topic_performance WHERE user_id = ? AND topic_name = ?').get(userId, topic_name);

  let newAccuracy = accuracy_pct !== undefined ? Number(accuracy_pct) : (existing ? existing.accuracy_pct : 50);
  if (score_delta) {
    newAccuracy = Math.min(100, Math.max(0, (existing ? existing.accuracy_pct : 50) + score_delta));
  }

  let newStatus = 'weak';
  if (newAccuracy >= 80) newStatus = 'strong';
  else if (newAccuracy >= 60) newStatus = 'needs_practice';

  const attempts = (existing ? existing.attempts : 0) + 1;
  const oldAccuracy = existing ? existing.accuracy_pct : 40;
  const improvement = Math.max(0, Math.round(newAccuracy - oldAccuracy));

  if (existing) {
    db.prepare(`
      UPDATE topic_performance 
      SET accuracy_pct = ?, attempts = ?, improvement_pct = ?, status = ?, last_tested = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newAccuracy, attempts, improvement, newStatus, existing.id);
  } else {
    db.prepare(`
      INSERT INTO topic_performance (user_id, subject_name, unit_name, topic_name, accuracy_pct, attempts, improvement_pct, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, subject_name || 'General', unit_name || 'Unit 1', topic_name, newAccuracy, 1, 0, newStatus);
  }

  const updated = db.prepare('SELECT * FROM topic_performance WHERE user_id = ? AND topic_name = ?').get(userId, topic_name);
  res.json({ success: true, topic: updated });
});

module.exports = router;
