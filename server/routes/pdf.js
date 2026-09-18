const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfModule = require('pdf-parse');
const pdfParse = typeof pdfModule === 'function' ? pdfModule : (pdfModule.PDFParse || pdfModule.default);
const { db } = require('../db');
const { optionalAuth } = require('../middleware/auth');
const { generateAcademicResponse, generatePdfStudyPack } = require('../services/aiService');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are supported'));
    }
  }
});

// List all uploaded PDFs for user
router.get('/', optionalAuth, (req, res) => {
  const docs = db.prepare(`
    SELECT p.*, 
           a.summary,
           (SELECT COUNT(*) FROM json_each(a.flashcards_json)) as flashcards_count,
           (SELECT COUNT(*) FROM json_each(a.mcqs_json)) as mcqs_count
    FROM pdf_documents p
    LEFT JOIN pdf_analysis a ON p.id = a.pdf_id
    ORDER BY p.created_at DESC
  `).all();

  res.json({ documents: docs });
});

// DELETE /api/pdf/clear-all - Remove all PDF documents & analysis records
router.delete('/clear-all', optionalAuth, (req, res) => {
  try {
    const docs = db.prepare('SELECT filename FROM pdf_documents').all();
    docs.forEach(doc => {
      if (doc.filename) {
        const filePath = path.join(uploadsDir, doc.filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
    });

    db.prepare('DELETE FROM pdf_analysis').run();
    db.prepare('DELETE FROM pdf_documents').run();

    res.json({ success: true, message: 'All PDF data and uploaded files removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear PDF data: ' + err.message });
  }
});

// DELETE /api/pdf/:id - Remove single PDF document
router.delete('/:id', optionalAuth, (req, res) => {
  const pdfId = req.params.id;
  try {
    const doc = db.prepare('SELECT filename FROM pdf_documents WHERE id = ?').get(pdfId);
    if (doc && doc.filename) {
      const filePath = path.join(uploadsDir, doc.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    db.prepare('DELETE FROM pdf_analysis WHERE pdf_id = ?').run(pdfId);
    db.prepare('DELETE FROM pdf_documents WHERE id = ?').run(pdfId);

    res.json({ success: true, message: 'PDF document deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete PDF document: ' + err.message });
  }
});

// Get single PDF details with full analysis
router.get('/:id', optionalAuth, async (req, res) => {
  const pdfId = req.params.id;
  const doc = db.prepare('SELECT * FROM pdf_documents WHERE id = ?').get(pdfId);
  if (!doc) return res.status(404).json({ error: 'PDF document not found' });

  let analysis = db.prepare('SELECT * FROM pdf_analysis WHERE pdf_id = ?').get(pdfId);

  // If missing study pack items (question paper, important questions, test), regenerate dynamically
  if (analysis && (!analysis.question_paper_json || !analysis.important_questions_json || !analysis.test_json)) {
    const studyPack = await generatePdfStudyPack(doc.title, doc.extracted_text || '');
    db.prepare(`
      UPDATE pdf_analysis 
      SET question_paper_json = ?, important_questions_json = ?, test_json = ?
      WHERE pdf_id = ?
    `).run(
      JSON.stringify(studyPack.question_paper || null),
      JSON.stringify(studyPack.important_questions || []),
      JSON.stringify(studyPack.test || null),
      pdfId
    );
    analysis = db.prepare('SELECT * FROM pdf_analysis WHERE pdf_id = ?').get(pdfId);
  }

  res.json({
    document: doc,
    analysis: analysis ? {
      ...analysis,
      key_concepts: JSON.parse(analysis.key_concepts_json || '[]'),
      flashcards: JSON.parse(analysis.flashcards_json || '[]'),
      mcqs: JSON.parse(analysis.mcqs_json || '[]'),
      descriptive_questions: JSON.parse(analysis.descriptive_json || '[]'),
      question_paper: analysis.question_paper_json ? JSON.parse(analysis.question_paper_json) : null,
      important_questions: analysis.important_questions_json ? JSON.parse(analysis.important_questions_json) : [],
      test: analysis.test_json ? JSON.parse(analysis.test_json) : null
    } : null
  });
});

async function extractPdfText(dataBuffer) {
  try {
    const pdfModule = require('pdf-parse');
    if (typeof pdfModule === 'function') {
      const data = await pdfModule(dataBuffer);
      return { text: data.text || '', numpages: data.numpages || 1 };
    }
    const PDFClass = pdfModule.PDFParse || pdfModule.default;
    if (PDFClass) {
      const parser = new PDFClass({ data: dataBuffer, verbosity: 0 });
      const result = await parser.getText();
      const text = typeof result === 'string' ? result : (result.text || '');
      const pageCount = result.total || (result.pages ? result.pages.length : 1);
      try { await parser.destroy(); } catch (e) {}
      return { text, numpages: pageCount };
    }
  } catch (e) {
    console.warn('PDF Parsing exception:', e.message);
  }
  return { text: '', numpages: 1 };
}

// Upload and analyze PDF
router.post('/upload', optionalAuth, upload.single('pdf'), async (req, res) => {
  try {
    const userId = (req.user && req.user.id) ? req.user.id : 1;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    let extractedText = '';
    let pageCount = 1;

    try {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await extractPdfText(dataBuffer);
      extractedText = pdfData.text || '';
      pageCount = pdfData.numpages || 1;
    } catch (parseErr) {
      console.warn('Could not parse PDF text directly, using fallback metadata:', parseErr.message);
      extractedText = `Document: ${file.originalname}\nExtracted text summary from uploaded university material.`;
    }

    const title = req.body.title || path.basename(file.originalname, path.extname(file.originalname));
    const category = req.body.category || 'lecture_notes';

    // Insert Document Record
    const insertDoc = db.prepare(`
      INSERT INTO pdf_documents (user_id, title, filename, original_name, file_size, page_count, extracted_text, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const docResult = insertDoc.run(userId, title, file.filename, file.originalname, file.size, pageCount, extractedText.slice(0, 50000), category);
    const pdfId = docResult.lastInsertRowid;

    // Generate AI Study Pack using Gemini / Mistral API
    const studyPack = await generatePdfStudyPack(title, extractedText);

    db.prepare(`
      INSERT INTO pdf_analysis (pdf_id, summary, detailed_notes, short_notes, key_concepts_json, flashcards_json, mcqs_json, descriptive_json, question_paper_json, important_questions_json, test_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pdfId,
      studyPack.summary,
      studyPack.detailed_notes,
      studyPack.short_notes,
      JSON.stringify(studyPack.key_concepts || []),
      JSON.stringify(studyPack.flashcards || []),
      JSON.stringify(studyPack.mcqs || []),
      JSON.stringify(studyPack.descriptive_questions || []),
      JSON.stringify(studyPack.question_paper || null),
      JSON.stringify(studyPack.important_questions || []),
      JSON.stringify(studyPack.test || null)
    );

    // Award XP for uploading notes
    db.prepare('INSERT INTO xp_transactions (user_id, amount, reason) VALUES (?, 50, ?)').run(userId, 'Uploaded Study PDF to Lab');

    const createdDoc = db.prepare('SELECT * FROM pdf_documents WHERE id = ?').get(pdfId);

    res.status(201).json({
      message: 'PDF uploaded and analyzed successfully',
      document: createdDoc,
      analysis: {
        summary: studyPack.summary,
        detailed_notes: studyPack.detailed_notes,
        short_notes: studyPack.short_notes,
        key_concepts: studyPack.key_concepts,
        flashcards: studyPack.flashcards,
        mcqs: studyPack.mcqs,
        descriptive_questions: studyPack.descriptive_questions,
        question_paper: studyPack.question_paper,
        important_questions: studyPack.important_questions,
        test: studyPack.test
      }
    });
  } catch (err) {
    console.error('PDF Upload error:', err);
    res.status(500).json({ error: 'Failed to upload or analyze PDF: ' + err.message });
  }
});

// Ask question specifically about PDF
router.post('/:id/ask', optionalAuth, (req, res) => {
  const pdfId = req.params.id;
  const { question } = req.body;

  const doc = db.prepare('SELECT * FROM pdf_documents WHERE id = ?').get(pdfId);
  if (!doc) return res.status(404).json({ error: 'PDF not found' });

  const answer = `Based on **${doc.title}**:\n\n` + generateAcademicResponse(question, {
    subject: doc.title,
    contextSnippet: doc.extracted_text ? doc.extracted_text.slice(0, 1000) : ''
  });

  res.json({ question, answer, document_title: doc.title });
});

// Search inside PDF text
router.get('/:id/search', optionalAuth, (req, res) => {
  const pdfId = req.params.id;
  const { query } = req.query;

  if (!query) return res.json({ matches: [] });

  const doc = db.prepare('SELECT extracted_text, title FROM pdf_documents WHERE id = ?').get(pdfId);
  if (!doc || !doc.extracted_text) return res.json({ matches: [] });

  const text = doc.extracted_text;
  const regex = new RegExp(`([^.\\n]*?${query}[^.\\n]*)`, 'gi');
  const matches = [];
  let m;
  let count = 0;

  while ((m = regex.exec(text)) !== null && count < 10) {
    matches.push({
      snippet: m[0].trim(),
      index: m.index
    });
    count++;
  }

  res.json({ query, match_count: matches.length, matches });
});

module.exports = router;
