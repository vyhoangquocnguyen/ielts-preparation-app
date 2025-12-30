import type { WritingTask, SpeakingExercise } from "@/app/generated/prisma/client";
import { CriteriaFeedbackSchema, speakingAIFeedbackSchema, writingAIFeedbackSchema } from "@/lib/validation";
import z from "zod";
import { Prisma } from "@/app/generated/prisma/client";

// --- ENUMS & BASE TYPES ---

export type ModuleType = "listening" | "reading" | "writing" | "speaking";
export type Difficulty = "easy" | "medium" | "hard";
export type StudyGoal = "academic" | "general";

// --- SHARED INTERFACES ---

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

// --- FEEDBACK INTERFACES ---

// export interface CriteriaFeedback {
//   score: number;
//   comments: string;
//   suggestions?: string[];
//   errors?: string[]; // Used for Grammatical Accuracy
//   issues?: string[]; // Used for Pronunciation
// }
export type CriteriaFeedback = z.infer<typeof CriteriaFeedbackSchema> & {
  [key: string]: Prisma.JsonValue | undefined;
};

// export interface WritingFeedbackDetailed {
//   overallScore: number;
//   taskAchievement: CriteriaFeedback;
//   coherenceCohesion: CriteriaFeedback;
//   lexicalResource: CriteriaFeedback;
//   grammaticalAccuracy: CriteriaFeedback;
//   improvements: string[];
//   strengths: string[];
//   rewrittenSample?: string;
// }
export type WritingFeedbackDetailed = z.infer<typeof writingAIFeedbackSchema> & {
  [key: string]: Prisma.JsonValue | undefined;
};

// export interface SpeakingFeedbackDetailed {
//   overallScore: number;
//   fluencyCoherence: CriteriaFeedback;
//   lexicalResource: CriteriaFeedback;
//   grammaticalAccuracy: CriteriaFeedback;
//   pronunciation: CriteriaFeedback;
//   improvements: string[];
//   strengths: string[];
// }
export type SpeakingFeedbackDetailed = z.infer<typeof speakingAIFeedbackSchema> & {
  [key: string]: Prisma.JsonValue | undefined;
};

// --- PRISMA-LINKED TYPES (EXTENDED) ---

export type ListeningExerciseWithQuestions = Prisma.ListeningExerciseGetPayload<{
  include: { questions: true };
}>;

export type ReadingExerciseWithQuestions = Prisma.ReadingExerciseGetPayload<{
  include: { questions: true };
}>;

export type ListeningAttemptWithExercise = Prisma.ListeningAttemptGetPayload<{
  include: { exercise: { include: { questions: true } } };
}>;

export type ReadingAttemptWithExercise = Prisma.ReadingAttemptGetPayload<{
  include: { exercise: { include: { questions: true } } };
}>;

export type WritingAttemptWithTask = Prisma.WritingAttemptGetPayload<{
  include: { task: true };
}>;

export type SpeakingAttemptWithExercise = Prisma.SpeakingAttemptGetPayload<{
  include: { exercise: true };
}>;

// UNION TYPES
export type AnyAttempt =
  | ListeningAttemptWithExercise
  | ReadingAttemptWithExercise
  | WritingAttemptWithTask
  | SpeakingAttemptWithExercise;

export interface BaseExercise {
  id: string;
  title: string;
  description?: string | null;
  difficulty?: string;
  category?: string;
  taskType?: string;
  part?: string;
  isPublished: boolean;
  order: number;
  wordCount?: number | null;
  minWords?: number | null;
  duration?: number | null;
  speakingTime?: number | null;
  _count?: {
    questions?: number;
    tasks?: number;
  };
}

export type AnyExercise = BaseExercise &
  (ListeningExerciseWithQuestions | ReadingExerciseWithQuestions | WritingTask | SpeakingExercise);

// --- DASHBOARD & ANALYTICS ---

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

// --- AUDIO TYPES ---

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

// Re-export Prisma types
export type {
  User,
  ListeningExercise,
  ListeningQuestion,
  ReadingExercise,
  ReadingQuestion,
  WritingTask,
  SpeakingExercise,
  ListeningAttempt,
  ReadingAttempt,
  WritingAttempt,
  SpeakingAttempt,
} from "@/app/generated/prisma/client";
