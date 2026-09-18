import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Heart,
  Smile,
  RefreshCw,
  Award,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { funQuestionsBank } from '../data/seedData';

export const FunCheckupView: React.FC = () => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breatheText, setBreatheText] = useState('Breathe In...');

  const question = funQuestionsBank[currentQIndex];

  const handleSelect = (option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [question.id]: option }));
    if (currentQIndex < funQuestionsBank.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleStartBreathing = () => {
    setBreathingActive(true);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count % 8 < 4) {
        setBreatheText('Inhale gently... 🌬️');
      } else {
        setBreatheText('Exhale and release stress... 🍃');
      }
      if (count > 24) {
        clearInterval(interval);
        setBreathingActive(false);
        setBreatheText('You are refreshed and ready! ✨');
      }
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Fun Student Check-up & De-stress
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Take a quick 2-minute breather, reset your brain, and recharge your energy.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Check-up Question Card */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4">
          {!showSummary ? (
            <>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>Question {currentQIndex + 1} of {funQuestionsBank.length}</span>
                  <span className="text-xl">{question.emoji}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {question.question}
                </h3>
              </div>

              <div className="space-y-2.5">
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / funQuestionsBank.length) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-2xl shadow-sm">
                🎉
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Check-up Profile Complete!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your brain is powered by: <strong>{selectedAnswers[1] || "Crispy Masala Dosa"}</strong> and your study superpower is <strong>{selectedAnswers[3] || "Superhuman Focus"}</strong>!
              </p>
              <button
                onClick={() => {
                  setShowSummary(false);
                  setCurrentQIndex(0);
                  setSelectedAnswers({});
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-xs"
              >
                Restart Check-up
              </button>
            </div>
          )}
        </div>

        {/* Guided Breathing Sanctuary */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-teal-950/30 rounded-3xl p-6 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-xl">
            🌬️
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
              30-Second Micro Reset
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              Lower study anxiety and reboot your memory retention circuits.
            </p>
          </div>

          <div className="w-40 h-40 rounded-full bg-emerald-200/40 dark:bg-emerald-900/40 flex items-center justify-center p-4 border border-emerald-300 dark:border-emerald-700">
            <span className={`text-xs font-bold text-emerald-900 dark:text-emerald-200 text-center ${
              breathingActive ? 'animate-pulse scale-105' : ''
            }`}>
              {breatheText}
            </span>
          </div>

          <button
            onClick={handleStartBreathing}
            disabled={breathingActive}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            {breathingActive ? "In Session..." : "Begin Guided Breathing"}
          </button>
        </div>
      </div>
    </div>
  );
};
