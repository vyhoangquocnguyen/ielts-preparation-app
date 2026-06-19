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
// Optimized to use denormalized fields from User model
export async function getDashboardStatistics() {
  const dbUserId = await getAuthenticatedId();

  const user = await prisma.user.findUnique({
    where: { id: dbUserId },
    select: {
      totalStudyTime: true,
      listeningAvg: true,
      readingAvg: true,
      writingAvg: true,
      speakingAvg: true,
      listeningDone: true,
      readingDone: true,
      writingDone: true,
      speakingDone: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    exerciseCompleted: user.listeningDone + user.readingDone + user.writingDone + user.speakingDone,
    moduleCounts: {
      listening: user.listeningDone,
      reading: user.readingDone,
      writing: user.writingDone,
      speaking: user.speakingDone,
    },
    averageScore: {
      listening: user.listeningAvg,
      reading: user.readingAvg,
      writing: user.writingAvg,
      speaking: user.speakingAvg,
    },
    totalStudyTime: user.totalStudyTime,
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
