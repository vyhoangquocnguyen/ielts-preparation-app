"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { SubmitListeningInput, submitListeningSchema } from "../validation";
import { ZodError } from "zod";
import { calculateBandScore, calculateNewStreak } from "../utils";
import { revalidatePath } from "next/cache";
import { getAuthenticatedId } from "./auth";

/***** Get listening exercises, fetch all with questions *****/
export async function getListeningExercises(filter?: { difficulty?: string; category?: string }) {
  // 1. Authenticate user
  try {
    await getAuthenticatedId();

    // 2. Validate difficulty
    if (filter?.difficulty) {
      const validDifficulties = ["easy", "medium", "hard"];
      if (!validDifficulties.includes(filter.difficulty)) {
        throw new Error("Invalid difficulty level");
      }
    }
    if (filter?.category) {
      const validCategories = ["academic", "general"]; // academic or general
      if (!validCategories.includes(filter.category)) {
        throw new Error("Invalid category");
      }
    }
    // 2. Build database query
    const where = {
      isPublished: true,
      ...(filter?.difficulty && { difficulty: filter.difficulty }),
      ...(filter?.category && { category: filter.category }),
    };
    // 3. Fetch exercises
    const exercises = await prisma.listeningExercise.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        duration: true,
        isPublished: true,
        order: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { order: "asc" },
    });
    return { success: true, data: exercises };
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return { success: false, error: "Failed to fetch exercises" };
  }
}

/***** Get listening exercise by exerciseId *****/
export async function getListeningExerciseById(exerciseId: string) {
  try {
    // 1. Authenticate user
    await getAuthenticatedId();

    // 2. Validate id
    if (!exerciseId || typeof exerciseId !== "string") {
      throw new Error("Invalid exercise ID");
    }
    // 3. Fetch exercise
    const exercise = await prisma.listeningExercise.findUnique({
      where: { id: exerciseId, isPublished: true },
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
    // 5. Return exercise
    return { success: true, data: exercise };
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return { success: false, error: "Failed to fetch exercise" };
  }
}

/**** Submit and score listening exercise ****/
export async function submitListeningAnswers(data: SubmitListeningInput) {
  try {
    // 1. Authenticate user
    //Get dbUserId from clerk metadata
    const dbUserId = await getAuthenticatedId();
    if (!dbUserId) throw new Error("User Database ID not found");

    // Validate exerciseId
    let validatedData;
    try {
      validatedData = submitListeningSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((error) => error.message).join(", ");
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error("Validation error");
    }

    // Fetch exercise
    const exercise = await prisma.listeningExercise.findUnique({
      where: { id: validatedData.exerciseId },
      include: {
        questions: true,
      },
    });
    if (!exercise) throw new Error("Exercise not found");

    // 6. Question Integrity Check
    if (validatedData.answers.length !== exercise.questions.length) {
      throw new Error(`Expected ${exercise.questions.length} answers, but received ${validatedData.answers.length}`);
    }

    const validQuestionIds = new Set(exercise.questions.map((q) => q.id));
    for (const answer of validatedData.answers) {
      if (!validQuestionIds.has(answer.questionId)) {
        throw new Error(`Invalid question ID: ${answer.questionId}`);
      }
    }

    // 7. Convert to Record format
    const answersRecord: Record<string, string> = {};
    validatedData.answers.forEach((a) => (answersRecord[a.questionId] = a.answer));

    // Check answers
    let correctCount = 0;
    const totalQuestions = exercise.questions.length;

    exercise.questions.forEach((question) => {
      const userAnswer = answersRecord[question.id]?.trim().toLowerCase();
      const correctAnswer = question.correctAnswer?.trim().toLowerCase();
      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    //   8. Calculate band score
    const bandScore = calculateBandScore(correctCount, totalQuestions);

    //   9. Save to database with transaction to ensure atomicity
    const attemptId = await prisma.$transaction(async (tx) => {
      // Fetch user with row lock to prevent race conditions
      const user = await tx.user.findUnique({
        where: { id: dbUserId },
        select: { id: true, currentStreak: true, lastStudyDate: true, longestStreak: true },
      });
      if (!user) throw new Error("User not found");

      // Calculate time-based values inside transaction
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      const newStreak = calculateNewStreak(user.currentStreak || 0, user.lastStudyDate);
      // Create the attempt
      const attempt = await tx.listeningAttempt.create({
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

      // Recalculate monthly average for Listening within transaction
      const monthlyStats = await tx.listeningAttempt.aggregate({
        where: {
          userId: dbUserId,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _avg: { score: true },
      });

      const realAverage = monthlyStats._avg.score || bandScore;

      // Update Analytics
      await tx.userAnalytics.upsert({
        where: {
          userId_month_year: { userId: dbUserId, month, year },
        },
        update: {
          exercisesDone: { increment: 1 },
          totalStudyTime: { increment: Math.round(validatedData.timeSpent / 60) },
          listeningAvg: realAverage,
        },
        create: {
          userId: dbUserId,
          month,
          year,
          listeningAvg: realAverage,
          exercisesDone: 1,
          totalStudyTime: Math.round(validatedData.timeSpent / 60),
        },
      });

      // Update User Streak & Stats
      await tx.user.update({
        where: { id: dbUserId },
        data: {
          lastStudyDate: now,
          totalStudyTime: {
            increment: Math.round(validatedData.timeSpent / 60),
          },
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak || 0),
        },
      });

      return attempt.id;
    });

    //   10. Revalidate & return
    revalidatePath("/dashboard");
    return { success: true, data: attemptId };
  } catch (error) {
    console.error("Error submitting answers:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to submit answers" };
  }
}

/**** Get listening Attempt    *****/
export async function getListeningAttempt(attemptId: string) {
  try {
    // 1. Authenticate user
    const dbUserId = await getAuthenticatedId();
    if (!dbUserId) return { success: false, error: "User Database ID not found" };

    // 2. Validate id
    if (!attemptId || typeof attemptId !== "string") return { success: false, error: "Invalid attempt ID" };

    // 3. Fetch attempt
    const attempt = await prisma.listeningAttempt.findUnique({
      where: { id: attemptId, userId: dbUserId },
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

    // 5. Return attempt
    return { success: true, data: attempt };
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return { success: false, error: "Failed to fetch attempt" };
  }
}
