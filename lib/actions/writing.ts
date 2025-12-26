"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { generateAIFeedback } from "../geminiAi";
import { revalidatePath } from "next/cache";
import { SubmitWritingInput, submitWritingSchema } from "../validation";
import { ZodError } from "zod";
import { calculateNewStreak } from "../utils";

export async function getWritingTasks(filters?: { taskType?: string; category?: string }) {
  // Authenticate user session
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Validation filters if provided
  const validTaskType = ["task1", "task2"];
  const validCategory = ["academic", "general"];
  if (filters?.taskType && !validTaskType.includes(filters.taskType)) throw new Error("Invalid task type");
  if (filters?.category && !validCategory.includes(filters.category)) throw new Error("Invalid category");

  const tasks = await prisma.writingTask.findMany({
    where: {
      isPublished: true,
      ...(filters?.taskType && { taskType: filters.taskType }),
      ...(filters?.category && { category: filters.category }),
    },
    select: {
      id: true,
      title: true,
      taskType: true,
      category: true,
      prompt: true,
      imgUrl: true,
      minWords: true,
      timeLimit: true,
      isPublished: true,
      order: true,
    },
    orderBy: {
      order: "asc",
    },
  });
  return tasks;
}

export async function getWritingTaskById(taskId: string) {
  // Authenticate usersession
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  // Validate taskId format
  if (!taskId || typeof taskId !== "string") throw new Error("Invalid task ID");

  const task = await prisma.writingTask.findUnique({
    where: {
      id: taskId,
    },
  });
  if (!task) throw new Error("Task not found");
  return task;
}

export async function submitWritingTask(data: SubmitWritingInput) {
  // Authenticate user session
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User not found");

  // Validate input format
  let validatedData: SubmitWritingInput;
  try {
    validatedData = submitWritingSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map((e) => e.message).join(", ");
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    throw new Error("Validation failed");
  }
  const { taskId, content, wordCount, timeSpent } = validatedData;
  const task = await prisma.writingTask.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  const feedback = await generateAIFeedback(task.taskType, task.prompt, wordCount, content);
  const result = await prisma.writingAttempt.create({
    data: {
      userId,
      taskId,
      content,
      wordCount,
      overallScore: feedback.overallScore,
      feedback: JSON.stringify(feedback),
      timeSpent,
      completed: true,
    },
  });

  // Update User analytics
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  // Get real average from DB
  const monthlyStats = await prisma.writingAttempt.aggregate({
    where: {
      userId: user.id,
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    },
    _avg: { overallScore: true },
    _count: { id: true },
  });
  const realAverage = monthlyStats._avg.overallScore || feedback.overallScore;

  await prisma.userAnalytics.upsert({
    where: {
      userId_month_year: {
        userId: user.id,
        month,
        year,
      },
    },
    update: {
      exercisesDone: { increment: 1 },
      totalStudyTime: { increment: Math.round(timeSpent / 60) },
      writingAvg: realAverage, // Fixed: Use absolute value, not increment
    },
    create: {
      userId: user.id,
      month,
      year,
      writingAvg: realAverage,
      exercisesDone: 1,
      totalStudyTime: Math.round(timeSpent / 60),
    },
  });

  const newStreak = calculateNewStreak(user.currentStreak || 0, user.lastStudyDate);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totalStudyTime: {
        increment: Math.round(timeSpent / 60),
      },
      lastStudyDate: now,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak || 0),
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/writing");

  return { success: true, data: result };
}
