import React, { useState } from 'react';
import { StudyProvider } from './context/StudyContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { DashboardView } from './views/DashboardView';
import { MyStudyView } from './views/MyStudyView';
import { WeakTopicsView } from './views/WeakTopicsView';
import { RevisionSessionView } from './views/RevisionSessionView';
import { TestsQuizzesView } from './views/TestsQuizzesView';
import { PDFAnalysisView } from './views/PDFAnalysisView';
import { AIAssistantView } from './views/AIAssistantView';
import { StudyPlanView } from './views/StudyPlanView';
import { AnalyticsView } from './views/AnalyticsView';
import { ExamReadinessView } from './views/ExamReadinessView';
import { FocusModeView } from './views/FocusModeView';
import { DistractionShieldView } from './views/DistractionShieldView';
import { FunCheckupView } from './views/FunCheckupView';
import { FriendsChatView } from './views/FriendsChatView';
import { AchievementsView } from './views/AchievementsView';
import { SettingsView } from './views/SettingsView';

interface RevisionParams {
  topicName: string;
  subjectName: string;
  unitTitle: string;
  currentAccuracy: number;
}

const MainAppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [revisionParams, setRevisionParams] = useState<RevisionParams | null>(null);

  const handleStartRevision = (
    topicName: string,
    subjectName: string,
    unitTitle: string,
    currentAccuracy: number
  ) => {
    setRevisionParams({
      topicName,
      subjectName,
      unitTitle,
      currentAccuracy
    });
    setCurrentTab('revision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickRevision = () => {
    handleStartRevision(
      "Trees",
      "Data Structures",
      "Unit 2: Trees & Hierarchical Structures",
      45
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onQuickRevision={handleQuickRevision}
      />

      <div className="flex-1 flex w-full">
        {/* Desktop Left Sidebar */}
        <Sidebar currentTab={currentTab} onNavigate={setCurrentTab} />

        {/* Main Content Area */}
        <main className="flex-1 pb-20 md:pb-8 overflow-x-hidden min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              onStartRevision={handleStartRevision}
            />
          )}

          {currentTab === 'study' && (
            <MyStudyView onStartRevision={handleStartRevision} />
          )}

          {currentTab === 'weak-topics' && (
            <WeakTopicsView onStartRevision={handleStartRevision} />
          )}

          {currentTab === 'revision' && (
            <RevisionSessionView
              topicName={revisionParams?.topicName}
              subjectName={revisionParams?.subjectName}
              unitTitle={revisionParams?.unitTitle}
              currentAccuracy={revisionParams?.currentAccuracy}
              onBack={() => setCurrentTab('weak-topics')}
              onFinishRevision={() => setCurrentTab('weak-topics')}
            />
          )}

          {currentTab === 'tests' && (
            <TestsQuizzesView onStartRevision={handleStartRevision} />
          )}

          {currentTab === 'pdf-analysis' && (
            <PDFAnalysisView onStartRevision={handleStartRevision} />
          )}

          {currentTab === 'ai-assistant' && <AIAssistantView />}

          {currentTab === 'plan' && (
            <StudyPlanView onStartRevision={handleStartRevision} />
          )}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'readiness' && (
            <ExamReadinessView
              onStartRevision={handleStartRevision}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'focus' && <FocusModeView />}

          {currentTab === 'shield' && <DistractionShieldView />}

          {currentTab === 'fun' && <FunCheckupView />}

          {currentTab === 'friends' && <FriendsChatView />}

          {currentTab === 'achievements' && <AchievementsView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentTab={currentTab} onNavigate={setCurrentTab} />
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainAppContent />
    </StudyProvider>
  );
}
