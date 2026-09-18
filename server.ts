import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy GoogleGenAI initialization
let genAIInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIInstance;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    model: "gemini-3.8-flash",
  });
});

// Helper for calling Gemini with fallback
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getGenAI();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: systemInstruction ? { systemInstruction } : undefined,
  });
  return response.text || "";
}

// 1. AI Study Assistant Chat
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history = [], format = "standard", topicContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const formatPrompt = {
      "2-mark": "Provide a concise, high-scoring 2-mark university exam answer with bullet points or direct definition (40-60 words).",
      "5-mark": "Provide a structured 5-mark university exam answer with definition, key characteristics, diagram description, and 1 short example (120-180 words).",
      "10-mark": "Provide a comprehensive 10-mark university exam answer with introduction, architectural/conceptual explanation, detailed headings, code/pseudocode or diagram outline, advantages/disadvantages, and conclusion (300-450 words).",
      "16-mark": "Provide an in-depth 16-mark essay-style university exam answer with comprehensive breakdown, theoretical principles, step-by-step working, practical case study/example, comparison, and summary.",
      "step-by-step": "Explain this step-by-step clearly as an experienced, encouraging college tutor.",
      "standard": "Explain clearly, simply, and engagingly with key takeaways and practical examples.",
    }[format as string] || "Explain clearly and helpfully.";

    const systemInstruction = `You are the AI Study Assistant inside "Study Hub", an intelligent study companion for college students.
Your goal is to guide students to understand concepts deeply, solve doubts, and excel in exams.
Current Topic Context: ${topicContext || "General Computer Science & College Academics"}.
Target Response Format: ${formatPrompt}
Be encouraging, precise, pedagogically sound, and use clean markdown formatting with bolding and bullet points.`;

    const fullPrompt = `${history.map((h: any) => `${h.role === 'user' ? 'Student' : 'AI'}: ${h.text}`).join('\n')}\nStudent: ${message}\nAI:`;

    const reply = await callGemini(fullPrompt, systemInstruction);
    return res.json({ reply });
  } catch (error: any) {
    console.error("Error in /api/ai/chat:", error);
    // Fallback response so user experience is never dead
    return res.status(500).json({
      error: error.message || "Failed to generate AI response",
      fallback: "I encountered an issue connecting to the AI model. Please verify your GEMINI_API_KEY or try asking your doubt again.",
    });
  }
});

// 2. PDF Analysis Endpoint
app.post("/api/ai/analyze-pdf", async (req, res) => {
  try {
    const { fileName, textContent, subject = "General Study Material" } = req.body;
    const prompt = `Analyze this student study material for the subject "${subject}" (File: "${fileName}").
Document Content preview:
${textContent.slice(0, 15000)}

Please return a valid JSON object strictly matching this schema:
{
  "completeSummary": "High-level summary of the entire document (3-4 paragraphs)",
  "unitSummaries": [
    { "unitTitle": "Unit 1: Title", "summary": "Detailed summary" }
  ],
  "topicSummaries": [
    { "topicTitle": "Topic name", "summary": "Core breakdown" }
  ],
  "keyConcepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5"],
  "definitions": [
    { "term": "Term 1", "definition": "Clear concise definition" },
    { "term": "Term 2", "definition": "Clear concise definition" }
  ],
  "formulasAndRules": ["Formula/Rule 1", "Formula/Rule 2"],
  "examples": [
    { "title": "Example Title", "description": "Walkthrough explanation" }
  ],
  "importantPoints": ["Key takeaway point 1", "Key takeaway point 2", "Key takeaway point 3"],
  "examQuestions": {
    "twoMarks": ["What is ...?", "Define ...?", "State 2 differences between ...?"],
    "fiveMarks": ["Explain the architecture of ...", "Compare and contrast ... with ..."],
    "tenMarks": ["Discuss in detail the working principle of ... with an example."],
    "sixteenMarks": ["Critically evaluate ... providing implementation details and analysis."],
    "mcqs": [
      {
        "question": "Sample multiple choice question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Why option A is correct"
      }
    ],
    "trueFalse": [
      { "statement": "Statement about the topic", "isTrue": true, "explanation": "Explanation" }
    ]
  },
  "quickRevisionNotes": ["Quick bullet 1", "Quick bullet 2", "Quick bullet 3"],
  "commonMistakes": ["Mistake 1 and how to avoid it", "Mistake 2 and how to avoid it"]
}`;

    const ai = getGenAI();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/analyze-pdf:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze document" });
  }
});

// 3. Question Paper Analysis Endpoint
app.post("/api/ai/analyze-paper", async (req, res) => {
  try {
    const { paperTitle, textContent, subject = "Subject" } = req.body;
    const prompt = `Analyze this previous university examination question paper for "${subject}" (${paperTitle}).
Content:
${textContent.slice(0, 15000)}

Return a valid JSON object strictly matching this schema:
{
  "subject": "${subject}",
  "paperTitle": "${paperTitle}",
  "totalMarksAnalyzed": 100,
  "disclaimer": "Historical question frequency indicates past trends and does not guarantee future appearances.",
  "repeatedQuestions": [
    { "question": "Question text", "frequency": "Appeared in 3 recent semesters", "marks": 10, "importance": "High" }
  ],
  "frequentlyTestedTopics": [
    { "topic": "Topic Name", "occurrencePercentage": 85, "avgMarks": 18, "unit": "Unit 2" }
  ],
  "unitWisePattern": [
    { "unit": "Unit 1", "weightagePercentage": 22, "focusAreas": "Definitions & Basic Operations" },
    { "unit": "Unit 2", "weightagePercentage": 28, "focusAreas": "Algorithms and Complex Proofs" }
  ],
  "markDistribution": [
    { "category": "2-Mark Questions", "totalMarks": 20, "percentage": 20 },
    { "category": "10-Mark Questions", "totalMarks": 40, "percentage": 40 },
    { "category": "16-Mark Questions", "totalMarks": 40, "percentage": 40 }
  ],
  "recommendedStrategy": [
    "Prioritize high-yield units first",
    "Prepare derivations and standard diagrams",
    "Practice numerical problems from Unit 3"
  ]
}`;

    const ai = getGenAI();
    if (!ai) throw new Error("GEMINI_API_KEY is not configured.");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/analyze-paper:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze question paper" });
  }
});

// 4. Test Generator & 10-Question Unit Test
app.post("/api/ai/generate-test", async (req, res) => {
  try {
    const { subject, unit, topic, difficulty = "Medium", questionType = "MCQ", count = 10 } = req.body;
    const prompt = `Generate a university-standard ${count}-question ${difficulty} test for:
Subject: ${subject}
Unit: ${unit}
Topic: ${topic || "All Unit Topics"}
Question Format: ${questionType}

Return a valid JSON object matching:
{
  "testTitle": "${subject} - ${unit} Assessment",
  "subject": "${subject}",
  "unit": "${unit}",
  "topic": "${topic || 'Comprehensive'}",
  "difficulty": "${difficulty}",
  "timeLimitMinutes": ${Math.max(10, Math.round(count * 1.5))},
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "A. Option 1",
      "correctIndex": 0,
      "explanation": "Clear justification of why this answer is correct.",
      "topic": "${topic || 'Specific subtopic'}",
      "marks": 2
    }
  ]
}`;

    const ai = getGenAI();
    if (!ai) throw new Error("GEMINI_API_KEY is not configured.");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/generate-test:", error);
    return res.status(500).json({ error: error.message || "Failed to generate test questions" });
  }
});

// 5. Smart Revision Engine & Practice Generator
app.post("/api/ai/revision-content", async (req, res) => {
  try {
    const { topic, subject, unit, accuracy = 45 } = req.body;
    const prompt = `The student has been flagged with a weak topic: "${topic}" in "${subject}" (${unit}), current accuracy ${accuracy}%.
Create a dedicated 7-part pedagogical revision package designed to elevate their understanding from weak to mastery.

Return a valid JSON object strictly matching:
{
  "topic": "${topic}",
  "subject": "${subject}",
  "unit": "${unit}",
  "quickRevision": {
    "summary": "Clear, concise 2-3 paragraph breakdown explaining the topic from the ground up without intimidating jargon.",
    "keyPoints": [
      "Crucial point 1",
      "Crucial point 2",
      "Crucial point 3",
      "Crucial point 4"
    ],
    "diagramDescription": "Visual conceptual representation of how this works."
  },
  "keyConcepts": [
    { "title": "Concept 1", "description": "Explanation" },
    { "title": "Concept 2", "description": "Explanation" }
  ],
  "formulasAndDefinitions": [
    { "term": "Key Term/Formula", "details": "Exact definition or mathematical formula with explanation of terms." }
  ],
  "commonMistakes": [
    { "mistake": "Typical student mistake", "correction": "Why this happens and how to easily remember the correct way." }
  ],
  "examples": [
    { "title": "Practical Walkthrough", "problem": "Real problem statement", "solution": "Step-by-step resolution." }
  ],
  "practiceQuestions": [
    {
      "id": 1,
      "type": "MCQ",
      "question": "Targeted conceptual check question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Explanation"
    },
    {
      "id": 2,
      "type": "Conceptual",
      "question": "Short 2-mark question?",
      "sampleAnswer": "Ideal answer points."
    }
  ],
  "miniTest": [
    {
      "id": 101,
      "question": "Diagnostic Mini-Test Question 1?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Explanation"
    },
    {
      "id": 102,
      "question": "Diagnostic Mini-Test Question 2?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 2,
      "explanation": "Explanation"
    },
    {
      "id": 103,
      "question": "Diagnostic Mini-Test Question 3?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 1,
      "explanation": "Explanation"
    }
  ]
}`;

    const ai = getGenAI();
    if (!ai) throw new Error("GEMINI_API_KEY is not configured.");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/revision-content:", error);
    return res.status(500).json({ error: error.message || "Failed to generate revision content" });
  }
});

// 6. Image Question Solver Endpoint
app.post("/api/ai/solve-image", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", questionText = "" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }

    const ai = getGenAI();
    if (!ai) throw new Error("GEMINI_API_KEY is not configured.");

    // Strip data prefix if provided
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `You are an expert college tutor and exam evaluator in the Student Study Hub.
Solve the academic question presented in this image thoroughly.
Student's accompanying question/notes: "${questionText}".

Please provide:
1. Identified Question Text / Problem Statement
2. Subject & Topic Classification
3. Step-by-Step Solution / Derivation / Calculation
4. Final Verified Answer (highlighted)
5. Key Concepts Used & Tips to Avoid Mistakes in Exam
6. Related Follow-Up Practice Tip`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [imagePart, textPart] },
    });

    return res.json({ solution: response.text });
  } catch (error: any) {
    console.error("Error in /api/ai/solve-image:", error);
    return res.status(500).json({ error: error.message || "Failed to solve question image" });
  }
});

// 7. Flashcards Generator
app.post("/api/ai/generate-flashcards", async (req, res) => {
  try {
    const { topic, subject, count = 8 } = req.body;
    const prompt = `Generate ${count} high-impact active recall study flashcards for:
Topic: ${topic}
Subject: ${subject}

Return a valid JSON object matching:
{
  "deckTitle": "${topic} Flashcards",
  "cards": [
    {
      "id": 1,
      "front": "Clear question, prompt, or key term?",
      "back": "Concise, precise explanation, definition, or answer.",
      "category": "Key Concept"
    }
  ]
}`;

    const ai = getGenAI();
    if (!ai) throw new Error("GEMINI_API_KEY is not configured.");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/generate-flashcards:", error);
    return res.status(500).json({ error: error.message || "Failed to generate flashcards" });
  }
});

// 8. Fun Check-up AI Conversation
app.post("/api/ai/fun-chat", async (req, res) => {
  try {
    const { answers } = req.body;
    const prompt = `A college student just completed a lighthearted Fun Check-up survey with the following responses:
${JSON.stringify(answers, null, 2)}

Provide an energetic, cheerful, witty, and encouraging response (under 120 words) connecting their fun answers (e.g. food, hobbies, favorite film) into a motivating send-off for their study session today.
Keep it casual, polite, and friendly with 1-2 fun emojis! (Note: This is strictly for morale and not academic evaluation).`;

    const reply = await callGemini(prompt);
    return res.json({ reply });
  } catch (error: any) {
    console.error("Error in /api/ai/fun-chat:", error);
    return res.status(500).json({
      reply: "Looks like you have awesome taste! 🎉 Ready to conquer today's study goals and level up your skills?",
    });
  }
});

// 9. AI Study Plan Recommendation
app.post("/api/ai/recommend-study-plan", async (req, res) => {
  try {
    const { weakTopics = [], subjects = [], availableMinutes = 120, exams = [] } = req.body;
    const prompt = `Generate a customized, realistic daily study schedule for a college student based on:
Available Study Time: ${availableMinutes} minutes
Weak Topics Needing Immediate Attention: ${JSON.stringify(weakTopics)}
Subjects: ${JSON.stringify(subjects)}
Upcoming Exams: ${JSON.stringify(exams)}

Return a valid JSON object matching:
{
  "headline": "Personalized Target Plan",
  "rationale": "Brief 2-sentence rationale focusing on weakest areas first",
  "tasks": [
    {
      "id": "task-1",
      "title": "Revise Trees",
      "duration": 30,
      "subject": "Data Structures",
      "type": "revision",
      "priority": "high",
      "completed": false
    },
    {
      "id": "task-2",
      "title": "Practice Graphs",
      "duration": 20,
      "subject": "Data Structures",
      "type": "practice",
      "priority": "medium",
      "completed": false
    },
    {
      "id": "task-3",
      "title": "Unit 2 Test",
      "duration": 20,
      "subject": "Data Structures",
      "type": "test",
      "priority": "high",
      "completed": false
    }
  ]
}`;

    const ai = getGenAI();
    if (!ai) throw new Error("GEMINI_API_KEY is not configured.");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/recommend-study-plan:", error);
    return res.status(500).json({ error: error.message || "Failed to generate study plan" });
  }
});

// Production static or Vite dev middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
