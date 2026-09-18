import React from 'react';
import {
  Home,
  BookOpen,
  FileText,
  FileCheck2,
  Bot,
  Calendar,
  Brain,
  BarChart3,
  Gamepad2,
  Users,
  Clock,
  Award,
  Settings,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { weakTopicsList } = useStudy();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'study', label: 'My Study', icon: BookOpen },
    { id: 'pdf', label: 'PDF Analysis', icon: FileText },
    { id: 'tests', label: 'Tests & Quizzes', icon: FileCheck2, badge: 'NEW' },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'plan', label: 'Study Plan', icon: Calendar },
    { id: 'weak', label: 'Weak Topics', icon: Brain, badge: weakTopicsList.length > 0 ? `${weakTopicsList.length}` : 'NEW' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'focus', label: 'Focus Mode', icon: Clock },
    { id: 'fun', label: 'Fun Check-up', icon: Gamepad2 },
    { id: 'friends', label: 'Friends / Chat', icon: Users },
    { id: 'shield', label: 'Distraction Shield', icon: ShieldCheck },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-61px)] transition-colors">
      <div className="p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-blue-700/80 text-white'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inspirational bottom badge */}
      <div className="p-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/30">
          <div className="flex items-start gap-2.5">
            <span className="text-xl">🌱</span>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Small steps</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 leading-snug">
                Every day lead to big results!
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
