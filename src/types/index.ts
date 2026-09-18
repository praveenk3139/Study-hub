export type TopicStatus = 'Weak' | 'Needs Practice' | 'Strong' | 'Info';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  progress: number;
  units: Unit[];
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  progress: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  completed: boolean;
  accuracy: number;
  attempts: number;
  lastTested: string;
  improvement: string;
  status: TopicStatus;
  notes?: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation: string;
  topic: string;
  marks: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface TestAttemptQuestionResult {
  questionId: number;
  question?: string;
  questionText?: string;
  studentAnswer?: string | number;
  userAnswerIndex?: number;
  options?: string[];
  correctAnswer?: string | number;
  correctIndex?: number;
  isCorrect: boolean;
  explanation: string;
  topic?: string;
}

export interface TestAttempt {
  id: string;
  testTitle: string;
  subject: string;
  unit: string;
  topic?: string;
  date: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  questionsCount: number;
  correctAnswersCount: number;
  questionResults: TestAttemptQuestionResult[];
}

export interface StudyTask {
  id: string;
  title: string;
  duration: number; // minutes
  subject: string;
  type: 'revision' | 'practice' | 'test' | 'notes';
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  timeSlot?: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  subject: string;
  topic: string;
  front: string;
  back: string;
  category: string;
  known?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'studying';
  currentActivity?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  participantsCount: number;
  activeTimer: string;
  isFocusActive: boolean;
  maxParticipants: number;
}

export interface Exam {
  id: string;
  subject: string;
  code: string;
  date: string; // ISO date string
  location?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'study' | 'revision' | 'test' | 'exam' | 'streak' | 'achievement';
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  avatar: string;
  university?: string;
  semester?: string;
  streakDays: number;
  dailyTargetMinutes: number;
  focusDuration: number;
  aiPerformanceScore: number;
  examReadinessScore: number;
  theme: 'light' | 'dark';
}
