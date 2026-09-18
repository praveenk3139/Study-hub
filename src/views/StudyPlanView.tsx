import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ProgressBar } from '../components/common/ProgressBar';

interface StudyPlanViewProps {
  onStartRevision: (topicName: string, subjectName: string, unitTitle: string, currentAccuracy: number) => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({ onStartRevision }) => {
  const { studyTasks, toggleTask, addTask, deleteTask, applyNewStudyPlan, weakTopicsList, profile } = useStudy();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(25);
  const [newTaskSubject, setNewTaskSubject] = useState('Data Structures');
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const completedCount = studyTasks.filter(t => t.completed).length;
  const progressPct = studyTasks.length > 0 ? Math.round((completedCount / studyTasks.length) * 100) : 0;
  const totalMinutes = studyTasks.reduce((acc, t) => acc + t.duration, 0);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: `${newTaskTitle} — ${newTaskDuration} min`,
      duration: newTaskDuration,
      subject: newTaskSubject,
      type: "practice",
      completed: false,
      priority: "medium",
      timeSlot: "Afternoon"
    });
    setNewTaskTitle('');
  };

  const handleGenerateAIPlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weakTopics: weakTopicsList.map(w => w.topic.name),
          subjects: ["Data Structures", "DBMS", "Machine Learning"],
          dailyMinutes: profile.dailyTargetMinutes
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tasks && data.tasks.length > 0) {
          applyNewStudyPlan(data.tasks);
        }
      }
    } catch (e) {
      console.warn("Using smart algorithmic schedule");
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Daily Study Timetable & Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Balanced schedule prioritized according to your weakest topics and upcoming exams.
          </p>
        </div>

        <button
          onClick={handleGenerateAIPlan}
          disabled={generatingPlan}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{generatingPlan ? 'Generating AI Schedule...' : 'Regenerate Plan with AI'}</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Total Planned Time</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalMinutes} mins</p>
          <span className="text-[11px] text-slate-400">Daily Target: {profile.dailyTargetMinutes} mins</span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Tasks Completed</span>
          <p className="text-2xl font-black text-emerald-600">{completedCount} / {studyTasks.length}</p>
          <div className="mt-2">
            <ProgressBar progress={progressPct} colorClass="bg-emerald-500" heightClass="h-1.5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Top Priority Focus</span>
            <p className="text-base font-bold text-rose-600 mt-1">Trees Revision (45% Acc)</p>
          </div>
          <span className="text-[11px] text-slate-400">30 min allocation scheduled</span>
        </div>
      </div>

      {/* Main Content: Tasks List + Add Task Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Checklist */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Scheduled Tasks</h2>
            <span className="text-xs text-slate-400">{progressPct}% Finished</span>
          </div>

          <div className="space-y-3">
            {studyTasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  task.completed
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                  <div>
                    <p className={`text-xs sm:text-sm font-bold ${task.completed ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{task.subject}</span>
                      <span>•</span>
                      <span>{task.duration} mins</span>
                      {task.timeSlot && <span>• {task.timeSlot}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!task.completed && task.title.toLowerCase().includes('trees') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartRevision("Trees", "Data Structures", "Unit 2: Trees & Hierarchical Structures", 45);
                      }}
                      className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Revise
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Task Form */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Add Custom Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Read DBMS Transactions Chapter"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Subject</label>
              <select
                value={newTaskSubject}
                onChange={(e) => setNewTaskSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Data Structures">Data Structures</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="DBMS">DBMS</option>
                <option value="Operating Systems">Operating Systems</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Duration (Minutes)</label>
              <div className="flex gap-2">
                {[15, 25, 45, 60].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setNewTaskDuration(m)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border ${
                      newTaskDuration === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Today's Plan</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
