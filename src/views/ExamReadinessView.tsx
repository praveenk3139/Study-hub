import React, { useState, useEffect } from 'react';
import {
  Target,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ProgressBar } from '../components/common/ProgressBar';

interface ExamReadinessViewProps {
  onStartRevision: (topicName: string, subjectName: string, unitTitle: string, currentAccuracy: number) => void;
  onNavigate: (tabId: string) => void;
}

export const ExamReadinessView: React.FC<ExamReadinessViewProps> = ({ onStartRevision, onNavigate }) => {
  const { exams, profile, subjects, weakTopicsList, addExam, deleteExam } = useStudy();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState('DBMS');
  const [newCode, setNewCode] = useState('CS304');
  const [newDays, setNewDays] = useState(12);
  const [newLocation, setNewLocation] = useState('Main Exam Center');

  // Compute countdown ticker
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const diff = target - now;
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, isPast: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, mins, secs, isPast: false };
  };

  const primaryExam = exams[0];
  const primaryCountdown = primaryExam ? calculateCountdown(primaryExam.date) : null;

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDate = new Date(Date.now() + newDays * 86400000).toISOString();
    addExam({
      subject: newSubject,
      code: newCode,
      date: targetDate,
      location: newLocation
    });
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Exam Readiness Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time countdowns, syllabus preparedness tracking, and high-impact revision paths.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam Date</span>
        </button>
      </div>

      {/* Primary Exam Live Countdown Banner */}
      {primaryExam && primaryCountdown && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white uppercase tracking-wider">
                Upcoming Final Examination
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                {primaryExam.subject}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                {primaryExam.code} • {primaryExam.location}
              </p>
            </div>

            {/* Countdown Flip Units */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl text-center min-w-[64px] border border-white/20">
                <span className="text-2xl font-black">{primaryCountdown.days}</span>
                <span className="block text-[10px] uppercase font-bold text-blue-200">Days</span>
              </div>
              <span className="text-2xl font-bold text-white/60">:</span>
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl text-center min-w-[64px] border border-white/20">
                <span className="text-2xl font-black">{primaryCountdown.hours}</span>
                <span className="block text-[10px] uppercase font-bold text-blue-200">Hours</span>
              </div>
              <span className="text-2xl font-bold text-white/60">:</span>
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl text-center min-w-[64px] border border-white/20">
                <span className="text-2xl font-black">{primaryCountdown.mins}</span>
                <span className="block text-[10px] uppercase font-bold text-blue-200">Mins</span>
              </div>
              <span className="text-2xl font-bold text-white/60">:</span>
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl text-center min-w-[64px] border border-white/20">
                <span className="text-2xl font-black font-mono">{primaryCountdown.secs < 10 ? `0${primaryCountdown.secs}` : primaryCountdown.secs}</span>
                <span className="block text-[10px] uppercase font-bold text-blue-200">Secs</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80 space-y-1">
              <div className="flex justify-between text-xs text-blue-100 font-semibold">
                <span>Subject Preparedness</span>
                <span>{profile.examReadinessScore}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${profile.examReadinessScore}%` }} />
              </div>
            </div>

            <button
              onClick={() => onNavigate('tests')}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 shadow-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>Take Full Mock Exam</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* High-Yield Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High impact recommendations */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              AI High-Yield Readiness Blueprint
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Our diagnostic system calculated that addressing these 3 specific topics will elevate your overall exam readiness from <strong>78% to 92%</strong>:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Data Structures: Trees (Binary Search Trees & AVL)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Current Accuracy: 45% • Projected score impact: +6%
                </p>
              </div>
              <button
                onClick={() => onStartRevision("Trees", "Data Structures", "Unit 2: Trees & Hierarchical Structures", 45)}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
              >
                Revise Now
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Data Structures: Graphs (Dijkstra's Algorithm)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Current Accuracy: 62% • Projected score impact: +4%
                </p>
              </div>
              <button
                onClick={() => onStartRevision("Graphs", "Data Structures", "Unit 2: Trees & Hierarchical Structures", 62)}
                className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              >
                Revise Now
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Machine Learning: Naive Bayes Classifiers
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Current Accuracy: 68% • Projected score impact: +4%
                </p>
              </div>
              <button
                onClick={() => onStartRevision("Naive Bayes", "Machine Learning", "Unit 3: Probabilistic Models", 68)}
                className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              >
                Revise Now
              </button>
            </div>
          </div>
        </div>

        {/* All Scheduled Exams list */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Scheduled Exams</h3>
          </div>

          <div className="space-y-3">
            {exams.map(ex => {
              const cd = calculateCountdown(ex.date);
              return (
                <div key={ex.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{ex.subject}</p>
                      <p className="text-[11px] text-slate-400">{ex.code} • {ex.location}</p>
                    </div>
                    <button
                      onClick={() => deleteExam(ex.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1">
                    <span>{cd.days} days, {cd.hours}h remaining</span>
                    <span className="text-[10px] text-slate-400">{new Date(ex.date).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Exam Schedule</h3>
            <form onSubmit={handleAddExam} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Days Until Exam</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={newDays}
                  onChange={(e) => setNewDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Hall / Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
