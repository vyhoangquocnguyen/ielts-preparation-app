"use server";

import prisma from "@/lib/prisma";
import { SubmitSpeakingInput, submitSpeakingSchema } from "../validation";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { generateSpeakingAIFeedback } from "../geminiAi";
import { calculateNewStreak, getMonthTimeValues } from "../utils";
import { getAuthenticatedId } from "./auth";

/**
 * Get all speaking exercises with optional filtering
 * @param filter - Optional filter by part (part1, part2, part3)
 * @returns Success response with exercises array or error
 */
export async function getSpeakingExercises(filter?: { part?: string }) {
  try {
    // 1. Authenticate user
    await getAuthenticatedId();

    // 2. Validate filters
    const validations = {
      part: ["part1", "part2", "part3"],
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
      ...(filter?.part !== undefined && { part: filter.part }),
    };

    // 4. Fetch exercises
    const exercises = await prisma.speakingExercise.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        part: true,
        topic: true,
        cueCard: true,
        prepTime: true,
        speakingTime: true,
        questions: true,
        isPublished: true,
        order: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return { success: true, data: exercises };
  } catch (error) {
    console.error("Error fetching speaking exercises:", error);
    return { success: false, error: "Failed to fetch speaking exercises" };
  }
}

/**
 * Get a single speaking exercise by ID
 * @param id - Exercise ID
 * @returns Success response with exercise data or error
 */
export async function getSpeakingExerciseById(id: string) {
  try {
    // 1. Authenticate user
    await getAuthenticatedId();

    // 2. Validate exercise ID
    if (!id || typeof id !== "string") {
      throw new Error("Invalid exercise ID");
    }

    // 3. Fetch exercise
    const exercise = await prisma.speakingExercise.findUnique({
      where: {
        id: id,
      },
    });

    // 4. Handle not found
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    // 5. Return exercise
    return { success: true, data: exercise };
  } catch (error) {
    console.error("Error fetching speaking exercise:", error);
    return { success: false, error: "Failed to fetch speaking exercise" };
  }
}

/**
 * Submit a speaking exercise attempt with audio recording
 * @param data - Speaking submission data including audio blob and exercise ID
 * @returns Success response with attempt ID and score, or error
 */
export async function submitSpeakingExercise(data: SubmitSpeakingInput): Promise<{
  success: boolean;
  data: {
    error?: string;
    attemptId?: string;
    score?: number;
  };
}> {
  // 1. Validate Input
  const validation = submitSpeakingSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, data: { error: "Invalid input data" } };
  }
  // Validate audio blob format
  const parsed = validation.data;
  const [meta, base64Data] = parsed.audioBlob.split(",", 2);
  if (!base64Data || !meta.startsWith("data:audio/")) {
    return { success: false, data: { error: "Invalid audio data format" } };
  }

  // 2. Validate exercise ID
  if (!data.exerciseId || typeof data.exerciseId !== "string") {
    throw new Error("Invalid exercise ID");
  }

  // 3. Parallelize authentication and exercise fetching (independent operations)
  const [dbUserId, exercise] = await Promise.all([
    getAuthenticatedId(),
    prisma.speakingExercise.findUnique({
      where: {
        id: data.exerciseId,
      },
    }),
  ]);

  // 4. Validate results
  if (!dbUserId) {
    throw new Error("User Database ID not found");
  }
  if (!exercise) {
    return { success: false, data: { error: "Exercise not found" } };
  }
  /*** PROCESS AUDIO ***/
  // 1. extract base64 data - already done above
  // const base64Data = data.audioBlob.split(",")[1];
  // 2. convert base64 to buffer
  const buffer = Buffer.from(base64Data, "base64");

  // 3. Upload audio to storage
  const filename = `speaking/${dbUserId}/${Date.now()}.webm`;
  const blob = await put(filename, buffer, {
    access: "public",
    contentType: "audio/webm",
  });

  console.log("Audio uploaded to storage:", blob.url);

  /** base64 -> GenerateAI feedback, no need for transcript**/
  /*** GENERATE AI FEEDBACK ***/
  const feedback = await generateSpeakingAIFeedback(
    exercise.part,
    exercise.questions as string[],
    base64Data,
    data.duration,
  );

  /*** SAVE TO DB WITH TRANSACTION ***/
  const attemptId = await prisma.$transaction(async (tx) => {
    // Fetch user with row lock to prevent race conditions
    const user = await tx.user.findUnique({
      where: { id: dbUserId },
      select: { id: true, currentStreak: true, lastStudyDate: true, longestStreak: true },
    });
    if (!user) throw new Error("User not found");

    // Calculate time-based values inside transaction
    const now = new Date();
    const { month, year, startOfMonth, endOfMonth } = getMonthTimeValues(now);
    const newStreak = calculateNewStreak(user.currentStreak || 0, user.lastStudyDate);

    // Create the attempt
    const attempt = await tx.speakingAttempt.create({
      data: {
        userId: dbUserId,
        exerciseId: exercise.id,
        audioUrl: blob.url,
        overallScore: feedback.overallScore,
        feedback: feedback,
        completed: true,
        audioDuration: data.duration,
      },
    });

    // Recalculate monthly average for Speaking within transaction
    const monthlyStats = await tx.speakingAttempt.aggregate({
      where: {
        userId: dbUserId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _avg: { overallScore: true },
      _count: { id: true },
    });
    const realAverage = monthlyStats._avg.overallScore || feedback.overallScore;

    // Update Analytics
    await tx.userAnalytics.upsert({
      where: {
        userId_month_year: {
          userId: dbUserId,
          month,
          year,
        },
      },
      update: {
        exercisesDone: { increment: 1 },
        totalStudyTime: { increment: Math.round(data.duration / 60) },
        speakingAvg: realAverage,
      },
      create: {
        userId: dbUserId,
        month,
        year,
        speakingAvg: realAverage,
        exercisesDone: 1,
        totalStudyTime: Math.round(data.duration / 60),
      },
    });

    // Update User Streak & Stats
    await tx.user.update({
      where: { id: dbUserId },
      data: {
        totalStudyTime: {
          increment: Math.round(data.duration / 60),
        },
        lastStudyDate: now,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak || 0),
      },
    });

    return attempt.id;
  });
  /*** REVALIDATE CACHE ***/
  revalidatePath("/speaking");
  revalidatePath("/dashboard");

  // 5. Return result
  return {
    success: true,
    data: {
      attemptId: attemptId,
      score: feedback.overallScore,
    },
  };
}

/**
 * Get speaking attempt feedback for display
 * @param attemptId - Speaking attempt ID
 * @returns Success response with attempt and feedback data, or error
 */
export async function getSpeakingFeedback(attemptId: string) {
  try {
    const dbUserId = await getAuthenticatedId();
    if (!dbUserId) {
      return { success: false, error: "User Database ID not found" };
    }
    const attempt = await prisma.speakingAttempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        exercise: true,
      },
    });
    if (!attempt) {
      return { success: false, error: "Attempt not found" };
    }
    if (attempt.userId !== dbUserId) {
      return { success: false, error: "Unauthorized" };
    }
    return { success: true, data: attempt };
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return { success: false, error: "Internal server error, failed to fetch attempt" };
  }
}
