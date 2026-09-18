import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  FolderGit2,
  BrainCircuit,
  Database,
  Cpu,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';

interface MyStudyViewProps {
  onStartRevision: (topicName: string, subjectName: string, unitTitle: string, currentAccuracy: number) => void;
}

export const MyStudyView: React.FC<MyStudyViewProps> = ({ onStartRevision }) => {
  const { subjects, addSubject, addTopic, toggleTopicCompletion } = useStudy();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "ds");
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({ "ds-u2": true, "ds-u1": true });

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#3B82F6');

  const [newTopicName, setNewTopicName] = useState('');
  const [addingTopicUnitId, setAddingTopicUnitId] = useState<string | null>(null);

  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    addSubject(newSubjectName, newSubjectCode || 'CS101', newSubjectColor);
    setNewSubjectName('');
    setNewSubjectCode('');
    setShowAddSubjectModal(false);
  };

  const handleAddTopic = (unitId: string) => {
    if (!newTopicName.trim()) return;
    addTopic(activeSubject.id, unitId, newTopicName);
    setNewTopicName('');
    setAddingTopicUnitId(null);
  };

  const getSubjectIcon = (code: string) => {
    if (code.includes('301')) return FolderGit2;
    if (code.includes('402')) return BrainCircuit;
    if (code.includes('304')) return Database;
    return Cpu;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Study & Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize your subjects, units, and track topic-level mastery.
          </p>
        </div>
        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map(subject => {
          const Icon = getSubjectIcon(subject.code);
          const isSelected = subject.id === activeSubject?.id;
          return (
            <button
              key={subject.id}
              onClick={() => setSelectedSubjectId(subject.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left transition-all shrink-0 min-w-[200px] ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                  : 'bg-white/60 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: subject.color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{subject.name}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{subject.code}</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{subject.progress}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subject Details */}
      {activeSubject && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {activeSubject.code}
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{activeSubject.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeSubject.units.length} Units • {activeSubject.units.reduce((a, b) => a + b.topics.length, 0)} Topics
              </p>
            </div>
            <div className="w-full sm:w-60 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                <span>Subject Mastery</span>
                <span>{activeSubject.progress}%</span>
              </div>
              <ProgressBar progress={activeSubject.progress} colorClass="bg-blue-600" heightClass="h-2.5" />
            </div>
          </div>

          {/* Units Accordion */}
          <div className="space-y-3">
            {activeSubject.units.map(unit => {
              const isExpanded = expandedUnits[unit.id] ?? false;
              return (
                <div
                  key={unit.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden"
                >
                  <div
                    onClick={() => toggleUnit(unit.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        U{unit.unitNumber}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{unit.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {unit.topics.length} Topics • {unit.topics.filter(t => t.completed).length} Completed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block w-32 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>Unit Progress</span>
                          <span>{unit.progress}%</span>
                        </div>
                        <ProgressBar progress={unit.progress} colorClass="bg-emerald-500" heightClass="h-1.5" />
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Topics List */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-700/60 p-4 sm:p-5 space-y-2.5 bg-slate-50/40 dark:bg-slate-900/30">
                      {unit.topics.map(topic => (
                        <div
                          key={topic.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleTopicCompletion(activeSubject.id, unit.id, topic.id)}
                              aria-label="Toggle Complete"
                              className="text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              {topic.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                              )}
                            </button>
                            <div>
                              <p className={`text-xs font-bold text-slate-900 dark:text-white ${topic.completed ? 'line-through text-slate-400' : ''}`}>
                                {topic.name}
                              </p>
                              {topic.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {topic.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{topic.accuracy}%</span>
                              <span className="text-[10px] text-slate-400 ml-1">({topic.attempts} tests)</span>
                            </div>
                            <StatusBadge status={topic.status} size="sm" />
                            {topic.status === 'Weak' && (
                              <button
                                onClick={() => onStartRevision(topic.name, activeSubject.name, unit.title, topic.accuracy)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                              >
                                <span>Revise</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Topic Input */}
                      {addingTopicUnitId === unit.id ? (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Enter topic name..."
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button
                            onClick={() => handleAddTopic(unit.id)}
                            className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                          >
                            Save Topic
                          </button>
                          <button
                            onClick={() => setAddingTopicUnitId(null)}
                            className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingTopicUnitId(unit.id)}
                          className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-colors flex items-center justify-center gap-1.5 mt-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Topic to this Unit</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Networks"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g., CS306"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Theme Color</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubjectColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${newSubjectColor === c ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
