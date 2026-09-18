const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sampleExcelPath = path.join(dataDir, 'sample_study_plan.xlsx');

// Create a professional sample Excel Study Plan sheet
function createSampleExcelFile() {
  const sampleData = [
    {
      'Subject': 'Data Structures',
      'Topic': 'Trees & Height Balance Invariants',
      'Start Time': '2026-09-18 09:00',
      'Duration (Mins)': 30,
      'Priority': 'High',
      'Goal': 'Revise AVL rotation invariants and balance factor calculation.'
    },
    {
      'Subject': 'Data Structures',
      'Topic': 'Graphs & BFS/DFS Traversal',
      'Start Time': '2026-09-18 10:00',
      'Duration (Mins)': 20,
      'Priority': 'High',
      'Goal': 'Practice topological sorting and cycle detection algorithms.'
    },
    {
      'Subject': 'Machine Learning',
      'Topic': 'Naive Bayes Classifier',
      'Start Time': '2026-09-18 11:30',
      'Duration (Mins)': 25,
      'Priority': 'Medium',
      'Goal': 'Calculate posterior probability and Laplace smoothing.'
    },
    {
      'Subject': 'DBMS',
      'Topic': 'Normalization 3NF & BCNF',
      'Start Time': '2026-09-18 14:00',
      'Duration (Mins)': 45,
      'Priority': 'High',
      'Goal': 'Decompose tables into BCNF while preserving functional dependencies.'
    },
    {
      'Subject': 'Operating Systems',
      'Topic': 'Memory Management & Page Replacement',
      'Start Time': '2026-09-18 16:00',
      'Duration (Mins)': 30,
      'Priority': 'Medium',
      'Goal': 'Solve LRU, FIFO, and Optimal page fault numerical problems.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Study Schedule');

  XLSX.writeFile(workbook, sampleExcelPath);
  return sampleExcelPath;
}

// Generate Excel Buffer from database tasks array
function generateExcelBufferFromTasks(tasks) {
  const rows = tasks.map(t => ({
    'Subject': t.subject_name || 'General',
    'Topic': t.topic,
    'Start Time': t.start_time ? new Date(t.start_time).toLocaleString() : '',
    'Duration (Mins)': t.duration_mins || 45,
    'Priority': (t.priority || 'high').toUpperCase(),
    'Status': (t.status || 'pending').toUpperCase(),
    'Goal': t.goal || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'My Study Plan');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// Parse uploaded Excel buffer into study task objects
function parseExcelToTasks(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  return rows.map((r, idx) => {
    const topic = r['Topic'] || r['topic'] || r['Task'] || `Excel Task ${idx + 1}`;
    const subject = r['Subject'] || r['subject'] || 'General';
    const duration = parseInt(r['Duration (Mins)'] || r['duration'] || r['Duration']) || 30;
    const priority = String(r['Priority'] || r['priority'] || 'high').toLowerCase();
    const goal = r['Goal'] || r['goal'] || 'Imported from Excel schedule';
    const startTimeStr = r['Start Time'] || r['start_time'] || new Date(Date.now() + idx * 3600000).toISOString();

    return {
      topic,
      subject,
      duration_mins: duration,
      priority,
      goal,
      start_time: startTimeStr
    };
  });
}

// Ensure sample Excel file is created on module load
try {
  createSampleExcelFile();
} catch (e) {
  console.warn('Failed to generate initial sample Excel file:', e.message);
}

module.exports = {
  createSampleExcelFile,
  generateExcelBufferFromTasks,
  parseExcelToTasks,
  sampleExcelPath
};
