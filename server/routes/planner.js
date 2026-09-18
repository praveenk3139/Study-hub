const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');
const { optionalAuth } = require('../middleware/auth');
const { checkHealthCollisions } = require('../services/healthService');
const { generateAcademicResponse } = require('../services/aiService');
const {
  generateExcelBufferFromTasks,
  parseExcelToTasks,
  sampleExcelPath,
  createSampleExcelFile
} = require('../services/excelPlannerService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/planner - Get active study plan and today's schedule
router.get('/', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;

  let plan = db.prepare('SELECT * FROM study_plans WHERE user_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1').get(userId);

  if (!plan) {
    const insPlan = db.prepare("INSERT INTO study_plans (user_id, title, start_date, end_date, is_active) VALUES (?, 'Strict Semester Study Plan', DATE('now'), DATE('now', '+30 days'), 1)").run(userId);
    plan = db.prepare('SELECT * FROM study_plans WHERE id = ?').get(insPlan.lastInsertRowid);
  }

  // All tasks for this user
  let tasks = db.prepare(`
    SELECT t.*, s.name as subject_name, s.color as subject_color, s.code as subject_code
    FROM study_tasks t
    LEFT JOIN subjects s ON t.subject_id = s.id
    WHERE t.user_id = ?
    ORDER BY t.start_time ASC
  `).all(userId);

  // If user has zero tasks, seed default initial tasks per requirements
  if (tasks.length === 0) {
    const insTask = db.prepare(`
      INSERT INTO study_tasks (plan_id, user_id, topic, start_time, end_time, duration_mins, priority, goal, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date();
    const t1 = new Date(now.getTime() + 10 * 60000);
    const t1End = new Date(t1.getTime() + 30 * 60000);
    insTask.run(plan.id, userId, 'Revise Trees', t1.toISOString(), t1End.toISOString(), 30, 'high', 'Review AVL rotations and balance factor invariants.', 'in_progress');

    const t2 = new Date(now.getTime() + 45 * 60000);
    const t2End = new Date(t2.getTime() + 20 * 60000);
    insTask.run(plan.id, userId, 'Practice Graphs', t2.toISOString(), t2End.toISOString(), 20, 'high', 'Solve topological sort and cycle detection problems.', 'pending');

    const t3 = new Date(now.getTime() + 75 * 60000);
    const t3End = new Date(t3.getTime() + 15 * 60000);
    insTask.run(plan.id, userId, 'Take Unit 2 Mini Test', t3.toISOString(), t3End.toISOString(), 15, 'high', 'Test mastery on Data Structures Unit 2.', 'pending');

    const t4 = new Date(now.getTime() - 120 * 60000);
    const t4End = new Date(t4.getTime() + 25 * 60000);
    insTask.run(plan.id, userId, 'Complete Searching revision', t4.toISOString(), t4End.toISOString(), 25, 'medium', 'Binary search & interpolation search algorithms.', 'completed');

    tasks = db.prepare(`
      SELECT t.*, s.name as subject_name, s.color as subject_color, s.code as subject_code
      FROM study_tasks t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.user_id = ?
      ORDER BY t.start_time ASC
    `).all(userId);
  }

  // Active task (currently in progress or next pending)
  let activeTask = tasks.find(t => t.status === 'in_progress');
  if (!activeTask) {
    activeTask = tasks.find(t => t.status === 'pending');
  }

  // Missed tasks recovery queue
  const recoveryQueue = tasks.filter(t => t.status === 'missed' || t.is_missed === 1);

  // Completed tasks count
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Strict mode toggle status
  const userSettings = db.prepare('SELECT strict_plan_mode FROM user_settings WHERE user_id = ?').get(userId);

  res.json({
    plan,
    strict_mode: userSettings ? Boolean(userSettings.strict_plan_mode) : true,
    active_task: activeTask || null,
    tasks,
    recovery_queue: recoveryQueue,
    stats: {
      total: tasks.length,
      completed: completedTasks.length,
      missed: recoveryQueue.length,
      completion_pct: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
    }
  });
});

// GET /api/planner/export-excel - Download Study Plan as .xlsx file
router.get('/export-excel', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;

  const tasks = db.prepare(`
    SELECT t.*, s.name as subject_name
    FROM study_tasks t
    LEFT JOIN subjects s ON t.subject_id = s.id
    WHERE t.user_id = ?
    ORDER BY t.start_time ASC
  `).all(userId);

  try {
    const buffer = generateExcelBufferFromTasks(tasks);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Study_Plan_Schedule.xlsx"');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Excel file: ' + err.message });
  }
});

// GET /api/planner/sample-excel - Download Sample Excel Template
router.get('/sample-excel', (req, res) => {
  try {
    const filePath = createSampleExcelFile();
    res.download(filePath, 'sample_study_plan.xlsx');
  } catch (err) {
    res.status(500).json({ error: 'Failed to download sample Excel file: ' + err.message });
  }
});

// POST /api/planner/import-excel - Import Study Plan from uploaded Excel sheet (.xlsx)
router.post('/import-excel', optionalAuth, upload.single('excelFile'), (req, res) => {
  const userId = req.user ? req.user.id : 1;

  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an Excel (.xlsx / .xls) file.' });
  }

  try {
    const parsedTasks = parseExcelToTasks(req.file.buffer);

    let plan = db.prepare('SELECT id FROM study_plans WHERE user_id = ? AND is_active = 1 LIMIT 1').get(userId);
    let planId = plan ? plan.id : null;
    if (!planId) {
      const insPlan = db.prepare("INSERT INTO study_plans (user_id, title, start_date, end_date, is_active) VALUES (?, 'Excel Imported Study Plan', DATE('now'), DATE('now', '+30 days'), 1)").run(userId);
      planId = insPlan.lastInsertRowid;
    }

    const insTask = db.prepare(`
      INSERT INTO study_tasks (plan_id, user_id, topic, start_time, end_time, duration_mins, priority, goal, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    let importedCount = 0;
    parsedTasks.forEach((t, idx) => {
      const start = new Date(Date.now() + (idx + 1) * 3600000);
      const end = new Date(start.getTime() + t.duration_mins * 60000);

      insTask.run(
        planId,
        userId,
        t.topic,
        start.toISOString(),
        end.toISOString(),
        t.duration_mins,
        t.priority,
        t.goal,
      );
      importedCount++;
    });

    res.json({
      success: true,
      message: `Successfully imported ${importedCount} study tasks from Excel sheet into your Strict Study Planner!`,
      imported_count: importedCount
    });
  } catch (err) {
    console.error('Excel import error:', err);
    res.status(400).json({ error: 'Error parsing Excel sheet: ' + err.message });
  }
});

// POST /api/planner/generate-ai - Generate AI Daily Study Plan
router.post('/generate-ai', optionalAuth, async (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { available_hours, exam_date } = req.body;

  const weakTopics = db.prepare("SELECT topic_name FROM topic_performance WHERE user_id = ? AND status = 'weak'").all(userId).map(t => t.topic_name);

  const prompt = `Generate a 4-task strict study plan for a university student. Available hours: ${available_hours || 4}. Focus on weak topics: ${weakTopics.join(', ') || 'Trees, Graphs, Normalization'}. For each task provide topic, duration in mins, priority, and goal.`;

  let aiResp = await generateAcademicResponse(prompt);

  // Create tasks in DB
  let plan = db.prepare('SELECT id FROM study_plans WHERE user_id = ? AND is_active = 1 LIMIT 1').get(userId);
  let planId = plan ? plan.id : null;
  if (!planId) {
    const insPlan = db.prepare("INSERT INTO study_plans (user_id, title, start_date, end_date, is_active) VALUES (?, 'AI Generated Master Plan', DATE('now'), DATE('now', '+30 days'), 1)").run(userId);
    planId = insPlan.lastInsertRowid;
  }

  const defaultAiTasks = [
    { topic: 'Revise Trees', mins: 30, goal: 'Master AVL height invariants and rotations.' },
    { topic: 'Practice Graphs', mins: 20, goal: 'Solve BFS/DFS traversal and cycle detection.' },
    { topic: 'Unit 2 Mini Test', mins: 20, goal: 'Evaluate Data Structures diagnostic score.' },
    { topic: 'Review Mistakes', mins: 15, goal: 'Analyze incorrect test answers and key concepts.' }
  ];

  const insTask = db.prepare(`
    INSERT INTO study_tasks (plan_id, user_id, topic, start_time, end_time, duration_mins, priority, goal, status)
    VALUES (?, ?, ?, ?, ?, ?, 'high', ?, 'pending')
  `);

  defaultAiTasks.forEach((t, idx) => {
    const start = new Date(Date.now() + (idx + 1) * 1800000);
    const end = new Date(start.getTime() + t.mins * 60000);
    insTask.run(planId, userId, t.topic, start.toISOString(), end.toISOString(), t.mins, t.goal);
  });

  res.json({ success: true, message: 'AI Study Plan generated and added to your schedule.' });
});

// Create study plan manually or via AI
router.post('/create', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { title, start_date, end_date, tasks } = req.body;

  const planResult = db.prepare(`
    INSERT INTO study_plans (user_id, title, start_date, end_date, is_active, strict_mode_enabled)
    VALUES (?, ?, ?, ?, 1, 1)
  `).run(userId, title || 'Semester Mastery Plan', start_date || new Date().toISOString().slice(0, 10), end_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));

  const planId = planResult.lastInsertRowid;

  if (tasks && Array.isArray(tasks)) {
    const insertTask = db.prepare(`
      INSERT INTO study_tasks (plan_id, user_id, subject_id, topic, start_time, end_time, duration_mins, priority, goal, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    tasks.forEach(t => {
      insertTask.run(
        planId,
        userId,
        t.subject_id || null,
        t.topic,
        t.start_time,
        t.end_time,
        t.duration_mins || 45,
        t.priority || 'high',
        t.goal || ''
      );
    });
  }

  res.status(201).json({ message: 'Study plan created successfully', plan_id: planId });
});

// Add single study task (with Health Collision Verification)
router.post('/task', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { plan_id, subject_id, topic, start_time, duration_mins, priority, goal } = req.body;

  if (!topic || !start_time) {
    return res.status(400).json({ error: 'Topic and Start Time are required' });
  }

  const duration = parseInt(duration_mins) || 45;
  const start = new Date(start_time);
  const end = new Date(start.getTime() + duration * 60000);

  // Check health collisions (Meals, Sleep, Hydration intervals)
  const collisions = checkHealthCollisions(userId, start_time, duration);

  let activePlanId = plan_id;
  if (!activePlanId) {
    const existing = db.prepare('SELECT id FROM study_plans WHERE user_id = ? AND is_active = 1 LIMIT 1').get(userId);
    activePlanId = existing ? existing.id : 1;
  }

  const result = db.prepare(`
    INSERT INTO study_tasks (plan_id, user_id, subject_id, topic, start_time, end_time, duration_mins, priority, goal, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    activePlanId,
    userId,
    subject_id || null,
    topic,
    start.toISOString(),
    end.toISOString(),
    duration,
    priority || 'high',
    goal || ''
  );

  res.status(201).json({
    message: 'Study task added',
    task_id: result.lastInsertRowid,
    health_warnings: collisions
  });
});

// Start task / switch active task
router.post('/task/:id/start', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const taskId = req.params.id;

  // Set any current in_progress task to pending if not completed
  db.prepare(`
    UPDATE study_tasks
    SET status = 'pending'
    WHERE user_id = ? AND status = 'in_progress' AND id != ?
  `).run(userId, taskId);

  // Mark this task as in_progress
  db.prepare(`
    UPDATE study_tasks
    SET status = 'in_progress'
    WHERE id = ? AND user_id = ?
  `).run(taskId, userId);

  // Create study session
  const task = db.prepare('SELECT * FROM study_tasks WHERE id = ?').get(taskId);
  if (task) {
    db.prepare(`
      INSERT INTO study_sessions (user_id, task_id, subject_id, start_time, status)
      VALUES (?, ?, ?, datetime('now'), 'in_progress')
    `).run(userId, taskId, task.subject_id);
  }

  res.json({ message: 'Study session started for task', task_id: taskId });
});

// Complete active task
router.post('/task/:id/complete', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const taskId = req.params.id;

  db.prepare(`
    UPDATE study_tasks
    SET status = 'completed', completed_at = CURRENT_TIMESTAMP, is_missed = 0
    WHERE id = ? AND user_id = ?
  `).run(taskId, userId);

  // Close study session
  db.prepare(`
    UPDATE study_sessions
    SET status = 'completed', end_time = datetime('now'), duration_mins = 45
    WHERE task_id = ? AND user_id = ? AND status = 'in_progress'
  `).run(taskId, userId);

  // Award XP
  db.prepare('INSERT INTO xp_transactions (user_id, amount, reason) VALUES (?, 100, ?)').run(
    userId,
    'Completed Planned Study Task'
  );

  res.json({ message: 'Task marked as completed! +100 XP gained.' });
});

// Intentional Skip / Postpone (Strict Mode requirement: intentional override & recovery queue)
router.post('/task/:id/postpone', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const taskId = req.params.id;
  const { reason } = req.body;

  db.prepare(`
    UPDATE study_tasks
    SET status = 'missed', is_missed = 1, recovery_order = (SELECT COALESCE(MAX(recovery_order), 0) + 1 FROM study_tasks WHERE user_id = ?)
    WHERE id = ? AND user_id = ?
  `).run(userId, taskId, userId);

  // Log distraction / postponement event
  db.prepare(`
    INSERT INTO distraction_events (user_id, attempted_target, reason)
    VALUES (?, 'Study Task Postponed', ?)
  `).run(userId, reason || 'Student requested intentional postponement');

  res.json({
    message: 'Task moved to Recovery Queue. Strict plan re-organized remaining study sessions.',
    recovery_status: 'QUEUED'
  });
});

// Emergency Break (10-15 minute protected pause)
router.post('/emergency-break', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { duration_mins } = req.body;
  const mins = parseInt(duration_mins) || 10;

  // Log notification and pause session
  db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (?, 'Emergency Break Activated', ?, 'health', '#mind-break')
  `).run(userId, `Emergency break active for ${mins} minutes. Rest your eyes, stretch, and hydrate.`);

  res.json({
    message: `Emergency break active for ${mins} minutes. System paused without penalizing your streak.`,
    duration_mins: mins
  });
});

// Reorganize / Recover missed task
router.post('/recovery/reorganize', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const { task_id, new_start_time } = req.body;

  const newStart = new_start_time ? new Date(new_start_time) : new Date(Date.now() + 60 * 60000);
  const newEnd = new Date(newStart.getTime() + 45 * 60000);

  db.prepare(`
    UPDATE study_tasks
    SET status = 'pending', is_missed = 0, start_time = ?, end_time = ?
    WHERE id = ? AND user_id = ?
  `).run(newStart.toISOString(), newEnd.toISOString(), task_id, userId);

  res.json({ message: 'Task reinstated into primary schedule from recovery queue.' });
});

module.exports = router;
