import React from 'react';
import {
  Award,
  CheckCircle2,
  Lock,
  Zap,
  Flame,
  BookOpen,
  Target
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const AchievementsView: React.FC = () => {
  const { achievements, profile } = useStudy();

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Academic Milestones & Badges
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Recognizing your consistent study efforts, topic mastery, and test improvements.
            </p>
          </div>
        </div>

        <div className="text-right self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-400">Unlocked</span>
          <p className="text-xl font-black text-amber-500">{unlockedCount} / {achievements.length} Badges</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((badge) => (
          <div
            key={badge.id}
            className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
              badge.unlocked
                ? 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800 opacity-60'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
              badge.unlocked ? 'bg-amber-50 dark:bg-amber-950/50' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {badge.unlocked ? badge.icon : '🔒'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {badge.title}
                </h3>
                {badge.unlocked && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {badge.description}
              </p>
              {badge.unlockedAt && (
                <span className="inline-block text-[9px] text-slate-400 font-medium">
                  Unlocked on {badge.unlockedAt}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
