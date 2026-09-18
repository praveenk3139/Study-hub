import React, { useState } from 'react';
import { Home, BookOpen, FileCheck2, Bot, MoreHorizontal, Brain, Calendar, BarChart3, Gamepad2, Users, Settings, Clock, Award } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onNavigate: (tabId: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onNavigate }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const primaryItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'tests', label: 'Tests', icon: FileCheck2 },
    { id: 'ai', label: 'AI', icon: Bot },
  ];

  const moreItems = [
    { id: 'weak', label: 'Weak Topics', icon: Brain },
    { id: 'plan', label: 'Study Plan', icon: Calendar },
    { id: 'pdf', label: 'PDF Analysis', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'focus', label: 'Focus Mode', icon: Clock },
    { id: 'fun', label: 'Fun Check-up', icon: Gamepad2 },
    { id: 'friends', label: 'Friends & Rooms', icon: Users },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {showMoreMenu && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden flex flex-col justify-end" onClick={() => setShowMoreMenu(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200 max-h-[70vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">More Features</h3>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map(item => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5 text-blue-500" />
                    <span className="text-xs font-medium leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
        {primaryItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setShowMoreMenu(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            showMoreMenu ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
