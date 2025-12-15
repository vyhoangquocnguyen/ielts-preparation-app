"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { calculateStreak } from "../utils";
import { revalidatePath } from "next/cache";
import { updateUserProfileSchema } from "../validation";

// Get current user from database
export async function getCurrentUser() {
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
  const { currentStreak, shouldReset } = calculateStreak(user.lastStudyDate);

  if (shouldReset) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        currentStreak: currentStreak,
        lastStudyDate: new Date(),
      },
    });
    user.currentStreak = currentStreak;
  }

  return user;
}

// Get dashboard statistics for a user
export async function getDashboardStatistics(userId: string) {
  // Get counts of completed exercise per module
  const [listeningCount, readingCount, writingCount, speakingCount] = await Promise.all([
    prisma.listeningAttempt.count({
      where: {
        userId,
        completed: true,
      },
    }),
    prisma.readingAttempt.count({
      where: {
        userId,
        completed: true,
      },
    }),
    prisma.writingAttempt.count({
      where: {
        userId,
        completed: true,
      },
    }),
    prisma.speakingAttempt.count({
      where: {
        userId,
        completed: true,
      },
    }),
  ]);

  // Get average score for each module
  const [listeningAve, readingAve, writingAve, speakingAve] = await Promise.all([
    prisma.listeningAttempt.aggregate({
      where: {
        userId,
        completed: true,
      },
      _avg: {
        score: true,
      },
    }),
    prisma.readingAttempt.aggregate({
      where: {
        userId,
        completed: true,
      },
      _avg: {
        score: true,
      },
    }),
    prisma.writingAttempt.aggregate({
      where: {
        userId,
        completed: true,
        overallScore: {
          not: null,
        },
      },
      _avg: {
        overallScore: true,
      },
    }),
    prisma.speakingAttempt.aggregate({
      where: {
        userId,
        completed: true,
        overallScore: {
          not: null,
        },
      },
      _avg: {
        overallScore: true,
      },
    }),
  ]);

  // Get user data for study time
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      totalStudyTime: true,
    },
  });
  return {
    exerciseCompleted: listeningCount + readingCount + writingCount + speakingCount,
    moduleCounts: {
      listening: listeningCount,
      reading: readingCount,
      writing: writingCount,
      speaking: speakingCount,
    },
    averageScore: {
      listening: listeningAve._avg.score,
      reading: readingAve._avg.score,
      writing: writingAve._avg.overallScore,
      speaking: speakingAve._avg.overallScore,
    },
    totalStudyTime: user?.totalStudyTime,
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
