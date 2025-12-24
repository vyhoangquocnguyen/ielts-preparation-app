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
  timeSpent: z.number().int().positive(),
});
export const submitWritingSchema = z.object({
  exerciseId: z.string().min(1),
  answers: z.array(writingAnswerSchema).min(1),
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

export type SubmitListeningInput = z.infer<typeof submitListeningSchema>;
export type SubmitReadingInput = z.infer<typeof submitReadingSchema>;
export type SubmitWritingInput = z.infer<typeof submitWritingSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
