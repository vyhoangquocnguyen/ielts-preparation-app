"use server";

import prisma from "@/lib/prisma";
import { calculateNewStreak } from "../utils";
import { revalidatePath } from "next/cache";
import { updateUserProfileSchema } from "../validation";
import { getAuthenticatedId } from "./auth";


// Get current user from database
export async function getCurrentUser() {
  const dbUserId = await getAuthenticatedId();
  const user = await prisma.user.findUnique({
    where: {
      id: dbUserId,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Update streak if needed
  const newStreak = calculateNewStreak(user.currentStreak || 0, user.lastStudyDate);

  if (newStreak !== user.currentStreak) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak: newStreak,
        lastStudyDate: new Date(),
      },
    });
    return updatedUser;
  }

  return user;
}

// Get dashboard statistics for a user
export async function getDashboardStatistics() {
  const dbUserId = await getAuthenticatedId();
  // Get counts of completed exercise per module
  // Get counts and averages in parallel using the indexed dbUserId
  const [
    listeningCount,
    readingCount,
    writingCount,
    speakingCount,
    listeningAve,
    readingAve,
    writingAve,
    speakingAve,
    user,
  ] = await Promise.all([
    // Counts
    prisma.listeningAttempt.count({ where: { userId: dbUserId, completed: true } }),
    prisma.readingAttempt.count({ where: { userId: dbUserId, completed: true } }),
    prisma.writingAttempt.count({ where: { userId: dbUserId, completed: true } }),
    prisma.speakingAttempt.count({ where: { userId: dbUserId, completed: true } }),

    // Averages
    prisma.listeningAttempt.aggregate({
      where: { userId: dbUserId, completed: true },
      _avg: { score: true },
    }),
    prisma.readingAttempt.aggregate({
      where: { userId: dbUserId, completed: true },
      _avg: { score: true },
    }),
    prisma.writingAttempt.aggregate({
      where: { userId: dbUserId, completed: true, overallScore: { not: null } },
      _avg: { overallScore: true },
    }),
    prisma.speakingAttempt.aggregate({
      where: { userId: dbUserId, completed: true, overallScore: { not: null } },
      _avg: { overallScore: true },
    }),

    // Study Time
    prisma.user.findUnique({
      where: { id: dbUserId },
      select: { totalStudyTime: true },
    }),
  ]);

  return {
    exerciseCompleted: listeningCount + readingCount + writingCount + speakingCount,
    moduleCounts: {
      listening: listeningCount,
      reading: readingCount,
      writing: writingCount,
      speaking: speakingCount,
    },
    averageScore: {
      listening: listeningAve._avg.score || 0,
      reading: readingAve._avg.score || 0,
      writing: writingAve._avg.overallScore || 0,
      speaking: speakingAve._avg.overallScore || 0,
    },
    totalStudyTime: user?.totalStudyTime || 0,
  };
}

// Get recent activity for a user
export async function getRecentActivity(limit: number = 5) {
  const safeLimit = Math.max(1, Math.min(Math.floor(limit) || 5, 100));
  const dbUserId = await getAuthenticatedId();
  const [listening, reading, writing, speaking] = await Promise.all([
    prisma.listeningAttempt.findMany({
      where: {
        userId: dbUserId,
        completed: true,
      },
      take: safeLimit,
      select: {
        id: true,
        score: true,
        createdAt: true,
        exercise: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.readingAttempt.findMany({
      where: {
        userId: dbUserId,
        completed: true,
      },
      select: {
        id: true,
        score: true,
        createdAt: true,
        exercise: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: safeLimit,
    }),
    prisma.writingAttempt.findMany({
      where: {
        userId: dbUserId,
        completed: true,
      },
      select: {
        id: true,
        overallScore: true,
        createdAt: true,
        task: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: safeLimit,
    }),
    prisma.speakingAttempt.findMany({
      where: {
        userId: dbUserId,
        completed: true,
      },
      select: {
        id: true,
        overallScore: true,
        createdAt: true,
        exercise: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: safeLimit,
    }),
  ]);
  // Combine and format activities
  const activities = [
    ...listening.map((activity) => ({
      id: activity.id,
      moduleType: "listening" as const,
      exerciseTitle: activity.exercise.title,
      score: activity.score,
      completedAt: activity.createdAt,
    })),
    ...reading.map((activity) => ({
      id: activity.id,
      moduleType: "reading" as const,
      exerciseTitle: activity.exercise.title,
      score: activity.score,
      completedAt: activity.createdAt,
    })),
    ...writing.map((activity) => ({
      id: activity.id,
      moduleType: "writing" as const,
      exerciseTitle: activity.task.title,
      score: activity.overallScore || 0,
      completedAt: activity.createdAt,
    })),
    ...speaking.map((activity) => ({
      id: activity.id,
      moduleType: "speaking" as const,
      exerciseTitle: activity.exercise.title,
      score: activity.overallScore || 0,
      completedAt: activity.createdAt,
    })),
  ];
  // Sort by date and take top N
  return activities.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()).slice(0, safeLimit);
}

// Update User profile
export async function updateUserProfile(data: {
  firstName?: string;
  lastName?: string;
  targetScore?: number;
  studyGoal?: string;
}) {
  const dbUserId = await getAuthenticatedId();

  // Validate input
  const validatedData = updateUserProfileSchema.parse(data);

  // Update user
  await prisma.user.update({
    where: {
      id: dbUserId,
    },
    data: validatedData,
  });

  // Revalidate cache
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true };
}
