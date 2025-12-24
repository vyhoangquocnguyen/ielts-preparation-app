import { auth } from "@clerk/nextjs/server";
import prisma from "../prisma";

export async function getWritingTasks(filters?: { taskType?: string; category?: string }) {
  // Authenticate usersession
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Validation filters if provided
  const validTaskType = ["task1", "task2"];
  const validCategory = ["academic", "general"];
  if (filters?.taskType && !validTaskType.includes(filters.taskType)) throw new Error("Invalid task type");
  if (filters?.category && !validCategory.includes(filters.category)) throw new Error("Invalid category");

  try {
    const where = {
      isPublished: true,
      taskType: filters?.taskType,
      category: filters?.category,
    };
    const tasks = await prisma.writingTask.findMany({
      where,
      select: {
        id: true,
        title: true,
        taskType: true,
        category: true,
        prompt: true,
        imgUrl: true,
        minWords: true,
        timeLimit: true,
      },
      orderBy: {
        order: "asc",
      },
    });
    return tasks;
  } catch (error) {
    throw error;
  }
}

export async function getWritingTaskById(taskId: string) {
  // Authenticate usersession
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  // Validate taskId format
  if (!taskId || typeof taskId !== "string") throw new Error("Invalid task ID");

  try {
    const task = await prisma.writingTask.findUnique({
      where: {
        id: taskId,
      },
    });
    if (!task) throw new Error("Task not found");
    return task;
  } catch (error) {
    throw error;
  }
}
