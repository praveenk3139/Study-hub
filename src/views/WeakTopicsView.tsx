import React, { useState } from 'react';
import {
  Brain,
  AlertTriangle,
  Flame,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';

interface WeakTopicsViewProps {
  onStartRevision: (topicName: string, subjectName: string, unitTitle: string, currentAccuracy: number) => void;
  onStartPractice?: (topicName: string, subjectName: string, unitTitle: string) => void;
}

export const WeakTopicsView: React.FC<WeakTopicsViewProps> = ({ onStartRevision, onStartPractice }) => {
  const {
    allTopicsWithPerformance,
    weakTopicsList,
    needsPracticeList,
    strongTopicsList
  } = useStudy();

  const [activeFilter, setActiveFilter] = useState<'all' | 'weak' | 'practice' | 'strong'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = allTopicsWithPerformance.filter(item => {
    const matchesSearch = item.topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.subject.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'weak') return item.topic.status === 'Weak';
    if (activeFilter === 'practice') return item.topic.status === 'Needs Practice';
    if (activeFilter === 'strong') return item.topic.status === 'Strong';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header banner */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Weak Topics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Focus on your weak areas and improve step by step.
            </p>
          </div>
        </div>

        {/* AI Insight Chip */}
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-xl text-xs text-blue-700 dark:text-blue-300">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Calculated using 3+ test attempts & recent accuracy</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Weak Topics</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{weakTopicsList.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Needs Practice</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{needsPracticeList.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Strong</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{strongTopicsList.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            All Topics ({allTopicsWithPerformance.length})
          </button>
          <button
            onClick={() => setActiveFilter('weak')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeFilter === 'weak'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            Weak Only ({weakTopicsList.length})
          </button>
          <button
            onClick={() => setActiveFilter('practice')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeFilter === 'practice'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            Needs Practice ({needsPracticeList.length})
          </button>
          <button
            onClick={() => setActiveFilter('strong')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activeFilter === 'strong'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            Strong ({strongTopicsList.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topic or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Topics Cards List */}
      <div className="space-y-3.5">
        {filteredTopics.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No topics match your filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing search or switching status tabs.</p>
          </div>
        ) : (
          filteredTopics.map(({ topic, subject, unitTitle }) => {
            const isWeak = topic.status === 'Weak';
            const isPractice = topic.status === 'Needs Practice';
            const barColor = isWeak ? 'bg-rose-500' : isPractice ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <div
                key={topic.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Topic Info */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base">
                      {subject.name.toLowerCase().includes('data') ? '🌲' :
                       subject.name.toLowerCase().includes('machine') ? '⚙️' :
                       subject.name.toLowerCase().includes('dbms') ? '🗄️' : '💻'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {topic.name}
                    </h3>
                    <StatusBadge status={topic.status} />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {subject.name} • {unitTitle}
                  </p>

                  {/* Accuracy Bar */}
                  <div className="w-full sm:w-72 space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Accuracy: <strong className="text-slate-800 dark:text-slate-200">{topic.accuracy}%</strong></span>
                      <span>Tested {topic.attempts} times ({topic.improvement})</span>
                    </div>
                    <ProgressBar progress={topic.accuracy} colorClass={barColor} heightClass="h-2" />
                  </div>
                </div>

                {/* Buttons matching image.png */}
                <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
                  <button
                    onClick={() => onStartRevision(topic.name, subject.name, unitTitle, topic.accuracy)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Revise Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onStartPractice ? onStartPractice(topic.name, subject.name, unitTitle) : onStartRevision(topic.name, subject.name, unitTitle, topic.accuracy)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Practice
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
