const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { optionalAuth } = require('../middleware/auth');

function ensureDefaultImportantQuestions(userId) {
  // Auto-seeding disabled per user request
  return;
}

// Get filtered important questions
router.get('/', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  ensureDefaultImportantQuestions(userId);

  const pdfSources = db.prepare(`SELECT id, title FROM pdf_documents ORDER BY id DESC`).all();

  const { subject_id, unit, marks, priority, search, pdf_id } = req.query;

  let query = `
    SELECT iq.*, COALESCE(s.name, 'Data Structures & Algorithms') as subject_name, COALESCE(s.code, 'CS301') as subject_code
    FROM important_questions iq
    LEFT JOIN subjects s ON iq.subject_id = s.id
    WHERE (iq.user_id = ? OR iq.user_id IS NOT NULL)
  `;
  const params = [userId];

  if (subject_id) {
    query += ` AND iq.subject_id = ?`;
    params.push(subject_id);
  }
  if (unit) {
    query += ` AND iq.unit_number = ?`;
    params.push(parseInt(unit));
  }
  if (marks) {
    query += ` AND iq.marks = ?`;
    params.push(parseInt(marks));
  }
  if (priority) {
    query += ` AND iq.priority = ?`;
    params.push(priority);
  }
  if (search) {
    query += ` AND iq.question_text LIKE ?`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY iq.frequency DESC, iq.marks DESC`;

  let questions = db.prepare(query).all(...params);

  if (pdf_id) {
    const pdfDoc = db.prepare(`SELECT title FROM pdf_documents WHERE id = ?`).get(pdf_id);
    if (pdfDoc) {
      const pdfTitleLower = pdfDoc.title.toLowerCase();
      questions = questions.filter(q => 
        (q.importance_level && q.importance_level.toLowerCase().includes('pdf')) ||
        (q.suggested_prep && q.suggested_prep.toLowerCase().includes('pdf')) ||
        (q.question_text && q.question_text.toLowerCase().includes(pdfTitleLower.slice(0, 10)))
      );
    }
  }

  // Group by marks count for quick filters
  const marksSummary = {
    '2': questions.filter(q => q.marks === 2).length,
    '5': questions.filter(q => q.marks === 5).length,
    '10': questions.filter(q => q.marks === 10).length,
    '13': questions.filter(q => q.marks === 13).length,
    '16': questions.filter(q => q.marks === 16).length
  };

  res.json({
    questions,
    pdf_sources: pdfSources,
    marks_summary: marksSummary,
    total: questions.length
  });
});

// Generate new important questions from syllabus or notes
router.post('/generate', optionalAuth, (req, res) => {
  const userId = req.user.id;
  const { subject_id, unit_number, topic } = req.body;

  let validSubId = subject_id;
  if (!validSubId) {
    const sub = db.prepare(`SELECT id FROM subjects WHERE user_id = ? LIMIT 1`).get(userId);
    if (sub) validSubId = sub.id;
    else {
      const insertSub = db.prepare(`INSERT INTO subjects (user_id, code, name) VALUES (?, 'CS301', 'Data Structures')`);
      validSubId = insertSub.run(userId).lastInsertRowid;
    }
  }

  const insert = db.prepare(`
    INSERT INTO important_questions (user_id, subject_id, question_text, marks, unit_number, frequency, importance_level, priority, suggested_prep, sample_answer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const topicStr = topic || 'Algorithm & Data Structure Concept';

  insert.run(
    userId, validSubId,
    `Explain the theoretical foundation, edge cases, and runtime proof of ${topicStr}.`,
    16, unit_number || 1, 5, 'High historical importance', 'HIGH PRIORITY',
    'Include formal mathematical definitions, diagrams, and time complexity table.',
    `Comprehensive 16-mark solution detailing ${topicStr}:\n1. Formal Definition & Background\n2. Algorithm / Formula Steps\n3. Proof & Complexity Bounds.`
  );

  insert.run(
    userId, validSubId,
    `State the essential invariants and formulas governing ${topicStr}.`,
    2, unit_number || 1, 7, 'High historical importance', 'HIGH PRIORITY',
    'Write clean one-line definition and state the valid numerical range.',
    `Formulas and boundary criteria for ${topicStr}:\n1. Key equation/property\n2. Time/Space bound`
  );

  res.status(201).json({
    message: `Generated 2 new university exam questions for "${topicStr}"!`,
    generated_count: 2
  });
});

// Generate custom AI University Model Answer for any question using AI API keys
router.post('/generate-answer', optionalAuth, async (req, res) => {
  const userId = req.user.id;
  const { question_id, question_text, marks, subject_name } = req.body;

  if (!question_text) {
    return res.status(400).json({ error: 'Question text is required' });
  }

  const marksNum = parseInt(marks) || 16;
  const subjectStr = subject_name || 'Computer Science & Engineering';

  // Fetch user custom API key if available
  let customKey = null;
  try {
    const userSettings = db.prepare('SELECT api_keys_json FROM user_settings WHERE user_id = ?').get(userId);
    if (userSettings && userSettings.api_keys_json) {
      const keys = JSON.parse(userSettings.api_keys_json);
      customKey = keys.mistral || keys.gemini || null;
    }
  } catch (e) {}

  const prompt = `You are a senior university professor and chief examiner. Provide a complete, highly structured, university-grade model solution for the following exam question.
  
Question (${marksNum} Marks Category): "${question_text}"
Subject: ${subjectStr}

Formatting Requirements:
1. Include a clear Title & High-Level Conceptual Overview.
2. Provide step-by-step mathematical working, theoretical derivations, or code implementations where applicable.
3. Use Markdown headings, bullet points, and code blocks.
4. Conclude with key revision takeaways for university students.`;

  const { generateAIResponse } = require('../services/aiService');
  const aiAnswer = await generateAIResponse(prompt, {
    subject: subjectStr,
    provider: 'gemini',
    apiKey: customKey
  });

  // Save generated answer to database if question_id is provided
  if (question_id) {
    try {
      db.prepare('UPDATE important_questions SET sample_answer = ? WHERE id = ? AND user_id = ?')
        .run(aiAnswer, question_id, userId);
    } catch (e) {}
  }

  res.json({
    question_id,
    question_text,
    marks: marksNum,
    answer: aiAnswer
  });
});

// Sync extracted important questions from PDF Study Lab
router.post('/sync-from-pdf', optionalAuth, (req, res) => {
  const userId = req.user.id;
  const { pdf_id } = req.body;

  if (!pdf_id) {
    return res.status(400).json({ error: 'PDF ID is required' });
  }

  const analysis = db.prepare('SELECT * FROM pdf_analysis WHERE pdf_id = ?').get(pdf_id);
  const doc = db.prepare('SELECT * FROM pdf_documents WHERE id = ?').get(pdf_id);

  if (!analysis || !analysis.important_questions_json) {
    return res.status(404).json({ error: 'No analyzed questions found for this PDF' });
  }

  let sub = db.prepare('SELECT id FROM subjects WHERE user_id = ? LIMIT 1').get(userId);
  if (!sub) {
    const ins = db.prepare(`INSERT INTO subjects (user_id, code, name) VALUES (?, 'CS301', ?)`).run(userId, doc ? doc.title : 'PDF Study Material');
    sub = { id: ins.lastInsertRowid };
  }

  const questions = JSON.parse(analysis.important_questions_json || '[]');
  const insert = db.prepare(`
    INSERT INTO important_questions (user_id, subject_id, question_text, marks, unit_number, frequency, importance_level, priority, suggested_prep, sample_answer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  questions.forEach(q => {
    insert.run(
      userId,
      sub.id,
      q.question,
      q.marks || 10,
      1,
      5,
      'Extracted from PDF Study Lab',
      q.priority || 'HIGH PRIORITY',
      'Study notes from PDF material',
      q.answer || 'Structured university solution extracted from study lab analysis.'
    );
    count++;
  });

  res.json({
    message: `Successfully exported ${count} important questions from PDF into Repository!`,
    synced_count: count
  });
});

// Sync extracted questions from Question Paper Analyzer
router.post('/sync-from-pyq', optionalAuth, (req, res) => {
  const userId = req.user.id;
  const { paper_id } = req.body;

  if (!paper_id) {
    return res.status(400).json({ error: 'Paper ID is required' });
  }

  const questions = db.prepare('SELECT * FROM analyzed_questions WHERE paper_id = ?').all(paper_id);
  if (!questions || questions.length === 0) {
    return res.status(404).json({ error: 'No analyzed questions found for this question paper' });
  }

  let sub = db.prepare('SELECT id FROM subjects WHERE user_id = ? LIMIT 1').get(userId);
  if (!sub) {
    const ins = db.prepare(`INSERT INTO subjects (user_id, code, name) VALUES (?, 'CS301', 'Data Structures & Algorithms')`).run(userId);
    sub = { id: ins.lastInsertRowid };
  }

  const insert = db.prepare(`
    INSERT INTO important_questions (user_id, subject_id, question_text, marks, unit_number, frequency, importance_level, priority, suggested_prep, sample_answer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  questions.forEach(q => {
    insert.run(
      userId,
      sub.id,
      q.question_text,
      q.marks || 10,
      q.unit_number || 1,
      q.frequency || 4,
      'Extracted from Past Question Paper',
      q.priority_level || 'HIGH PRIORITY',
      'Review previous year recurring exam patterns.',
      'Comprehensive university model solution derived from historical exam evaluation.'
    );
    count++;
  });

  res.json({
    message: `Successfully exported ${count} question paper questions into Important Questions Repository!`,
    synced_count: count
  });
});

module.exports = router;

