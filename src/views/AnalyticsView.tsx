import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Brain,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const AnalyticsView: React.FC = () => {
  const { subjects, weakTopicsList, needsPracticeList, strongTopicsList, profile, testAttempts, totalFocusMinutes } = useStudy();

  const subjectData = subjects.map(s => ({
    name: s.code,
    fullName: s.name,
    progress: s.progress,
    fill: s.color
  }));

  const topicDistribution = [
    { name: 'Weak (<60%)', value: weakTopicsList.length, color: '#EF4444' },
    { name: 'Needs Practice (60-75%)', value: needsPracticeList.length, color: '#F59E0B' },
    { name: 'Strong (>=75%)', value: strongTopicsList.length, color: '#10B981' },
  ];

  const weeklyStudyHours = [
    { day: 'Mon', minutes: 85 },
    { day: 'Tue', minutes: 110 },
    { day: 'Wed', minutes: 95 },
    { day: 'Thu', minutes: 130 },
    { day: 'Fri', minutes: 100 },
    { day: 'Sat', minutes: 140 },
    { day: 'Sun (Today)', minutes: 60 },
  ];

  const trendData = [
    { attempt: 'Test 1', score: 55 },
    { attempt: 'Test 2', score: 62 },
    { attempt: 'Test 3', score: 68 },
    { attempt: 'Test 4', score: 72 },
    { attempt: 'Latest', score: profile.aiPerformanceScore },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Performance & Growth Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive visual breakdown of your accuracy, study cadence, and retention.
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">AI Performance</span>
          <p className="text-3xl font-black text-purple-600 mt-1">{profile.aiPerformanceScore}%</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +14% this month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Exam Readiness</span>
          <p className="text-3xl font-black text-blue-600 mt-1">{profile.examReadinessScore}%</p>
          <span className="text-[11px] text-slate-400 mt-0.5">Estimated grade: A-</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Study Streak</span>
          <p className="text-3xl font-black text-amber-500 mt-1">{profile.streakDays} Days</p>
          <span className="text-[11px] text-amber-600 font-bold mt-0.5">🔥 Personal best!</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Focus Hours</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{(totalFocusMinutes / 60).toFixed(1)}h</p>
          <span className="text-[11px] text-slate-400 mt-0.5">Across all subjects</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Mastery Bar Chart */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Subject Mastery Level (%)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="progress" radius={[8, 8, 0, 0]} fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Health Donut Chart */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Topic Health Distribution</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topicDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {topicDistribution.map((td, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: td.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{td.name}: <strong>{td.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Study Cadence Line Chart */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daily Study Cadence (Minutes)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStudyHours}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Improvement Trend */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Test Score Growth Trajectory</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="attempt" stroke="#94A3B8" fontSize={11} />
                <YAxis domain={[40, 100]} stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
