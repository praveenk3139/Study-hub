import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const DistractionShieldView: React.FC = () => {
  const { distractionShield, updateDistractionShield } = useStudy();

  const [newBlocked, setNewBlocked] = useState('');
  const [newAllowed, setNewAllowed] = useState('');

  const handleToggleShield = () => {
    updateDistractionShield({ enabled: !distractionShield.enabled });
  };

  const handleAddBlocked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlocked.trim()) return;
    updateDistractionShield({
      blockedSites: [...distractionShield.blockedSites, newBlocked.trim().toLowerCase()]
    });
    setNewBlocked('');
  };

  const handleRemoveBlocked = (domain: string) => {
    updateDistractionShield({
      blockedSites: distractionShield.blockedSites.filter(s => s !== domain)
    });
  };

  const handleAddAllowed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllowed.trim()) return;
    updateDistractionShield({
      allowedExceptions: [...distractionShield.allowedExceptions, newAllowed.trim().toLowerCase()]
    });
    setNewAllowed('');
  };

  const handleRemoveAllowed = (domain: string) => {
    updateDistractionShield({
      allowedExceptions: distractionShield.allowedExceptions.filter(s => s !== domain)
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            distractionShield.enabled ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {distractionShield.enabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Distraction Shield
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Prevent study session interruptions and keep your attention locked on curriculum mastery.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleShield}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-colors self-start sm:self-auto ${
            distractionShield.enabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'
          }`}
        >
          {distractionShield.enabled ? "Shield Active 🛡️" : "Enable Shield"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blocked Sites */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-rose-600 flex items-center gap-2">
            <span>🚫</span> Blocked Temptation Sites ({distractionShield.blockedSites.length})
          </h2>

          <form onSubmit={handleAddBlocked} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., youtube.com, twitter.com"
              value={newBlocked}
              onChange={(e) => setNewBlocked(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700"
            >
              Block
            </button>
          </form>

          <div className="space-y-2">
            {distractionShield.blockedSites.map((site) => (
              <div
                key={site}
                className="flex items-center justify-between p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <span>{site}</span>
                <button
                  onClick={() => handleRemoveBlocked(site)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Whitelisted Study Sites */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
            <span>✅</span> Whitelisted Academic Exceptions ({distractionShield.allowedExceptions.length})
          </h2>

          <form onSubmit={handleAddAllowed} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., arxiv.org, scholar.google.com"
              value={newAllowed}
              onChange={(e) => setNewAllowed(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
            >
              Allow
            </button>
          </form>

          <div className="space-y-2">
            {distractionShield.allowedExceptions.map((site) => (
              <div
                key={site}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <span>{site}</span>
                <button
                  onClick={() => handleRemoveAllowed(site)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
