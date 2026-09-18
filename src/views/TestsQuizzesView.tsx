import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Award,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Filter,
  History
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ProgressBar } from '../components/common/ProgressBar';

interface TestsQuizzesViewProps {
  onStartRevision: (topicName: string, subjectName: string, unitTitle: string, currentAccuracy: number) => void;
}

export const TestsQuizzesView: React.FC<TestsQuizzesViewProps> = ({ onStartRevision }) => {
  const { subjects, recordTestAttempt, testAttempts } = useStudy();

  const [mode, setMode] = useState<'hub' | 'testing' | 'results'>('hub');

  // Configuration state
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || "Data Structures");
  const [selectedUnit, setSelectedUnit] = useState("Unit 2: Trees & Hierarchical Structures");
  const [selectedTopic, setSelectedTopic] = useState("Trees");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Active testing state
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [generating, setGenerating] = useState(false);

  // Result state
  const [lastAttempt, setLastAttempt] = useState<any>(null);

  // Default pre-packaged high-quality questions
  const defaultQuestionsPool = [
    {
      id: 1,
      question: "Which tree traversal strategy visits the Left subtree, then Root, then Right subtree?",
      options: ["Pre-Order Traversal", "In-Order Traversal", "Post-Order Traversal", "Level-Order Traversal"],
      correctIndex: 1,
      explanation: "In-Order traversal follows the Left-Root-Right sequence. For a Binary Search Tree, it outputs nodes in ascending sorted order."
    },
    {
      id: 2,
      question: "In an AVL tree, what is the maximum permissible absolute value for the balance factor of any node?",
      options: ["0", "1", "2", "Unlimited"],
      correctIndex: 1,
      explanation: "By definition, an AVL tree is self-balancing such that for every node, |Height(Left) - Height(Right)| <= 1 (i.e. -1, 0, or +1)."
    },
    {
      id: 3,
      question: "What is the worst-case time complexity of searching a key in an unbalanced (skewed) Binary Search Tree?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctIndex: 2,
      explanation: "In a degenerate or skewed tree (where each node has only one child), the tree degrades into a linked list, requiring O(n) search time."
    },
    {
      id: 4,
      question: "Which rotation is required to rebalance an AVL tree after inserting into the Right subtree of a Right child?",
      options: ["Right Rotation (RR)", "Left Rotation (LL)", "Right-Left (RL)", "Left-Right (LR)"],
      correctIndex: 1,
      explanation: "A Single Left (LL) rotation restores balance when a node becomes right-heavy due to an insertion in the right subtree of its right child."
    },
    {
      id: 5,
      question: "How many total nodes are in a complete binary tree of height 2 (root is height 0)?",
      options: ["3", "7", "8", "15"],
      correctIndex: 1,
      explanation: "Total nodes = 2^(h+1) - 1 = 2^(3) - 1 = 8 - 1 = 7 nodes."
    }
  ];

  // Timer countdown
  useEffect(() => {
    let timer: any;
    if (mode === 'testing' && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, secondsRemaining]);

  const handleStartTest = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/test-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          unit: selectedUnit,
          topic: selectedTopic,
          difficulty,
          count: questionCount
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setQuestions(defaultQuestionsPool.slice(0, questionCount));
        }
      } else {
        setQuestions(defaultQuestionsPool.slice(0, questionCount));
      }
    } catch (e) {
      setQuestions(defaultQuestionsPool.slice(0, questionCount));
    } finally {
      setGenerating(false);
      setUserAnswers({});
      setFlaggedQuestions({});
      setCurrentQIndex(0);
      setSecondsRemaining(questionCount * 120); // 2 minutes per question
      setMode('testing');
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQIndex]: optionIndex
    }));
  };

  const toggleFlagCurrent = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQIndex]: !prev[currentQIndex]
    }));
  };

  const handleSubmitTest = () => {
    let correctCount = 0;
    const results = questions.map((q, idx) => {
      const userSelected = userAnswers[idx];
      const isCorrect = userSelected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id || idx,
        questionText: q.question,
        options: q.options,
        userAnswerIndex: userSelected !== undefined ? userSelected : -1,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    const totalTimeSpent = questionCount * 120 - secondsRemaining;

    const attempt = recordTestAttempt({
      testTitle: `${selectedSubject} - ${selectedTopic || selectedUnit} Quiz`,
      subject: selectedSubject,
      unit: selectedUnit,
      topic: selectedTopic,
      date: new Date().toLocaleString(),
      score: correctCount * 4,
      totalMarks: questions.length * 4,
      percentage: scorePct,
      timeSpentSeconds: totalTimeSpent,
      questionsCount: questions.length,
      correctAnswersCount: correctCount,
      questionResults: results
    });

    setLastAttempt(attempt);
    setMode('results');
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. TEST HUB VIEW */}
      {mode === 'hub' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  NEW
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Tests & Quizzes
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Practice, test your understanding, and automatically diagnose topic gaps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {testAttempts.length} Tests Completed
              </span>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Custom Test Generator */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Configure Your Assessment Test
                </h2>
              </div>

              {/* Subject selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {subjects.map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubject(sub.name)}
                      className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                        selectedSubject === sub.name
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <p className="truncate">{sub.name}</p>
                      <span className="text-[10px] text-slate-400 font-normal">{sub.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit & Topic selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Unit / Module
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Unit 2: Trees & Hierarchical Structures">Unit 2: Trees & Hierarchical Structures</option>
                    <option value="Unit 1: Linear Structures & Stacks">Unit 1: Linear Structures & Stacks</option>
                    <option value="Unit 3: Searching & Sorting Algorithms">Unit 3: Searching & Sorting Algorithms</option>
                    <option value="Unit 4: Hashing & Symbol Tables">Unit 4: Hashing & Symbol Tables</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Topic (Optional)
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Trees">Trees (Binary, BST, AVL) 🔴 Weak</option>
                    <option value="Graphs">Graphs (Dijkstra, Traversals) 🟡 Needs Practice</option>
                    <option value="Searching">Searching (Binary Search) 🟢 Strong</option>
                    <option value="Full Unit Comprehensive">Full Unit Comprehensive Test</option>
                  </select>
                </div>
              </div>

              {/* Questions count & difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Number of Questions: <strong className="text-blue-600">{questionCount} Qs</strong>
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 15].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setQuestionCount(cnt)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          questionCount === cnt
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cnt} Questions
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Difficulty Level
                  </label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border transition-colors ${
                          difficulty === lvl
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartTest}
                disabled={generating}
                className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Generating Tailored AI Test...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Assessment Test ({questionCount * 2} mins)</span>
                  </>
                )}
              </button>
            </div>

            {/* Test History Card */}
            <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Test History</h3>
              </div>

              <div className="space-y-3">
                {testAttempts.map(att => (
                  <div key={att.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {att.testTitle}
                      </p>
                      <span className={`text-xs font-black shrink-0 ${
                        att.percentage >= 75 ? 'text-emerald-600' : att.percentage >= 60 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {att.percentage}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{att.correctAnswersCount}/{att.questionsCount} Correct</span>
                      <span>{att.date.split(' ')[0]}</span>
                    </div>

                    {att.percentage < 60 && att.topic && (
                      <button
                        onClick={() => onStartRevision(att.topic!, att.subject, att.unit || "Unit 2", att.percentage)}
                        className="w-full py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
                      >
                        Start Targeted Revision &rarr;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE TEST INTERACTION VIEW */}
      {mode === 'testing' && questions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-200">
          {/* Top Bar: Progress + Timer */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Question {currentQIndex + 1} of {questions.length}</span>
            </div>

            {/* Timer countdown */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              secondsRemaining < 120 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={handleSubmitTest}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Finish & Submit
            </button>
          </div>

          {/* Question Box */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                {questions[currentQIndex]?.question}
              </h3>
              <button
                onClick={toggleFlagCurrent}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 ${
                  flaggedQuestions[currentQIndex]
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🚩 {flaggedQuestions[currentQIndex] ? 'Flagged' : 'Flag'}
              </button>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentQIndex]?.options?.map((optionText: string, oIdx: number) => {
                const isSelected = userAnswers[currentQIndex] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-800 dark:text-blue-200 font-bold ring-2 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="inline-block w-6 text-slate-400 font-mono">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    {optionText}
                  </button>
                );
              })}
            </div>

            {/* Question Quick Jump Ribbon */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <button
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 disabled:opacity-30 rounded-xl"
              >
                Previous
              </button>

              <div className="flex gap-1.5 overflow-x-auto px-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                      idx === currentQIndex
                        ? 'bg-blue-600 text-white'
                        : userAnswers[idx] !== undefined
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : flaggedQuestions[idx]
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (currentQIndex === questions.length - 1) {
                    handleSubmitTest();
                  } else {
                    setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1));
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                {currentQIndex === questions.length - 1 ? "Submit Test" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEST RESULTS BREAKDOWN VIEW */}
      {mode === 'results' && lastAttempt && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-xs text-center space-y-4">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl shadow-md ${
              lastAttempt.percentage >= 75 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {lastAttempt.percentage >= 75 ? '🎉' : '💡'}
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {lastAttempt.percentage >= 75 ? 'Outstanding Performance!' : 'Test Completed — Diagnostic Ready'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lastAttempt.testTitle}
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400">Score</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{lastAttempt.percentage}%</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400">Accuracy</span>
                <p className="text-2xl font-black text-emerald-600">{lastAttempt.correctAnswersCount}/{lastAttempt.questionsCount}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400">Time Spent</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{Math.round(lastAttempt.timeSpentSeconds / 60)}m</p>
              </div>
            </div>

            {lastAttempt.percentage < 60 && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div>
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Topic Gap Detected: {selectedTopic}
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400">
                    Accuracy dropped below 60%. A 30-min targeted revision session is recommended.
                  </p>
                </div>
                <button
                  onClick={() => onStartRevision(selectedTopic, selectedSubject, selectedUnit, lastAttempt.percentage)}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shrink-0"
                >
                  Start Revision Now
                </button>
              </div>
            )}
          </div>

          {/* Detailed Question Review with AI explanations */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Detailed Question Breakdown</h3>

            <div className="space-y-4">
              {lastAttempt.questionResults?.map((res: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Q{idx + 1}: {res.questionText}
                    </p>
                    {res.isCorrect ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md shrink-0">
                        <XCircle className="w-3 h-3" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    {res.options?.map((opt: string, optI: number) => {
                      const wasSelected = res.userAnswerIndex === optI;
                      const isTargetCorrect = res.correctIndex === optI;
                      return (
                        <div
                          key={optI}
                          className={`p-2 rounded-lg text-xs font-medium ${
                            isTargetCorrect
                              ? 'bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold'
                              : wasSelected
                              ? 'bg-rose-100/60 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="font-mono mr-2">{String.fromCharCode(65 + optI)}.</span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl text-[11px] text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                    <strong>Explanation:</strong> {res.explanation}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => setMode('hub')}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              >
                Back to Tests Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
