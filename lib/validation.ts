import { z } from "zod";

export const StudyGoalSchema = z.enum(["academic", "general"]);

export const updateUserProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters long")
    .max(50, "First name must be at most 50 characters long")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .max(50, "Last name must be at most 50 characters long")
    .optional(),
  targetScore: z.number().min(5, "Target score must be at least 5").max(9, "Target score must be at most 9").optional(),
  studyGoal: StudyGoalSchema.optional(),
  timeZone: z.string().optional(),
});

// Reading
export const readingAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answer: z.string().min(1, "Answer is required"),
});

export const submitReadingSchema = z.object({
  exerciseId: z.string().min(1, "Exercise ID is required"),
  answers: z.array(readingAnswerSchema).min(1, "At least one answer is required"),
  timeSpent: z.number().int().positive(),
});

// Writing
export const writingAnswerSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  content: z.string().min(100, "Response must be at least 100 characters long"),
  wordCount: z.number().int().positive(),
  timeSpent: z.number().int().positive(),
});
export const submitWritingSchema = z.object({
  taskId: z.string().min(1),
  content: z.string().min(100, "Response must be at least 100 characters long"),
  wordCount: z.number().int().positive(),
  timeSpent: z.number().int().positive(),
});

// Listening
export const listeningAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answer: z.string().min(1, "Answer is required"),
});
export const submitListeningSchema = z.object({
  exerciseId: z.string().min(1, "Exercise ID is required"),
  answers: z.array(listeningAnswerSchema).min(1, "At least one answer is required"),
  timeSpent: z.number().int().positive(),
});

// Speaking
export const submitSpeakingSchema = z.object({
  exerciseId: z.string().min(1, "Exercise ID is required"),
  audioBlob: z.string().min(1, "Audio data is required"),
  duration: z.number().int().positive(),
});

// AI feedback
export const CriteriaFeedbackSchema = z.object({
  score: z.number().min(0).max(9),
  comments: z.string().min(1, "Comments are required"),
  suggestions: z.array(z.string()).optional(),
  errors: z.array(z.string()).optional(),
  issues: z.array(z.string()).optional(),
});
export const speakingAIFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(9),
  fluencyCoherence: CriteriaFeedbackSchema,
  lexicalResource: CriteriaFeedbackSchema,
  grammaticalAccuracy: CriteriaFeedbackSchema,
  pronunciation: CriteriaFeedbackSchema,
  improvements: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
});
export const writingAIFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(9),
  taskAchievement: CriteriaFeedbackSchema,
  coherenceCohesion: CriteriaFeedbackSchema,
  lexicalResource: CriteriaFeedbackSchema,
  grammaticalAccuracy: CriteriaFeedbackSchema,
  improvements: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  rewrittenSample: z.string().optional(),
});

export type SpeakingAIFeedbackInput = z.infer<typeof speakingAIFeedbackSchema>;
export type WritingAIFeedbackInput = z.infer<typeof writingAIFeedbackSchema>;
export type SubmitListeningInput = z.infer<typeof submitListeningSchema>;
export type SubmitReadingInput = z.infer<typeof submitReadingSchema>;
export type SubmitWritingInput = z.infer<typeof submitWritingSchema>;
export type SubmitSpeakingInput = z.infer<typeof submitSpeakingSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
