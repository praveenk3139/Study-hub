import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Coffee,
  Zap
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const FocusModeView: React.FC = () => {
  const { totalFocusMinutes, logFocusSession, profile } = useStudy();

  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'whitenoise' | 'binaural'>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<any>(null);

  // Switch timer modes
  const handleSetTimerMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') setSecondsLeft(25 * 60);
    else if (newMode === 'shortBreak') setSecondsLeft(5 * 60);
    else setSecondsLeft(15 * 60);
  };

  // Timer interval
  useEffect(() => {
    let interval: any;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleCompleteSession = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      logFocusSession(25);
      alert("🎉 Great focus session! Time for a 5-minute break.");
      handleSetTimerMode('shortBreak');
    } else {
      alert("Break complete! Ready to dive back in?");
      handleSetTimerMode('focus');
    }
  };

  // Web Audio API Ambient Sound Generator
  const toggleAmbientSound = (type: 'none' | 'whitenoise' | 'binaural') => {
    // Stop any existing sound
    if (soundNodeRef.current) {
      try {
        soundNodeRef.current.stop();
        soundNodeRef.current.disconnect();
      } catch (e) {}
      soundNodeRef.current = null;
    }

    if (type === 'none' || ambientSound === type) {
      setAmbientSound('none');
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'binaural') {
        // Binaural 40Hz gamma / 220Hz study tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(216, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime); // gentle background volume
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        soundNodeRef.current = osc;
      } else if (type === 'whitenoise') {
        // Synthesize soft white noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.02; // soft noise
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(ctx.destination);
        noise.start();
        soundNodeRef.current = noise;
      }
      setAmbientSound(type);
    } catch (e) {
      console.warn("Ambient sound error:", e);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (soundNodeRef.current) {
        try { soundNodeRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 text-white max-w-none flex flex-col justify-center items-center p-8' : ''}`}>
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Focus & Pomodoro Sanctuary
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Eliminate distractions and maintain sustained study velocity.
            </p>
          </div>
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Screen Mode</span>
          </button>
        </div>
      )}

      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      )}

      {/* Main Clock Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-700/80 shadow-lg text-center space-y-8">
        {/* Mode selector pills */}
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl gap-1">
          <button
            onClick={() => handleSetTimerMode('focus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'focus' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Deep Focus (25m)
          </button>
          <button
            onClick={() => handleSetTimerMode('shortBreak')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleSetTimerMode('longBreak')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'longBreak' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Giant Timer */}
        <div className="space-y-2">
          <span className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-slate-900 dark:text-white select-none">
            {timeFormatted}
          </span>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {mode === 'focus' ? "🧠 Deep Concentration Active" : "☕ Resting & Hydrating"}
          </p>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-2xl text-sm font-bold text-white shadow-md flex items-center gap-2 transition-transform hover:scale-105 ${
              isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            <span>{isRunning ? "Pause" : "Start Focus"}</span>
          </button>

          <button
            onClick={() => handleSetTimerMode(mode)}
            className="p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sounds Synthesizer Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-700/60 max-w-md mx-auto space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Synthesized Focus Audio
          </span>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => toggleAmbientSound('none')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                ambientSound === 'none' ? 'bg-slate-200 dark:bg-slate-700 font-bold' : 'text-slate-400'
              }`}
            >
              Mute
            </button>
            <button
              onClick={() => toggleAmbientSound('whitenoise')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                ambientSound === 'whitenoise' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🌊 White Noise
            </button>
            <button
              onClick={() => toggleAmbientSound('binaural')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                ambientSound === 'binaural' ? 'bg-purple-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🎧 Alpha Waves (40Hz)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
