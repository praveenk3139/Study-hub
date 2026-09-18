import React, { useState } from 'react';
import {
  Settings,
  User,
  Save,
  RotateCcw,
  Download,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, resetAllData } = useStudy();

  const [name, setName] = useState(profile.name);
  const [university, setUniversity] = useState(profile.university);
  const [semester, setSemester] = useState(profile.semester);
  const [dailyTarget, setDailyTarget] = useState(profile.dailyTargetMinutes);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      university,
      semester,
      dailyTargetMinutes: Number(dailyTarget)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const data = {
      profile,
      exportedAt: new Date().toISOString(),
      localStorageDump: window.localStorage
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_study_hub_backup_${Date.now()}.json`;
    a.click();
  };

  const handleReset = () => {
    if (confirm("Reset all study progress, tests, and tasks to default initial state?")) {
      resetAllData();
      alert("All data has been reset to defaults.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Preferences & Configuration
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Personalize your study profile, targets, and data storage.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Student Profile Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                University / College
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester / Year
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Study Target (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={600}
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Profile Updated!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>

        <hr className="border-slate-100 dark:border-slate-700/60" />

        {/* Data export & reset */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Data Management & Backup</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-xs space-y-1 transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Export Study Data (.json)</span>
              </div>
              <p className="text-slate-400">Download your offline copy of test attempts, notes, and tasks.</p>
            </button>

            <button
              onClick={handleReset}
              className="flex-1 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left text-xs space-y-1 transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-rose-600">
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Data to Demo Defaults</span>
              </div>
              <p className="text-slate-400">Restores initial state for all subjects, tasks, and test results.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
