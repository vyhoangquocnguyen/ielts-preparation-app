"use server";

import prisma from "@/lib/prisma";
import {
  calculateBandScore,
  calculateIncrementalAverage,
  calculateNewStreak,
  getMonthTimeValues,
} from "../utils";
import { revalidatePath } from "next/cache";
import { submitReadingSchema, SubmitReadingInput } from "../validation";
import { ZodError } from "zod";
import { getAuthenticatedId } from "./auth";

/**
 * Get all reading exercises with optional filtering
 * @param filter - Optional filters for difficulty and category
 * @returns Success response with exercises array or error
 */
export async function getReadingExercises(filter?: { difficulty?: string; category?: string }) {
  try {
    // 1. Authenticate user
    await getAuthenticatedId();

    // 2. Validate filters
    const validations = {
      difficulty: ["easy", "medium", "hard"],
      category: ["academic", "general"],
    } as const;

    for (const [key, validOptions] of Object.entries(validations)) {
      const value = filter?.[key as keyof typeof filter];
      if (value && !(validOptions as readonly string[]).includes(value)) {
        throw new Error(`Invalid ${key}`);
      }
    }
    // 3. Build database query
    const where = {
      isPublished: true,
      ...(filter?.difficulty !== undefined && { difficulty: filter.difficulty }),
      ...(filter?.category !== undefined && { category: filter.category }),
    };

    // 4. Fetch exercises
    const exercises = await prisma.readingExercise.findMany({
      where,
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
    return { success: true, data: exercises };
  } catch (error) {
    console.error("Error fetching reading exercises:", error);
    return { success: false, error: "Failed to fetch reading exercises" };
  }
}

/**
 * Get a single reading exercise by ID
 * @param exerciseId - Exercise ID
 * @returns Success response with exercise and questions data, or error
 */
export async function getReadingExerciseById(exerciseId: string) {
  try {
    // 1. Authenticate user
    await getAuthenticatedId();

    // 2. Validate exercise ID
    if (!exerciseId || typeof exerciseId !== "string") {
      throw new Error("Invalid exercise ID");
    }

    // 3. Fetch exercise
    const exercise = await prisma.readingExercise.findUnique({
      where: {
        id: exerciseId,
      },
      include: {
        questions: {
          orderBy: {
            questionNumber: "asc",
          },
        },
      },
    });
    // 4. Handle not found
    if (!exercise) {
      throw new Error("Exercise not found");
    }
    return { success: true, data: exercise };
  } catch (error) {
    console.error("Error fetching reading exercise:", error);
    return { success: false, error: "Failed to fetch reading exercise" };
  }
}

/**
 * Submit and score a reading exercise attempt
 * @param data - Reading submission data including answers and time spent
 * @returns Success response with attempt ID or error
 */
export async function submitReadingAnswers(data: SubmitReadingInput) {
  try {
    // 1. Authenticate user
    const dbUserId = await getAuthenticatedId();
    if (!dbUserId) throw new Error("User Database ID not found");

    // 2. Validate input data
    let validatedData: SubmitReadingInput;
    try {
      validatedData = submitReadingSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(", ");
        throw new Error(`Validation failed: ${errorMessage}`);
      }
      throw new Error("Validation failed");
    }
    // 3. Fetch exercise
    const exercise = await prisma.readingExercise.findUnique({
      where: { id: validatedData.exerciseId },
      include: {
        questions: true,
      },
    });
    if (!exercise) throw new Error("Exercise not found");
    // 4. Question integrity check
    if (validatedData.answers.length !== exercise.questions.length) {
      throw new Error(`Expected ${exercise.questions.length} answers, but received ${validatedData.answers.length}`);
    }
    const validQuestionIds = new Set(exercise.questions.map((q) => q.id));
    for (const answer of validatedData.answers) {
      if (!validQuestionIds.has(answer.questionId)) {
        throw new Error(`Invalid question ID: ${answer.questionId}`);
      }
    }

    // 5. Convert to Record format
    const answersRecord: Record<string, string> = {};
    validatedData.answers.forEach((a) => {
      answersRecord[a.questionId] = a.answer;
    });
    // 6. Check answers
    let correctCount = 0;
    const totalQuestions = exercise.questions.length;

    exercise.questions.forEach((question) => {
      const userAnswer = answersRecord[question.id]?.trim().toLowerCase();
      const correctAnswer = question.correctAnswer?.trim().toLowerCase();
      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    // 7. Calculate band score
    const bandScore = calculateBandScore(correctCount, totalQuestions);

    // 8. Save to database with transaction to ensure atomicity
    const attemptId = await prisma.$transaction(async (tx) => {
      // Fetch user with row lock to prevent race conditions
      const [user] = await tx.$queryRaw<
        {
          id: string;
          currentStreak: number | null;
          lastStudyDate: Date | null;
          longestStreak: number | null;
          readingAvg: number;
          readingDone: number;
        }[]
      >`SELECT id, "currentStreak", "lastStudyDate", "longestStreak", "readingAvg", "readingDone" FROM "User" WHERE id = ${dbUserId} FOR UPDATE`;

      if (!user) throw new Error("User not found");

      // Calculate time-based values inside transaction
      const now = new Date();
      const { month, year, startOfMonth, endOfMonth } = getMonthTimeValues(now);
      const newStreak = calculateNewStreak(user.currentStreak || 0, user.lastStudyDate);

      // 8a. Calculate new overall average incrementally
      const newReadingDone = user.readingDone + 1;
      const newReadingAvg = calculateIncrementalAverage(user.readingAvg, bandScore, newReadingDone);

      // Create the attempt
      const attempt = await tx.readingAttempt.create({
        data: {
          userId: dbUserId,
          exerciseId: exercise.id,
          answers: answersRecord,
          score: bandScore,
          correctCount,
          totalQuestions,
          timeSpent: validatedData.timeSpent,
          completed: true,
        },
      });

      // Recalculate monthly average for Reading within transaction
      const monthlyStats = await tx.readingAttempt.aggregate({
        where: {
          userId: dbUserId,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _avg: { score: true },
      });

      const monthlyAverage = monthlyStats._avg.score || bandScore;

      // Update Analytics
      await tx.userAnalytics.upsert({
        where: {
          userId_month_year: { userId: dbUserId, month, year },
        },
        update: {
          exercisesDone: { increment: 1 },
          totalStudyTime: { increment: Math.round(validatedData.timeSpent / 60) },
          readingAvg: monthlyAverage,
        },
        create: {
          userId: dbUserId,
          month,
          year,
          readingAvg: monthlyAverage,
          exercisesDone: 1,
          totalStudyTime: Math.round(validatedData.timeSpent / 60),
        },
      });

      // Update User Streak & Stats (including denormalized averages)
      await tx.user.update({
        where: { id: dbUserId },
        data: {
          lastStudyDate: now,
          totalStudyTime: {
            increment: Math.round(validatedData.timeSpent / 60),
          },
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak || 0),
          readingAvg: newReadingAvg,
          readingDone: newReadingDone,
        },
      });

      return attempt.id;
    });

    // 9. Revalidate & return
    revalidatePath("/dashboard");
    return { success: true, data: attemptId };
  } catch (error) {
    console.error("Error in submitReadingAnswers:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to submit answers" };
  }
}

/**
 * Get reading attempt for review
 * @param attemptId - Reading attempt ID
 * @returns Success response with attempt, exercise, and questions data, or error
 */
export async function getReadingAttempt(attemptId: string) {
  try {
    // 1. Authenticate user
    const dbUserId = await getAuthenticatedId();
    if (!dbUserId) return { success: false, error: "User Database ID not found" };

    // 2. Validate attempt ID
    if (!attemptId || typeof attemptId !== "string") return { success: false, error: "Invalid attempt ID" };

    // 3. Fetch attempt
    const attempt = await prisma.readingAttempt.findFirst({
      where: {
        id: attemptId,
        userId: dbUserId,
      },
      include: {
        exercise: {
          include: {
            questions: {
              orderBy: {
                questionNumber: "asc",
              },
            },
          },
        },
      },
    });

    // 4. Handle not found
    if (!attempt) return { success: false, error: "Attempt not found" };
    if (!attempt.exercise) return { success: false, error: "Associated exercise not found" };

    return { success: true, data: attempt };
  } catch (error) {
    console.error("Error fetching reading attempt:", error);
    return { success: false, error: "Failed to fetch attempt" };
  }
}
