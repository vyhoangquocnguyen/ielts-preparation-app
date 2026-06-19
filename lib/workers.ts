import prisma from "./prisma";
import { generateSpeakingAIFeedback, generateWritingAIFeedback } from "./geminiAi";
import { calculateIncrementalAverage, calculateNewStreak, getMonthTimeValues } from "./utils";
import { revalidatePath } from "next/cache";

/**
 * Worker to process writing feedback in the background
 */
export async function processWritingFeedback(attemptId: string) {
  try {
    // 1. Fetch attempt and task details
    const attempt = await prisma.writingAttempt.findUnique({
      where: { id: attemptId },
      include: { task: true },
    });

    if (!attempt) return;

    // 2. Generate AI feedback (Heavy Compute)
    const feedback = await generateWritingAIFeedback(
      attempt.task.taskType,
      attempt.task.prompt,
      attempt.wordCount,
      attempt.content,
    );

    // 3. Update database within transaction
    await prisma.$transaction(async (tx) => {
      // Row lock user for streak/analytics update
      const [user] = await tx.$queryRaw<
        {
          id: string;
          currentStreak: number | null;
          lastStudyDate: Date | null;
          longestStreak: number | null;
          writingAvg: number;
          writingDone: number;
        }[]
      >`SELECT id, "currentStreak", "lastStudyDate", "longestStreak", "writingAvg", "writingDone" FROM "User" WHERE id = ${attempt.userId} FOR UPDATE`;

      if (!user) throw new Error("User not found");

      const now = new Date();
      const { month, year, startOfMonth, endOfMonth } = getMonthTimeValues(now);
      const newStreak = calculateNewStreak(user.currentStreak || 0, user.lastStudyDate);

      // 3a. Calculate new overall average incrementally
      const newWritingDone = user.writingDone + 1;
      const newWritingAvg = calculateIncrementalAverage(user.writingAvg, feedback.overallScore, newWritingDone);

      // Update attempt
      await tx.writingAttempt.update({
        where: { id: attemptId },
        data: {
          overallScore: feedback.overallScore,
          feedback: feedback,
          completed: true,
        },
      });

      // Update Analytics
      const monthlyStats = await tx.writingAttempt.aggregate({
        where: {
          userId: attempt.userId,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          completed: true, // Only count completed ones for average
        },
        _avg: { overallScore: true },
        _count: { id: true },
      });
      const monthlyAverage = monthlyStats._avg.overallScore || feedback.overallScore;

      await tx.userAnalytics.upsert({
        where: {
          userId_month_year: {
            userId: attempt.userId,
            month,
            year,
          },
        },
        update: {
          exercisesDone: { increment: 1 },
          totalStudyTime: { increment: Math.round(attempt.timeSpent / 60) },
          writingAvg: monthlyAverage,
        },
        create: {
          userId: attempt.userId,
          month,
          year,
          writingAvg: monthlyAverage,
          exercisesDone: 1,
          totalStudyTime: Math.round(attempt.timeSpent / 60),
        },
      });

      // Update User Streak & Stats (including denormalized averages)
      await tx.user.update({
        where: { id: attempt.userId },
        data: {
          totalStudyTime: {
            increment: Math.round(attempt.timeSpent / 60),
          },
          lastStudyDate: now,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak || 0),
          writingAvg: newWritingAvg,
          writingDone: newWritingDone,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/writing");
  } catch (error) {
    console.error("Worker Error (Writing):", error);
  }
}

/**
 * Worker to process speaking feedback in the background
 */
export async function processSpeakingFeedback(attemptId: string, base64Audio: string) {
  try {
    // 1. Fetch attempt and exercise details
    const attempt = await prisma.speakingAttempt.findUnique({
      where: { id: attemptId },
      include: { exercise: true },
    });

    if (!attempt) return;

    // 2. Generate AI feedback (Heavy Compute)
    const questions =
      attempt.exercise.part === "part2" ? [attempt.exercise.topic || ""] : (attempt.exercise.questions as string[]);
    const feedback = await generateSpeakingAIFeedback(
      attempt.exercise.part,
      questions,
      base64Audio,
      attempt.audioDuration,
    );

    // 3. Update database within transaction
    await prisma.$transaction(async (tx) => {
      // Row lock user
      const [user] = await tx.$queryRaw<
        {
          id: string;
          currentStreak: number | null;
          lastStudyDate: Date | null;
          longestStreak: number | null;
          speakingAvg: number;
          speakingDone: number;
        }[]
      >`SELECT id, "currentStreak", "lastStudyDate", "longestStreak", "speakingAvg", "speakingDone" FROM "User" WHERE id = ${attempt.userId} FOR UPDATE`;

      if (!user) throw new Error("User not found");

      const now = new Date();
      const { month, year, startOfMonth, endOfMonth } = getMonthTimeValues(now);
      const newStreak = calculateNewStreak(user.currentStreak || 0, user.lastStudyDate);

      // 3a. Calculate new overall average incrementally
      const newSpeakingDone = user.speakingDone + 1;
      const newSpeakingAvg = calculateIncrementalAverage(user.speakingAvg, feedback.overallScore, newSpeakingDone);

      // Update attempt
      await tx.speakingAttempt.update({
        where: { id: attemptId },
        data: {
          overallScore: feedback.overallScore,
          feedback: feedback,
          completed: true,
        },
      });

      // Update Analytics
      const monthlyStats = await tx.speakingAttempt.aggregate({
        where: {
          userId: attempt.userId,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          completed: true,
        },
        _avg: { overallScore: true },
      });
      const monthlyAverage = monthlyStats._avg.overallScore || feedback.overallScore;

      await tx.userAnalytics.upsert({
        where: {
          userId_month_year: {
            userId: attempt.userId,
            month,
            year,
          },
        },
        update: {
          exercisesDone: { increment: 1 },
          totalStudyTime: { increment: Math.ceil(attempt.audioDuration / 60) },
          speakingAvg: monthlyAverage,
        },
        create: {
          userId: attempt.userId,
          month,
          year,
          speakingAvg: monthlyAverage,
          exercisesDone: 1,
          totalStudyTime: Math.ceil(attempt.audioDuration / 60),
        },
      });

      // Update User Streak & Stats (including denormalized averages)
      await tx.user.update({
        where: { id: attempt.userId },
        data: {
          totalStudyTime: {
            increment: Math.ceil(attempt.audioDuration / 60),
          },
          lastStudyDate: now,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak || 0),
          speakingAvg: newSpeakingAvg,
          speakingDone: newSpeakingDone,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/speaking");
  } catch (error) {
    console.error("Worker Error (Speaking):", error);
  }
}
