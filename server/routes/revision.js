const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { optionalAuth } = require('../middleware/auth');
const { generateAcademicResponse } = require('../services/aiService');

// GET /api/revision/:topic - Get structured revision session data for topic
router.get('/:topic', optionalAuth, async (req, res) => {
  const topicName = req.params.topic;
  const userId = req.user ? req.user.id : 1;

  const topicPerf = db.prepare('SELECT * FROM topic_performance WHERE user_id = ? AND topic_name LIKE ?').get(userId, `%${topicName}%`);

  const subjectName = topicPerf ? topicPerf.subject_name : 'Data Structures';
  const unitName = topicPerf ? topicPerf.unit_name : 'Unit 2';
  const displayTopic = topicPerf ? topicPerf.topic_name : topicName;

  // AI generated explanation or fallback high quality structure
  let revisionText = `A ${displayTopic.toLowerCase()} is a fundamental concept in ${subjectName}. It organizes data systematically to allow efficient searching, insertion, and retrieval operations.`;
  let keyPoints = [
    `Root node / Primary entry point of structure`,
    `Parent-child relationship hierarchy`,
    `Terminal leaf nodes (nodes without children)`,
    `Binary invariant (maximum 2 branching children per node)`
  ];
  let formulas = [
    `Max nodes at level L = 2^L`,
    `Max nodes in binary tree of height H = 2^(H+1) - 1`,
    `Height of balanced AVL tree = O(log N)`
  ];
  let commonMistakes = [
    `Confusing height (edges to deepest leaf) with depth (edges from root).`,
    `Forgetting to rebalance AVL trees after multi-node insertions.`,
    `Not checking null pointers for leaf node traversal.`
  ];
  let examples = [
    `File System Folder Hierarchy (Root / home / user / documents)`,
    `DOM Tree in Browser Rendering Engines`,
    `Abstract Syntax Tree (AST) in Compilers`
  ];

  // Try fetching fresh Gemini explanation if possible
  try {
    const aiPrompt = `Generate a concise university-level study revision guide for topic "${displayTopic}" in subject "${subjectName}" (${unitName}). Include 4 key points, formulas or definitions, and common student mistakes.`;
    const aiResp = await generateAcademicResponse(aiPrompt);
    if (aiResp && aiResp.length > 50) {
      revisionText = aiResp;
    }
  } catch (err) {
    // Keep high quality fallback
  }

  // Diagram configuration (e.g. for Trees or Graphs)
  let diagramType = 'tree';
  let diagramData = {
    nodes: [
      { id: 'A', label: 'A (Root)' },
      { id: 'B', label: 'B' },
      { id: 'C', label: 'C' },
      { id: 'D', label: 'D (Leaf)' },
      { id: 'E', label: 'E (Leaf)' },
      { id: 'F', label: 'F (Leaf)' },
      { id: 'G', label: 'G (Leaf)' }
    ],
    edges: [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'B', to: 'E' },
      { from: 'C', to: 'F' },
      { from: 'C', to: 'G' }
    ]
  };

  // Mini test questions (3 questions for mini test retest)
  let miniTestQuestions = [
    {
      id: 1,
      question: `What is the maximum number of children a node can have in a binary ${displayTopic.toLowerCase()}?`,
      options: ['1', '2', '3', 'Unlimited'],
      correct: '2',
      explanation: 'By definition, every node in a binary tree has at most two child nodes (left and right).'
    },
    {
      id: 2,
      question: `Which traversal order visits the root node BEFORE its left and right subtrees?`,
      options: ['In-order', 'Pre-order', 'Post-order', 'Level-order'],
      correct: 'Pre-order',
      explanation: 'Pre-order traversal follows Root -> Left -> Right.'
    },
    {
      id: 3,
      question: `In a self-balancing search tree, height is guaranteed to remain bounded by:`,
      options: ['O(N)', 'O(log N)', 'O(1)', 'O(N^2)'],
      correct: 'O(log N)',
      explanation: 'Self-balancing trees (AVL, Red-Black) maintain height of O(log N) through rotation invariants.'
    }
  ];

  res.json({
    topic: displayTopic,
    subject: subjectName,
    unit: unitName,
    accuracy: topicPerf ? topicPerf.accuracy_pct : 45,
    status: topicPerf ? topicPerf.status : 'weak',
    revisionText,
    keyPoints,
    formulas,
    commonMistakes,
    examples,
    diagramType,
    diagramData,
    miniTestQuestions
  });
});

// POST /api/revision/:topic/retest - Submit retest result & calculate improvement
router.post('/:topic/retest', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.id : 1;
  const topicName = req.params.topic;
  const { score, total } = req.body; // e.g. 3 out of 3 = 100%

  const newPct = Math.round((Number(score) / Number(total || 3)) * 100);

  let topicPerf = db.prepare('SELECT * FROM topic_performance WHERE user_id = ? AND topic_name LIKE ?').get(userId, `%${topicName}%`);

  const prevPct = topicPerf ? topicPerf.accuracy_pct : 45;
  const improvement = Math.max(0, newPct - prevPct);
  const attempts = (topicPerf ? topicPerf.attempts : 0) + 1;

  let newStatus = 'weak';
  if (newPct >= 80) newStatus = 'strong';
  else if (newPct >= 60) newStatus = 'needs_practice';

  if (topicPerf) {
    db.prepare(`
      UPDATE topic_performance 
      SET accuracy_pct = ?, attempts = ?, improvement_pct = ?, status = ?, last_tested = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newPct, attempts, improvement, newStatus, topicPerf.id);
  } else {
    db.prepare(`
      INSERT INTO topic_performance (user_id, subject_name, unit_name, topic_name, accuracy_pct, attempts, improvement_pct, status)
      VALUES (?, 'Data Structures', 'Unit 2', ?, ?, ?, ?, ?)
    `).run(userId, topicName, newPct, attempts, improvement, newStatus);
  }

  res.json({
    success: true,
    previous_score: prevPct,
    retest_score: newPct,
    improvement_points: improvement,
    new_status: newStatus
  });
});

module.exports = router;
