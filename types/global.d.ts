import type {
  User as PrismaUser,
  ListeningExercise as PrismaListeningExercise,
  ListeningQuestion as PrismaListeningQuestion,
  ReadingExercise as PrismaReadingExercise,
  ReadingQuestion as PrismaReadingQuestion,
  WritingTask as PrismaWritingTask,
  SpeakingExercise as PrismaSpeakingExercise,
  ListeningAttempt as PrismaListeningAttempt,
  ReadingAttempt as PrismaReadingAttempt,
  WritingAttempt as PrismaWritingAttempt,
  SpeakingAttempt as PrismaSpeakingAttempt,
  Prisma,
} from "@prisma/client";
import { CriteriaFeedbackSchema, speakingAIFeedbackSchema, writingAIFeedbackSchema } from "@/lib/validation";
import { z } from "zod";

declare global {
  // --- ENUMS & BASE TYPES ---
  type ModuleType = "listening" | "reading" | "writing" | "speaking";
  type Difficulty = "easy" | "medium" | "hard";
  type StudyGoal = "academic" | "general";

  // --- SHARED INTERFACES ---
  interface AttemptAnswer {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
  }

  interface AttemptSummary {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    score: number; // band score
    percentage: number;
    timeSpent: number; // seconds
  }

  // --- FEEDBACK INTERFACES ---
  type CriteriaFeedback = z.infer<typeof CriteriaFeedbackSchema> & {
    [key: string]: Prisma.JsonValue | undefined;
  };

  type WritingFeedbackDetailed = z.infer<typeof writingAIFeedbackSchema> & {
    [key: string]: Prisma.JsonValue | undefined;
  };

  type SpeakingFeedbackDetailed = z.infer<typeof speakingAIFeedbackSchema> & {
    [key: string]: Prisma.JsonValue | undefined;
  };

  // --- PRISMA-LINKED TYPES (EXTENDED) ---
  type ListeningExerciseWithQuestions = Prisma.ListeningExerciseGetPayload<{
    include: { questions: true };
  }>;

  type ReadingExerciseWithQuestions = Prisma.ReadingExerciseGetPayload<{
    include: { questions: true };
  }>;

  type ListeningAttemptWithExercise = Prisma.ListeningAttemptGetPayload<{
    include: { exercise: { include: { questions: true } } };
  }>;

  type ReadingAttemptWithExercise = Prisma.ReadingAttemptGetPayload<{
    include: { exercise: { include: { questions: true } } };
  }>;

  type WritingAttemptWithTask = Prisma.WritingAttemptGetPayload<{
    include: { task: true };
  }>;

  type SpeakingAttemptWithExercise = Prisma.SpeakingAttemptGetPayload<{
    include: { exercise: true };
  }>;

  // UNION TYPES
  type AnyAttempt =
    | ListeningAttemptWithExercise
    | ReadingAttemptWithExercise
    | WritingAttemptWithTask
    | SpeakingAttemptWithExercise;

  interface BaseExercise {
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

  type AnyExercise = BaseExercise &
    (ListeningExerciseWithQuestions | ReadingExerciseWithQuestions | WritingTask | SpeakingExercise);

  // --- DASHBOARD & ANALYTICS ---
  interface DashboardStats {
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

  interface RecentActivity {
    id: string;
    moduleType: ModuleType;
    exerciseTitle: string;
    score: number;
    completedAt: Date;
  }

  interface MonthlyAnalytics {
    month: string; // "2024-01"
    listeningAvg: number;
    readingAvg: number;
    writingAvg: number;
    speakingAvg: number;
    exercisesCompleted: number;
    studyMinutes: number;
  }

  interface ProgressData {
    date: string;
    score: number;
    moduleType: ModuleType;
  }

  // --- AUDIO TYPES ---
  interface AudioWord {
    word: string;
    start: number;
    end: number;
    confidence: number;
  }

  interface TranscriptionData {
    transcript: string;
    words: AudioWord[];
    confidence: number;
    duration: number;
  }

  // Re-export Prisma types as global
  type User = PrismaUser;
  type ListeningExercise = PrismaListeningExercise;
  type ListeningQuestion = PrismaListeningQuestion;
  type ReadingExercise = PrismaReadingExercise;
  type ReadingQuestion = PrismaReadingQuestion;
  type WritingTask = PrismaWritingTask;
  type SpeakingExercise = PrismaSpeakingExercise;
  type ListeningAttempt = PrismaListeningAttempt;
  type ReadingAttempt = PrismaReadingAttempt;
  type WritingAttempt = PrismaWritingAttempt;
  type SpeakingAttempt = PrismaSpeakingAttempt;
  // --- CLERK ---
  interface CustomJwtSessionClaims {
    metadata: {
      plan?: "FREE" | "PRO" | "PREMIUM";
      role?: "STUDENT" | "TEACHER" | "ADMIN";
      dbUserId?: string;
    };
  }
}

declare module "@clerk/types" {
  interface SessionClaims {
    metadata: {
      plan?: "FREE" | "PRO" | "PREMIUM";
      role?: "STUDENT" | "TEACHER" | "ADMIN";
      dbUserId?: string;
    };
  }
}
