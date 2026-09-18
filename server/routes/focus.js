const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { optionalAuth } = require('../middleware/auth');

function ensureDefaultSites(userId) {
  const blockedCount = db.prepare('SELECT COUNT(*) as count FROM blocked_sites WHERE user_id = ?').get(userId);
  if (blockedCount.count === 0) {
    const insertBlocked = db.prepare('INSERT INTO blocked_sites (user_id, domain, category, is_active) VALUES (?, ?, ?, 1)');
    const defaultBlocked = [
      { domain: 'instagram.com', category: 'Social Media' },
      { domain: 'tiktok.com', category: 'Social Media' },
      { domain: 'facebook.com', category: 'Social Media' },
      { domain: 'x.com', category: 'Social Media' },
      { domain: 'twitter.com', category: 'Social Media' },
      { domain: 'reddit.com', category: 'Social Media' },
      { domain: 'netflix.com', category: 'Entertainment' },
      { domain: 'twitch.tv', category: 'Streaming' }
    ];
    defaultBlocked.forEach(b => insertBlocked.run(userId, b.domain, b.category));
  }

  const allowedCount = db.prepare('SELECT COUNT(*) as count FROM allowed_sites WHERE user_id = ?').get(userId);
  if (allowedCount.count === 0) {
    const insertAllowed = db.prepare('INSERT INTO allowed_sites (user_id, domain, category, is_active) VALUES (?, ?, ?, 1)');
    const defaultAllowed = [
      { domain: 'wikipedia.org', category: 'Reference' },
      { domain: 'github.com', category: 'Development' },
      { domain: 'geeksforgeeks.org', category: 'Academic' },
      { domain: 'coursera.org', category: 'Education' },
      { domain: 'stackoverflow.com', category: 'Technical Q&A' }
    ];
    defaultAllowed.forEach(a => insertAllowed.run(userId, a.domain, a.category));
  }
}

// Get focus mode configuration, blocked/allowed lists, and YouTube/WhatsApp settings
router.get('/', optionalAuth, (req, res) => {
  const userId = req.user.id;
  ensureDefaultSites(userId);

  const blocked = db.prepare('SELECT * FROM blocked_sites WHERE user_id = ?').all(userId);
  const allowed = db.prepare('SELECT * FROM allowed_sites WHERE user_id = ?').all(userId);
  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);

  // Active focus session
  const activeSession = db.prepare(`
    SELECT * FROM focus_sessions
    WHERE user_id = ? AND status = 'in_progress'
    ORDER BY created_at DESC
    LIMIT 1
  `).get(userId);

  // Recent focus sessions
  const recentSessions = db.prepare(`
    SELECT * FROM focus_sessions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `).all(userId);

  // Distraction events count
  const distractionCount = db.prepare(`
    SELECT COUNT(*) as count FROM distraction_events
    WHERE user_id = ? AND date(created_at) = date('now')
  `).get(userId);

  res.json({
    active_session: activeSession || null,
    active_mode: activeSession ? activeSession.mode : 'deep_study',
    blocked_sites: blocked,
    allowed_sites: allowed,
    youtube_settings: {
      study_mode_enabled: Boolean(settings ? settings.youtube_study_mode : true),
      shorts_restricted: Boolean(settings ? settings.shorts_restricted : true),
      daily_limit_mins: settings ? settings.daily_youtube_limit_mins : 60,
      today_time_spent_mins: 22
    },
    whatsapp_settings: {
      allowed: true,
      track_session_leaves: true,
      privacy_notice: 'StudyFlow tracks study session continuity only; private messages are never inspected or read.'
    },
    recent_sessions: recentSessions,
    today_distraction_attempts: distractionCount.count
  });
});

// Update focus mode settings & start new focus session
router.post('/mode', optionalAuth, (req, res) => {
  const userId = req.user.id;
  const { mode, planned_mins } = req.body; // deep_study, exam_mode, light_study, break_mode

  // Abandon previous in_progress session if any
  db.prepare(`
    UPDATE focus_sessions SET status = 'abandoned'
    WHERE user_id = ? AND status = 'in_progress'
  `).run(userId);

  const insertSession = db.prepare(`
    INSERT INTO focus_sessions (user_id, mode, duration_mins, planned_mins, status)
    VALUES (?, ?, 0, ?, 'in_progress')
  `);
  const result = insertSession.run(userId, mode || 'deep_study', planned_mins || 45);
  const activeSession = db.prepare('SELECT * FROM focus_sessions WHERE id = ?').get(result.lastInsertRowid);

  res.json({
    message: `Focus Shield activated in [${(mode || 'deep_study').toUpperCase()}] mode`,
    session_id: result.lastInsertRowid,
    mode: mode || 'deep_study',
    active_session: activeSession
  });
});

// Complete active focus session
router.post('/session/complete', optionalAuth, (req, res) => {
  const userId = req.user.id;
  const { session_id, duration_mins } = req.body;

  const session = db.prepare('SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?').get(session_id, userId);
  if (!session) return res.status(404).json({ error: 'Focus session not found' });

  const finalMins = duration_mins || session.planned_mins || 45;

  db.prepare(`
    UPDATE focus_sessions
    SET status = 'completed', duration_mins = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(finalMins, session_id, userId);

  // Award XP
  db.prepare('INSERT INTO xp_transactions (user_id, amount, reason) VALUES (?, 50, ?)').run(userId, `Completed ${finalMins}-Min Focus Shield Session`);

  res.json({
    message: `🎉 Focus session completed successfully! +50 XP gained.`,
    duration_mins: finalMins
  });
});

// Abandon active focus session
router.post('/session/abandon', optionalAuth, (req, res) => {
  const userId = req.user.id;
  const { session_id } = req.body;

  db.prepare(`
    UPDATE focus_sessions
    SET status = 'abandoned'
    WHERE id = ? AND user_id = ?
  `).run(session_id, userId);

  res.json({ message: 'Focus session ended.' });
});

// Log a distraction attempt
router.post('/distraction-event', optionalAuth, (req, res) => {
  const userId = req.user.id;
  const { attempted_target, reason } = req.body;

  db.prepare(`
    INSERT INTO distraction_events (user_id, attempted_target, reason)
    VALUES (?, ?, ?)
  `).run(userId, attempted_target || 'Blocked Website', reason || 'Navigated while Deep Study active');

  // Increment distraction attempt count on active session
  db.prepare(`
    UPDATE focus_sessions
    SET distraction_attempts = distraction_attempts + 1
    WHERE user_id = ? AND status = 'in_progress'
  `).run(userId);

  res.json({
    message: 'Distraction logged by Focus Shield. Stay focused on your active study task!',
    target: attempted_target
  });
});

// Add / Remove blocked site
router.post('/blocked-sites', optionalAuth, (req, res) => {
  const userId = req.user.id;
  const { domain, category } = req.body;

  if (!domain) return res.status(400).json({ error: 'Domain is required' });

  db.prepare(`
    INSERT INTO blocked_sites (user_id, domain, category, is_active)
    VALUES (?, ?, ?, 1)
  `).run(userId, domain.toLowerCase().trim(), category || 'Custom Distraction');

  res.status(201).json({ message: `Added ${domain} to Focus Blocklist` });
});

router.delete('/blocked-sites/:id', optionalAuth, (req, res) => {
  const userId = req.user.id;
  db.prepare('DELETE FROM blocked_sites WHERE id = ? AND user_id = ?').run(req.params.id, userId);
  res.json({ message: 'Removed site from blocklist' });
});

// Update YouTube Study Mode settings
router.put('/youtube-settings', optionalAuth, (req, res) => {
  const userId = req.user.id;
  const { youtube_study_mode, shorts_restricted, daily_youtube_limit_mins } = req.body;

  db.prepare(`
    UPDATE user_settings
    SET youtube_study_mode = COALESCE(?, youtube_study_mode),
        shorts_restricted = COALESCE(?, shorts_restricted),
        daily_youtube_limit_mins = COALESCE(?, daily_youtube_limit_mins),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(
    youtube_study_mode !== undefined ? (youtube_study_mode ? 1 : 0) : null,
    shorts_restricted !== undefined ? (shorts_restricted ? 1 : 0) : null,
    daily_youtube_limit_mins || null,
    userId
  );

  res.json({ message: 'YouTube Study Mode settings updated successfully' });
});

module.exports = router;
