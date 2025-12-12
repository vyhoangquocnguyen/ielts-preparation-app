import {
  User,
  ListeningExercise,
  ListeningQuestion,
  ReadingExercise,
  ReadingQuestion,
  WritingTask,
  SpeakingExercise,
} from "@/app/generated/prisma/client";

// MODULE TYPES
export type ModuleType = "listening" | "reading" | "writing" | "speaking";

export type Difficulty = "easy" | "medium" | "hard";

export type StudyGoal = "academic" | "general";

// EXTENDED TYPES (with relations)
export type ListeningExerciseWithQuestions = ListeningExercise & {
  questions: ListeningQuestion[];
};

export type ReadingExerciseWithQuestions = ReadingExercise & {
  questions: ReadingQuestion[];
};

// DASHBOARD TYPE
export interface DashboardStats {
  totalStudyTime: number; // minutes
  currentStreak: number;
  longestStreak: number;
  exercisesCompleted: number;
  averageScores: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
}

export interface RecentActivity {
  id: string;
  moduleType: ModuleType;
  exerciseTitle: string;
  score: number;
  completedAt: Date;
}

// ATTEMPT TYPE
export interface AttemptAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface AttemptSummary {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // band score
  percentage: number;
  timeSpent: number; // seconds
}

// FEEDBACKS TYPE

export interface CriteriaFeedback {
  score: number;
  comments: string;
  suggestions?: string[];
  error?: string[];
}

export interface WritingFeedbackDetailed {
  overallScore: number;
  taskAchievement: CriteriaFeedback;
  coherenceCohesion: CriteriaFeedback;
  lexicalResource: CriteriaFeedback;
  grammaticalAccuracy: CriteriaFeedback;
  improvements: string[];
  rewrittenSample: string;
}

export interface SpeakingFeedbackDetailed {
  overallScore: number;
  fluencyCoherence: CriteriaFeedback;
  lexicalResource: CriteriaFeedback;
  grammaticalAccuracy: CriteriaFeedback;
  pronunciation: CriteriaFeedback;
  improvements: string[];
}

// ANALYTICS TYPES
export interface MonthlyAnalytics {
  month: string; // "2024-01"
  listeningAvg: number;
  readingAvg: number;
  writingAvg: number;
  speakingAvg: number;
  exercisesCompleted: number;
  studyMinutes: number;
}

export interface ProgressData {
  date: string;
  score: number;
  moduleType: ModuleType;
}

// AUDIO TYPES
export interface AudioWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptionData {
  transcript: string;
  words: AudioWord[];
  confidence: number;
  duration: number;
}

// API RESPONSE TYPES
