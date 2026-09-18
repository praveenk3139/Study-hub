import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Subject,
  Topic,
  StudyTask,
  TestAttempt,
  Flashcard,
  Achievement,
  Friend,
  ChatMessage,
  StudyRoom,
  Exam,
  NotificationItem,
  UserProfile,
  TopicStatus
} from '../types';
import {
  initialUserProfile,
  initialSubjects,
  initialStudyTasks,
  initialExams,
  initialAchievements,
  initialFriends,
  initialNotifications,
} from '../data/seedData';

interface StudyContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  subjects: Subject[];
  addSubject: (name: string, code: string, color: string) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopic: (subjectId: string, unitId: string, topicName: string) => void;
  toggleTopicCompletion: (subjectId: string, unitId: string, topicId: string) => void;
  updateTopicPerformance: (topicName: string, subjectName: string, newAccuracy: number) => void;
  
  // Weak topics
  allTopicsWithPerformance: { topic: Topic; subject: Subject; unitTitle: string }[];
  weakTopicsList: { topic: Topic; subject: Subject; unitTitle: string }[];
  needsPracticeList: { topic: Topic; subject: Subject; unitTitle: string }[];
  strongTopicsList: { topic: Topic; subject: Subject; unitTitle: string }[];
  
  // Study tasks / Plan
  studyTasks: StudyTask[];
  toggleTask: (taskId: string) => void;
  addTask: (task: Omit<StudyTask, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  applyNewStudyPlan: (newTasks: StudyTask[]) => void;
  
  // Tests & Attempts
  testAttempts: TestAttempt[];
  recordTestAttempt: (attempt: Omit<TestAttempt, 'id'>) => TestAttempt;
  
  // Active Revision / Retest
  activeRevisionTopic: { topicName: string; subjectName: string; unitTitle: string; currentAccuracy: number } | null;
  setActiveRevisionTopic: (data: { topicName: string; subjectName: string; unitTitle: string; currentAccuracy: number } | null) => void;
  
  // Flashcards
  flashcards: Flashcard[];
  markFlashcardKnown: (id: string, known: boolean) => void;
  addFlashcardsToDeck: (newCards: Flashcard[]) => void;
  
  // Exams
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  deleteExam: (id: string) => void;
  
  // Friends & Chat
  friends: Friend[];
  chatMessages: Record<string, ChatMessage[]>;
  sendMessage: (friendId: string, text: string) => void;
  
  // Study Rooms
  studyRooms: StudyRoom[];
  createStudyRoom: (name: string, subject: string) => void;
  
  // Achievements
  achievements: Achievement[];
  
  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Distraction Shield
  distractionShield: {
    enabled: boolean;
    blockedSites: string[];
    allowedExceptions: string[];
  };
  updateDistractionShield: (updates: Partial<{ enabled: boolean; blockedSites: string[]; allowedExceptions: string[] }>) => void;
  
  // Focus sessions
  totalFocusMinutes: number;
  logFocusSession: (minutes: number) => void;
  
  // Reset demo
  resetToDemoData: () => void;
  resetAllData: () => void;
  
  // Recent activity logs
  recentActivities: { id: string; text: string; time: string; icon: string }[];
  addRecentActivity: (text: string, icon: string) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage keys with versioning to allow instant sync
  const STORAGE_PREFIX = 'study_hub_v1_';

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'profile');
    return saved ? JSON.parse(saved) : initialUserProfile;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'subjects');
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'tasks');
    return saved ? JSON.parse(saved) : initialStudyTasks;
  });

  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'attempts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "att-1",
        testTitle: "Data Structures - Unit 2 Trees & Hierarchies",
        subject: "Data Structures",
        unit: "Unit 2",
        topic: "Trees",
        date: "2025-09-12 14:30",
        score: 9,
        totalMarks: 20,
        percentage: 45,
        timeSpentSeconds: 720,
        questionsCount: 10,
        correctAnswersCount: 4,
        questionResults: []
      },
      {
        id: "att-2",
        testTitle: "DBMS - Relational Model & Joins Assessment",
        subject: "DBMS",
        unit: "Unit 1",
        date: "2025-09-05 11:15",
        score: 16,
        totalMarks: 20,
        percentage: 80,
        timeSpentSeconds: 610,
        questionsCount: 10,
        correctAnswersCount: 8,
        questionResults: []
      }
    ];
  });

  const [activeRevisionTopic, setActiveRevisionTopic] = useState<{ topicName: string; subjectName: string; unitTitle: string; currentAccuracy: number } | null>(null);

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'flashcards');
    if (saved) return JSON.parse(saved);
    return [
      { id: "fc-1", deckId: "trees", subject: "Data Structures", topic: "Trees", front: "What is the balance factor of an AVL tree node?", back: "Height of Left Subtree - Height of Right Subtree. Must be -1, 0, or +1.", category: "Formulas" },
      { id: "fc-2", deckId: "trees", subject: "Data Structures", topic: "Trees", front: "What is the time complexity to search in a balanced Binary Search Tree?", back: "O(log n) average and worst-case for balanced trees (AVL/Red-Black).", category: "Complexity" },
      { id: "fc-3", deckId: "ml", subject: "Machine Learning", topic: "Naive Bayes", front: "Why is Naive Bayes called 'Naive'?", back: "It assumes all features are conditionally independent given the class label.", category: "Assumptions" },
      { id: "fc-4", deckId: "dbms", subject: "DBMS", topic: "Normalization", front: "What distinguishes BCNF from 3NF?", back: "In BCNF, for every functional dependency X -> Y, X must strictly be a Superkey. 3NF allows Y to be a prime attribute.", category: "Rules" },
    ];
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'exams');
    return saved ? JSON.parse(saved) : initialExams;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'achievements');
    return saved ? JSON.parse(saved) : initialAchievements;
  });

  const [friends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'friends');
    return saved ? JSON.parse(saved) : initialFriends;
  });

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'chat');
    if (saved) return JSON.parse(saved);
    return {
      "fr-1": [
        { id: "m1", senderId: "fr-1", text: "Hey Praveen! How's your Trees revision going?", timestamp: "10:15 AM" },
        { id: "m2", senderId: "me", text: "Just working through the AVL rotations right now. Feeling much better about it!", timestamp: "10:18 AM" },
      ]
    };
  });

  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([
    { id: "sr-1", name: "Data Structures Sprint", subject: "Data Structures", participantsCount: 4, activeTimer: "18:40", isFocusActive: true, maxParticipants: 8 },
    { id: "sr-2", name: "DBMS University Exam Prep", subject: "DBMS", participantsCount: 6, activeTimer: "42:15", isFocusActive: true, maxParticipants: 10 },
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'notifs');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [distractionShield, setDistractionShield] = useState(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'shield');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      blockedSites: ["instagram.com", "reddit.com", "x.com", "tiktok.com", "netflix.com"],
      allowedExceptions: ["youtube.com/education", "web.whatsapp.com", "github.com", "stackoverflow.com"]
    };
  });

  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'focus_min');
    return saved ? Number(saved) : 340;
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: "act-1", text: "Uploaded PDF: Data Structures Unit 2 Complete Notes", time: "10 mins ago", icon: "FileText" },
    { id: "act-2", text: "Completed Unit 2 Practice Quiz (Score: 45%)", time: "1 hour ago", icon: "CheckCircle" },
    { id: "act-3", text: "Asked AI Doubt: 'Explain AVL tree balance factor'", time: "3 hours ago", icon: "Bot" },
    { id: "act-4", text: "Completed Searching revision and Retest (Score: 88%)", time: "Yesterday", icon: "RefreshCw" },
  ]);

  // Persist states
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'tasks', JSON.stringify(studyTasks));
  }, [studyTasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'attempts', JSON.stringify(testAttempts));
  }, [testAttempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'shield', JSON.stringify(distractionShield));
  }, [distractionShield]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'focus_min', totalFocusMinutes.toString());
  }, [totalFocusMinutes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Apply dark mode class to HTML
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // Flattened topic list with subjects
  const allTopicsWithPerformance = subjects.flatMap(subject =>
    subject.units.flatMap(unit =>
      unit.topics.map(topic => ({
        topic,
        subject,
        unitTitle: unit.title,
      }))
    )
  );

  const weakTopicsList = allTopicsWithPerformance.filter(t => t.topic.status === 'Weak');
  const needsPracticeList = allTopicsWithPerformance.filter(t => t.topic.status === 'Needs Practice');
  const strongTopicsList = allTopicsWithPerformance.filter(t => t.topic.status === 'Strong');

  const addRecentActivity = (text: string, icon: string) => {
    setRecentActivities(prev => [
      { id: Date.now().toString(), text, time: 'Just now', icon },
      ...prev.slice(0, 15)
    ]);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const addSubject = (name: string, code: string, color: string) => {
    const newSubject: Subject = {
      id: "sub-" + Date.now(),
      name,
      code,
      color,
      icon: "BookOpen",
      progress: 0,
      units: [
        {
          id: `u-${Date.now()}-1`,
          unitNumber: 1,
          title: "Unit 1: Fundamentals",
          progress: 0,
          topics: [
            { id: `top-${Date.now()}-1`, name: "Core Concepts", completed: false, accuracy: 0, attempts: 0, lastTested: "Never", improvement: "0%", status: "Needs Practice" }
          ]
        }
      ]
    };
    setSubjects(prev => [...prev, newSubject]);
    addRecentActivity(`Added new subject: ${name}`, "BookOpen");
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const addTopic = (subjectId: string, unitId: string, topicName: string) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;
      return {
        ...sub,
        units: sub.units.map(unit => {
          if (unit.id !== unitId) return unit;
          const newTopic: Topic = {
            id: `top-${Date.now()}`,
            name: topicName,
            completed: false,
            accuracy: 0,
            attempts: 0,
            lastTested: "Not tested",
            improvement: "0%",
            status: "Needs Practice"
          };
          return { ...unit, topics: [...unit.topics, newTopic] };
        })
      };
    }));
  };

  const toggleTopicCompletion = (subjectId: string, unitId: string, topicId: string) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;
      const updatedUnits = sub.units.map(unit => {
        if (unit.id !== unitId) return unit;
        const updatedTopics = unit.topics.map(top => top.id === topicId ? { ...top, completed: !top.completed } : top);
        const completedCount = updatedTopics.filter(t => t.completed).length;
        const unitProgress = Math.round((completedCount / updatedTopics.length) * 100);
        return { ...unit, topics: updatedTopics, progress: unitProgress };
      });
      const avgSubjectProgress = Math.round(updatedUnits.reduce((acc, u) => acc + u.progress, 0) / updatedUnits.length);
      return { ...sub, units: updatedUnits, progress: avgSubjectProgress };
    }));
  };

  // Re-evaluates status & interconnected intelligence metrics
  const updateTopicPerformance = (topicName: string, subjectName: string, newAccuracy: number) => {
    let updatedStatus: TopicStatus = newAccuracy >= 75 ? 'Strong' : newAccuracy >= 60 ? 'Needs Practice' : 'Weak';

    setSubjects(prev => prev.map(sub => {
      if (sub.name.toLowerCase() !== subjectName.toLowerCase() && !subjectName.toLowerCase().includes(sub.name.toLowerCase())) {
        return sub;
      }
      return {
        ...sub,
        units: sub.units.map(unit => ({
          ...unit,
          topics: unit.topics.map(t => {
            if (t.name.toLowerCase().includes(topicName.toLowerCase()) || topicName.toLowerCase().includes(t.name.toLowerCase())) {
              const prevAcc = t.accuracy;
              const diff = newAccuracy - prevAcc;
              const impStr = diff >= 0 ? `+${diff}%` : `${diff}%`;
              return {
                ...t,
                accuracy: newAccuracy,
                attempts: t.attempts + 1,
                lastTested: new Date().toISOString().split('T')[0],
                improvement: impStr,
                status: updatedStatus
              };
            }
            return t;
          })
        }))
      };
    }));

    // Check achievement for Topic Master if user brought accuracy from weak to >=80%
    if (newAccuracy >= 80) {
      setAchievements(prev => prev.map(ach => ach.id === 'ach-4' ? { ...ach, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] } : ach));
    }

    // Recalculate AI performance & Exam readiness
    setProfile(prev => {
      const newAiScore = Math.min(96, Math.max(50, Math.round((prev.aiPerformanceScore * 3 + newAccuracy) / 4)));
      const newReadiness = Math.min(98, Math.max(50, Math.round((prev.examReadinessScore * 3 + (newAccuracy > 70 ? newAccuracy : 65)) / 4)));
      return {
        ...prev,
        aiPerformanceScore: newAiScore,
        examReadinessScore: newReadiness
      };
    });
  };

  const toggleTask = (taskId: string) => {
    setStudyTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (task: Omit<StudyTask, 'id'>) => {
    const newTask: StudyTask = { ...task, id: `task-${Date.now()}` };
    setStudyTasks(prev => [newTask, ...prev]);
  };

  const deleteTask = (taskId: string) => {
    setStudyTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const applyNewStudyPlan = (newTasks: StudyTask[]) => {
    setStudyTasks(newTasks);
    addRecentActivity("Updated daily study plan with AI recommendations", "Calendar");
  };

  const recordTestAttempt = (attemptData: Omit<TestAttempt, 'id'>) => {
    const newAttempt: TestAttempt = {
      ...attemptData,
      id: `att-${Date.now()}`
    };
    setTestAttempts(prev => [newAttempt, ...prev]);

    // Update topic performance if topic is associated
    if (newAttempt.topic) {
      updateTopicPerformance(newAttempt.topic, newAttempt.subject, newAttempt.percentage);
    }

    addRecentActivity(`Completed test: ${newAttempt.testTitle} (${newAttempt.percentage}%)`, "CheckCircle");

    // Unlock First Test achievement
    setAchievements(prev => prev.map(a => a.id === 'ach-1' ? { ...a, unlocked: true } : a));

    // High score achievement
    if (newAttempt.percentage >= 90) {
      setAchievements(prev => prev.map(a => a.id === 'ach-5' ? { ...a, unlocked: true } : a));
    }

    return newAttempt;
  };

  const markFlashcardKnown = (id: string, known: boolean) => {
    setFlashcards(prev => prev.map(c => c.id === id ? { ...c, known } : c));
  };

  const addFlashcardsToDeck = (newCards: Flashcard[]) => {
    setFlashcards(prev => [...newCards, ...prev]);
  };

  const addExam = (exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = { ...exam, id: `ex-${Date.now()}` };
    setExams(prev => [...prev, newExam]);
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const sendMessage = (friendId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), newMsg]
    }));

    // Auto peer reply simulation after 1.5s
    setTimeout(() => {
      const replies = [
        "Awesome progress! Keep going!",
        "Thanks for sharing, I was just reviewing that same chapter!",
        "Let's jump into a study room together later today!",
        "Good luck with the retest, you've got this!"
      ];
      const replyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: friendId,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(curr => ({
        ...curr,
        [friendId]: [...(curr[friendId] || []), replyMsg]
      }));
    }, 1500);
  };

  const createStudyRoom = (name: string, subject: string) => {
    const newRoom: StudyRoom = {
      id: `sr-${Date.now()}`,
      name,
      subject,
      participantsCount: 1,
      activeTimer: "25:00",
      isFocusActive: true,
      maxParticipants: 8
    };
    setStudyRooms(prev => [newRoom, ...prev]);
    addRecentActivity(`Created study room: ${name}`, "Users");
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateDistractionShield = (updates: Partial<{ enabled: boolean; blockedSites: string[]; allowedExceptions: string[] }>) => {
    setDistractionShield((prev: any) => ({ ...prev, ...updates }));
  };

  const logFocusSession = (minutes: number) => {
    setTotalFocusMinutes(prev => prev + minutes);
    addRecentActivity(`Completed ${minutes}-minute deep focus study session`, "Clock");
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setProfile(initialUserProfile);
    setSubjects(initialSubjects);
    setStudyTasks(initialStudyTasks);
    setExams(initialExams);
    setAchievements(initialAchievements);
    setNotifications(initialNotifications);
    setTotalFocusMinutes(340);
    window.location.reload();
  };

  const resetAllData = resetToDemoData;

  return (
    <StudyContext.Provider
      value={{
        profile,
        updateProfile,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        toggleTopicCompletion,
        updateTopicPerformance,
        allTopicsWithPerformance,
        weakTopicsList,
        needsPracticeList,
        strongTopicsList,
        studyTasks,
        toggleTask,
        addTask,
        deleteTask,
        applyNewStudyPlan,
        testAttempts,
        recordTestAttempt,
        activeRevisionTopic,
        setActiveRevisionTopic,
        flashcards,
        markFlashcardKnown,
        addFlashcardsToDeck,
        exams,
        addExam,
        deleteExam,
        friends,
        chatMessages,
        sendMessage,
        studyRooms,
        createStudyRoom,
        achievements,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        distractionShield,
        updateDistractionShield,
        totalFocusMinutes,
        logFocusSession,
        resetToDemoData,
        resetAllData,
        recentActivities,
        addRecentActivity,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudy must be used within a StudyProvider");
  }
  return context;
};
