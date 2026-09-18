import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  colorClass?: string;
  heightClass?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  colorClass = "bg-emerald-500",
  heightClass = "h-2",
  showLabel = false,
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span className="font-semibold">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
