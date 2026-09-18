import React from 'react';
import {
  Brain,
  Target,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  FileText,
  FileCheck2,
  Bot,
  ChevronRight,
  CheckCircle2,
  Circle,
  Trophy,
  Upload,
  History,
  MessageSquare,
  Users,
  Flame,
  Clock
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ProgressBar } from '../components/common/ProgressBar';

interface DashboardViewProps {
  onNavigate: (tabId: string) => void;
  onStartRevision: (topicName: string, subjectName: string, unitTitle: string, currentAccuracy: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onStartRevision }) => {
  const {
    profile,
    studyTasks,
    toggleTask,
    weakTopicsList,
    needsPracticeList,
    recentActivities,
    totalFocusMinutes
  } = useStudy();

  const completedTasksCount = studyTasks.filter(t => t.completed).length;
  const taskProgress = studyTasks.length > 0 ? Math.round((completedTasksCount / studyTasks.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Banner + Stats + Quick Access */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800 p-6 sm:p-8 border border-blue-100 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between relative z-10">
              <div className="max-w-md space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Hello, {profile.name}! 👋
                  </h1>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Keep going! Your goals are closer than you think.
                </p>
                <div className="pt-3 flex flex-wrap gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {profile.streakDays} Day Study Streak
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    {Math.round(totalFocusMinutes / 60)}h Total Focus Logged
                  </span>
                </div>
              </div>

              {/* Study mascot badge */}
              <div className="hidden sm:flex flex-col items-center justify-center p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs border border-white/60 dark:border-slate-700 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center text-2xl">
                  📚
                </div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 mt-1 uppercase tracking-wider">
                  Study Today
                </span>
                <span className="text-[9px] text-slate-400">For a Better Tomorrow</span>
              </div>
            </div>
          </div>

          {/* 4 Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* AI Performance */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5">
                  <Brain className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Performance</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{profile.aiPerformanceScore}%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Preparation</p>
                <div className="mt-2.5">
                  <ProgressBar progress={profile.aiPerformanceScore} colorClass="bg-purple-600" heightClass="h-1.5" />
                </div>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="mt-3 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline self-start"
              >
                <span>View Details</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Exam Readiness */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5">
                  <Target className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Exam Readiness</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{profile.examReadinessScore}%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Prepared</p>
                <div className="mt-2.5">
                  <ProgressBar progress={profile.examReadinessScore} colorClass="bg-blue-600" heightClass="h-1.5" />
                </div>
              </div>
              <button
                onClick={() => onNavigate('readiness')}
                className="mt-3 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline self-start"
              >
                <span>View Details</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Weak Topics */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Weak Topics</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{weakTopicsList.length}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Topics</p>
                <div className="mt-2.5">
                  <ProgressBar progress={Math.min(100, weakTopicsList.length * 25)} colorClass="bg-rose-500" heightClass="h-1.5" />
                </div>
              </div>
              <button
                onClick={() => onNavigate('weak')}
                className="mt-3 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline self-start"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Recommended Revision */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recommended Revision</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{needsPracticeList.length}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Tasks</p>
                <div className="mt-2.5">
                  <ProgressBar progress={Math.min(100, needsPracticeList.length * 33)} colorClass="bg-emerald-500" heightClass="h-1.5" />
                </div>
              </div>
              <button
                onClick={() => onNavigate('plan')}
                className="mt-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline self-start"
              >
                <span>View Plan</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* My Study */}
              <div
                onClick={() => onNavigate('study')}
                className="bg-white dark:bg-slate-800/90 hover:border-purple-300 dark:hover:border-purple-600 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer group transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">My Study</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Access your subjects and study materials
                </p>
                <div className="mt-3 text-purple-600 dark:text-purple-400 font-semibold text-xs flex items-center gap-1">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* PDF Analysis */}
              <div
                onClick={() => onNavigate('pdf')}
                className="bg-white dark:bg-slate-800/90 hover:border-rose-300 dark:hover:border-rose-600 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer group transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">PDF Analysis</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Get summary, important questions & more
                </p>
                <div className="mt-3 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1">
                  <span>Analyze</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Tests & Quizzes */}
              <div
                onClick={() => onNavigate('tests')}
                className="bg-white dark:bg-slate-800/90 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer group transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Tests & Quizzes</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Practice and improve your unit test scores
                </p>
                <div className="mt-3 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1">
                  <span>Start Test</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* AI Assistant */}
              <div
                onClick={() => onNavigate('ai')}
                className="bg-white dark:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-600 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer group transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">AI Assistant</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Ask doubts and get instant structured answers
                </p>
                <div className="mt-3 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center gap-1">
                  <span>Ask AI</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Study Plan + Quick Links + Motivation */}
        <div className="space-y-6">
          {/* Today's Study Plan */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today's Study Plan</h2>
              </div>
              <button
                onClick={() => onNavigate('plan')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </button>
            </div>

            {/* Checklist tasks */}
            <div className="space-y-2.5">
              {studyTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 text-slate-800 dark:text-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                  </div>

                  {/* If task is Trees revision and not completed, add quick revision shortcut */}
                  {!task.completed && task.title.toLowerCase().includes('trees') ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartRevision("Trees", "Data Structures", "Unit 2: Trees & Hierarchical Structures", 45);
                      }}
                      className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Revise
                    </button>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span>Overall Progress</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{taskProgress}%</span>
              </div>
              <ProgressBar progress={taskProgress} colorClass="bg-emerald-500" heightClass="h-2" />
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quick Links</h2>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onNavigate('pdf')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Upload PDF</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('tests')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-purple-500" />
                  <span>View Previous Tests</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('ai')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>Ask AI Doubt</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('friends')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>My Friends & Rooms</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Motivation card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-purple-900 dark:text-purple-200">
                You are doing great!
              </p>
              <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">
                Keep going, champion!
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-lg shadow-xs">
              🏆
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">{activity.text}</p>
                    <span className="text-[10px] text-slate-400">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
