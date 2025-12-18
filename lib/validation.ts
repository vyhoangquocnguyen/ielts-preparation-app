import { z } from "zod";

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
  studyGoal: z.enum(["academic", "general"]).optional(),
  timeZone: z.string().optional(),
});

export const submitReadingSchema = z.object({
  exerciseId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
  timeSpent: z.number().int().positive(),
});

export type SubmitReadingInput = z.infer<typeof submitReadingSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
