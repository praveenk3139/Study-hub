import { Subject, Topic, StudyTask, Flashcard, Achievement, Friend, Exam, NotificationItem, UserProfile } from '../types';

export const initialUserProfile: UserProfile = {
  name: "Praveen Kumar",
  username: "praveenkumar",
  email: "praveenk3139@gmail.com",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  streakDays: 7,
  dailyTargetMinutes: 120,
  focusDuration: 25,
  aiPerformanceScore: 72,
  examReadinessScore: 78,
  theme: 'light',
};

export const initialSubjects: Subject[] = [
  {
    id: "ds",
    name: "Data Structures",
    code: "CS301",
    color: "#3B82F6",
    icon: "FolderGit2",
    progress: 72,
    units: [
      {
        id: "ds-u1",
        unitNumber: 1,
        title: "Unit 1: Linear Data Structures & Stacks",
        progress: 90,
        topics: [
          { id: "ds-t1", name: "Arrays and Dynamic Arrays", completed: true, accuracy: 92, attempts: 4, lastTested: "2025-09-02", improvement: "+8%", status: "Strong" },
          { id: "ds-t2", name: "Singly and Doubly Linked Lists", completed: true, accuracy: 88, attempts: 5, lastTested: "2025-09-04", improvement: "+12%", status: "Strong" },
          { id: "ds-t3", name: "Stack Applications & Infix/Postfix", completed: true, accuracy: 90, attempts: 3, lastTested: "2025-09-05", improvement: "+5%", status: "Strong" },
        ]
      },
      {
        id: "ds-u2",
        unitNumber: 2,
        title: "Unit 2: Trees & Hierarchical Structures",
        progress: 55,
        topics: [
          { id: "ds-t4", name: "Trees", completed: false, accuracy: 45, attempts: 3, lastTested: "2025-09-12", improvement: "+30%", status: "Weak", notes: "Focus on Binary Search Tree traversals and AVL balance factor calculations." },
          { id: "ds-t5", name: "Graphs", completed: false, accuracy: 62, attempts: 4, lastTested: "2025-09-10", improvement: "+18%", status: "Needs Practice", notes: "Review Dijkstra's shortest path algorithm and topological sorting." },
          { id: "ds-t6", name: "Binary Heaps & Priority Queues", completed: true, accuracy: 75, attempts: 3, lastTested: "2025-09-07", improvement: "+10%", status: "Needs Practice" },
        ]
      },
      {
        id: "ds-u3",
        unitNumber: 3,
        title: "Unit 3: Searching & Sorting Algorithms",
        progress: 70,
        topics: [
          { id: "ds-t7", name: "Searching", completed: true, accuracy: 88, attempts: 5, lastTested: "2025-09-14", improvement: "+15%", status: "Strong" },
          { id: "ds-t8", name: "Quick Sort & Merge Sort", completed: true, accuracy: 82, attempts: 4, lastTested: "2025-09-11", improvement: "+14%", status: "Strong" },
          { id: "ds-t9", name: "Radix and Counting Sort", completed: false, accuracy: 64, attempts: 2, lastTested: "2025-09-06", improvement: "+4%", status: "Needs Practice" },
        ]
      },
      {
        id: "ds-u4",
        unitNumber: 4,
        title: "Unit 4: Hashing & Symbol Tables",
        progress: 75,
        topics: [
          { id: "ds-t10", name: "Hash Functions & Collision Resolution", completed: true, accuracy: 84, attempts: 3, lastTested: "2025-09-08", improvement: "+10%", status: "Strong" },
          { id: "ds-t11", name: "Trie and Disjoint Sets", completed: false, accuracy: 66, attempts: 2, lastTested: "2025-09-03", improvement: "+6%", status: "Needs Practice" },
        ]
      }
    ]
  },
  {
    id: "ml",
    name: "Machine Learning",
    code: "CS402",
    color: "#8B5CF6",
    icon: "BrainCircuit",
    progress: 84,
    units: [
      {
        id: "ml-u1",
        unitNumber: 1,
        title: "Unit 1: Foundations & Supervised Learning",
        progress: 92,
        topics: [
          { id: "ml-t1", name: "Linear and Logistic Regression", completed: true, accuracy: 94, attempts: 4, lastTested: "2025-09-01", improvement: "+6%", status: "Strong" },
          { id: "ml-t2", name: "Loss Functions & Gradient Descent", completed: true, accuracy: 89, attempts: 3, lastTested: "2025-09-04", improvement: "+8%", status: "Strong" },
        ]
      },
      {
        id: "ml-u2",
        unitNumber: 2,
        title: "Unit 2: Decision Trees & Ensemble Methods",
        progress: 88,
        topics: [
          { id: "ml-t3", name: "Random Forests & Boosting", completed: true, accuracy: 86, attempts: 3, lastTested: "2025-09-06", improvement: "+10%", status: "Strong" },
          { id: "ml-t4", name: "Entropy and Information Gain", completed: true, accuracy: 91, attempts: 4, lastTested: "2025-09-07", improvement: "+11%", status: "Strong" },
        ]
      },
      {
        id: "ml-u3",
        unitNumber: 3,
        title: "Unit 3: Probabilistic Models & Classifiers",
        progress: 72,
        topics: [
          { id: "ml-t5", name: "Naive Bayes", completed: false, accuracy: 68, attempts: 3, lastTested: "2025-09-08", improvement: "+12%", status: "Needs Practice", notes: "Condition independence assumption and Laplace smoothing calculations." },
          { id: "ml-t6", name: "Bayesian Networks", completed: false, accuracy: 70, attempts: 2, lastTested: "2025-09-09", improvement: "+7%", status: "Needs Practice" },
        ]
      }
    ]
  },
  {
    id: "dbms",
    name: "DBMS",
    code: "CS304",
    color: "#10B981",
    icon: "Database",
    progress: 48,
    units: [
      {
        id: "dbms-u1",
        unitNumber: 1,
        title: "Unit 1: Relational Model & SQL",
        progress: 65,
        topics: [
          { id: "dbms-t1", name: "Relational Algebra & Calculus", completed: true, accuracy: 72, attempts: 3, lastTested: "2025-09-03", improvement: "+9%", status: "Needs Practice" },
          { id: "dbms-t2", name: "Complex SQL Joins & Subqueries", completed: true, accuracy: 80, attempts: 4, lastTested: "2025-09-05", improvement: "+15%", status: "Strong" },
        ]
      },
      {
        id: "dbms-u2",
        unitNumber: 2,
        title: "Unit 2: Transactions & Concurrency",
        progress: 40,
        topics: [
          { id: "dbms-t3", name: "ACID Properties & Schedules", completed: false, accuracy: 50, attempts: 2, lastTested: "2025-09-11", improvement: "+5%", status: "Weak" },
          { id: "dbms-t4", name: "Two-Phase Locking (2PL)", completed: false, accuracy: 48, attempts: 2, lastTested: "2025-09-12", improvement: "+3%", status: "Weak" },
        ]
      },
      {
        id: "dbms-u4",
        unitNumber: 4,
        title: "Unit 4: Normalization & Schema Refinement",
        progress: 88,
        topics: [
          { id: "dbms-t5", name: "Normalization", completed: true, accuracy: 88, attempts: 2, lastTested: "2025-09-05", improvement: "+5%", status: "Strong" },
          { id: "dbms-t6", name: "BCNF vs 3NF Decomposition", completed: true, accuracy: 86, attempts: 3, lastTested: "2025-09-06", improvement: "+8%", status: "Strong" },
        ]
      }
    ]
  },
  {
    id: "os",
    name: "Operating Systems",
    code: "CS305",
    color: "#F59E0B",
    icon: "Cpu",
    progress: 76,
    units: [
      {
        id: "os-u1",
        unitNumber: 1,
        title: "Unit 1: Processes & CPU Scheduling",
        progress: 85,
        topics: [
          { id: "os-t1", name: "Process Control Blocks & Context Switching", completed: true, accuracy: 88, attempts: 3, lastTested: "2025-09-02", improvement: "+10%", status: "Strong" },
          { id: "os-t2", name: "Round Robin & Priority Scheduling", completed: true, accuracy: 84, attempts: 4, lastTested: "2025-09-07", improvement: "+12%", status: "Strong" },
        ]
      },
      {
        id: "os-u2",
        unitNumber: 2,
        title: "Unit 2: Memory Management & Paging",
        progress: 70,
        topics: [
          { id: "os-t3", name: "Virtual Memory & Page Replacement", completed: true, accuracy: 76, attempts: 3, lastTested: "2025-09-09", improvement: "+8%", status: "Needs Practice" },
          { id: "os-t4", name: "Segmentation and TLB Caching", completed: true, accuracy: 78, attempts: 2, lastTested: "2025-09-10", improvement: "+9%", status: "Needs Practice" },
        ]
      }
    ]
  }
];

export const initialStudyTasks: StudyTask[] = [
  {
    id: "task-1",
    title: "Revise Trees — 30 min",
    duration: 30,
    subject: "Data Structures",
    type: "revision",
    completed: false,
    priority: "high",
    timeSlot: "10:00 AM"
  },
  {
    id: "task-2",
    title: "Practice Graphs — 20 min",
    duration: 20,
    subject: "Data Structures",
    type: "practice",
    completed: false,
    priority: "medium",
    timeSlot: "11:00 AM"
  },
  {
    id: "task-3",
    title: "Take Unit 2 Mini Test — 15 min",
    duration: 15,
    subject: "Data Structures",
    type: "test",
    completed: false,
    priority: "high",
    timeSlot: "02:00 PM"
  },
  {
    id: "task-4",
    title: "Complete Searching revision",
    duration: 25,
    subject: "Data Structures",
    type: "revision",
    completed: true,
    priority: "low",
    timeSlot: "09:00 AM"
  }
];

export const initialExams: Exam[] = [
  {
    id: "ex-1",
    subject: "DBMS EXAM",
    code: "CS304",
    date: new Date(Date.now() + 12 * 86400000 + 8 * 3600000 + 32 * 60000).toISOString(),
    location: "Hall B - Block 3"
  },
  {
    id: "ex-2",
    subject: "Data Structures Final",
    code: "CS301",
    date: new Date(Date.now() + 18 * 86400000 + 4 * 3600000).toISOString(),
    location: "Main Exam Center"
  },
  {
    id: "ex-3",
    subject: "Machine Learning Midterm",
    code: "CS402",
    date: new Date(Date.now() + 24 * 86400000).toISOString(),
    location: "Online Portal"
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "First Test",
    description: "Completed your very first unit assessment test.",
    icon: "Award",
    unlocked: true,
    unlockedAt: "2025-09-01",
    progress: 100
  },
  {
    id: "ach-2",
    title: "7-Day Streak",
    description: "Studied consistently for 7 consecutive days.",
    icon: "Flame",
    unlocked: true,
    unlockedAt: "2025-09-17",
    progress: 100
  },
  {
    id: "ach-3",
    title: "10 Units Completed",
    description: "Successfully marked 10 curriculum units as finished.",
    icon: "BookOpenCheck",
    unlocked: false,
    progress: 60
  },
  {
    id: "ach-4",
    title: "Topic Master",
    description: "Elevated a weak topic above 85% accuracy on retest.",
    icon: "Brain",
    unlocked: true,
    unlockedAt: "2025-09-14",
    progress: 100
  },
  {
    id: "ach-5",
    title: "High Score",
    description: "Scored 90%+ in a comprehensive unit assessment.",
    icon: "Target",
    unlocked: true,
    unlockedAt: "2025-09-02",
    progress: 100
  },
  {
    id: "ach-6",
    title: "First PDF Analysis",
    description: "Extracted full study insights from a course textbook.",
    icon: "FileText",
    unlocked: true,
    unlockedAt: "2025-09-05",
    progress: 100
  },
  {
    id: "ach-7",
    title: "Consistent Learner",
    description: "Logged over 15 hours of focused Pomodoro study time.",
    icon: "Zap",
    unlocked: false,
    progress: 75
  }
];

export const initialFriends: Friend[] = [
  {
    id: "fr-1",
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "studying",
    currentActivity: "Revising Trees & Graphs",
    unreadCount: 1
  },
  {
    id: "fr-2",
    name: "Ananya Sen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    status: "online",
    currentActivity: "Taking DBMS Normalization Quiz",
    unreadCount: 0
  },
  {
    id: "fr-3",
    name: "Vikram Patel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "offline",
    currentActivity: "Last seen 2h ago",
    unreadCount: 0
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Weak Topic Alert",
    message: "Trees accuracy dropped to 45%. Recommended 30-min revision ready.",
    type: "weak" as any,
    timestamp: "10 mins ago",
    read: false
  },
  {
    id: "notif-2",
    title: "Exam Countdown",
    message: "DBMS Exam in 12 days. Focus on Unit 2 transactions today.",
    type: "exam",
    timestamp: "2 hours ago",
    read: false
  },
  {
    id: "notif-3",
    title: "Streak Milestone",
    message: "You're on a 7-day streak! Keep the flame burning 🔥",
    type: "streak",
    timestamp: "1 day ago",
    read: true
  }
];

export const funQuestionsBank = [
  {
    id: 1,
    question: "What is your ultimate late-night study comfort food?",
    options: ["Crispy Masala Dosa", "Hot Pepperoni Pizza", "Instant Ramen Noodles", "Chai / Coffee & Biscuits"],
    emoji: "🍕"
  },
  {
    id: 2,
    question: "When you finally take a break from books, what's your go-to pastime?",
    options: ["Competitive Gaming / Steam", "Binging Sci-Fi or Anime", "Listening to Lo-Fi / Playing Music", "Going for a run or gym"],
    emoji: "🎮"
  },
  {
    id: 3,
    question: "What is your secret study superpower?",
    options: ["Superhuman Last-Minute Focus", "Neat color-coded visual notes", "Explaining concepts to friends", "Coffee-fueled marathon sessions"],
    emoji: "⚡"
  },
  {
    id: 4,
    question: "If your study brain had a mascot, what would it be?",
    options: ["A wise owl with spectacles", "An energetic caffeinated squirrel", "A chill meditating panda", "A lightning-fast cheetah"],
    emoji: "🦉"
  }
];
