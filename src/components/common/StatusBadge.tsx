import React from 'react';
import { TopicStatus } from '../../types';

interface StatusBadgeProps {
  status: TopicStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bgClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  let dotColor = "bg-slate-400";
  let label = status;

  if (status === 'Strong' || status === 'strong') {
    bgClass = "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40";
    dotColor = "bg-emerald-500";
    label = "Strong";
  } else if (status === 'Needs Practice' || status === 'practice') {
    bgClass = "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40";
    dotColor = "bg-amber-500";
    label = "Needs Practice";
  } else if (status === 'Weak' || status === 'weak') {
    bgClass = "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40";
    dotColor = "bg-rose-500";
    label = "Weak";
  } else if (status === 'Info' || status === 'info') {
    bgClass = "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40";
    dotColor = "bg-blue-500";
  }

  const pxClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${pxClass} ${bgClass} transition-colors whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span>{label}</span>
    </span>
  );
};
