"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { calculateNewStreak } from "../utils";
import { revalidatePath } from "next/cache";
import { updateUserProfileSchema } from "../validation";
import { cache } from "react";

// Get current user from database
export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
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
      data: { currentStreak: newStreak },
    });
    return updatedUser;
  }

  return user;
});

// Get dashboard statistics for a user
export async function getDashboardStatistics(userId: string) {
  // Optimized: Fetch all stats directly from the User model (O(1) retrieval)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalStudyTime: true,
      listeningDone: true,
      readingDone: true,
      writingDone: true,
      speakingDone: true,
      listeningAvg: true,
      readingAvg: true,
      writingAvg: true,
      speakingAvg: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    exerciseCompleted:
      user.listeningDone + user.readingDone + user.writingDone + user.speakingDone,
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
export async function getRecentActivity(userId: string, limit: number = 5) {
  const [listening, reading, writing, speaking] = await Promise.all([
    prisma.listeningAttempt.findMany({
      where: {
        userId,
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
      take: limit,
    }),
    prisma.readingAttempt.findMany({
      where: {
        userId,
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
      take: limit,
    }),
    prisma.writingAttempt.findMany({
      where: {
        userId,
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
      take: limit,
    }),
    prisma.speakingAttempt.findMany({
      where: {
        userId,
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
      take: limit,
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
  return activities.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()).slice(0, limit);
}

// Update User profile
export async function updateUserProfile(data: {
  firstName?: string;
  lastName?: string;
  targetScore?: number;
  studyGoal?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Validate input
  const validatedData = updateUserProfileSchema.parse(data);

  // Get user
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Update user
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: validatedData,
  });

  // Revalidate cache
  revalidatePath("/profile");

  return { success: true };
}
