"use server";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { SubmitWritingInput, submitWritingSchema } from "../validation";
import { ZodError } from "zod";
import { getAuthenticatedId } from "./auth";
import { processWritingFeedback } from "../workers";

/**
 * Get all writing tasks with optional filtering
 * @param filters - Optional filters for taskType and category
 * @returns Success response with tasks array or error
 */
export async function getWritingTasks(filters?: { taskType?: string; category?: string }) {
  try {
    // 1. Authenticate user
    await getAuthenticatedId();

    // 2. Validate filters
    const validations = {
      taskType: ["task1", "task2"],
      category: ["academic", "general"],
    } as const;

    for (const [key, validOptions] of Object.entries(validations)) {
      const value = filters?.[key as keyof typeof filters];
      if (value && !(validOptions as readonly string[]).includes(value)) {
        throw new Error(`Invalid ${key}`);
      }
    }

    // 3. Build database query
    const where = {
      isPublished: true,
      ...(filters?.taskType !== undefined && { taskType: filters.taskType }),
      ...(filters?.category !== undefined && { category: filters.category }),
    };

    // 4. Fetch tasks
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
        isPublished: true,
        order: true,
      },
      orderBy: {
        order: "asc",
      },
    });
    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error fetching writing tasks:", error);
    return { success: false, error: "Failed to fetch writing tasks" };
  }
}

/**
 * Get a single writing task by ID
 * @param taskId - Task ID
 * @returns Writing task data
 */
export async function getWritingTaskById(taskId: string) {
  try {
    // 1. Authenticate user
    await getAuthenticatedId();

    // 2. Validate task ID
    if (!taskId || typeof taskId !== "string") throw new Error("Invalid task ID");

    // 3. Fetch task
    const task = await prisma.writingTask.findUnique({
      where: {
        id: taskId,
      },
    });

    // 4. Handle not found
    if (!task) throw new Error("Task not found");

    return { success: true, data: task };
  } catch (error) {
    console.error("Error fetching writing task:", error);
    return { success: false, error: "Failed to fetch writing task" };
  }
}

/**
 * Submit a writing task attempt
 * @param data - Writing submission data including content and word count
 * @returns Success response with attempt ID or error
 */
export async function submitWritingTask(data: SubmitWritingInput) {
  // Validate input format first
  let validatedData: SubmitWritingInput;
  try {
    validatedData = submitWritingSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map((e) => e.message).join(", ");
      return { success: false, error: `Validation failed: ${errorMessage}` };
    }
    return { success: false, error: "Validation failed" };
  }

  const { taskId, content, wordCount, timeSpent } = validatedData;

  // Parallelize authentication and task fetching (independent operations)
  const [dbUserId, task] = await Promise.all([
    getAuthenticatedId(),
    prisma.writingTask.findUnique({ where: { id: taskId } }),
  ]);

  // Validate results
  if (!dbUserId) throw new Error("User Database ID not found");
  if (!task) throw new Error("Task not found");

  // 7. Create the attempt in a pending state
  const attempt = await prisma.writingAttempt.create({
    data: {
      userId: dbUserId,
      taskId,
      content,
      wordCount,
      timeSpent,
      completed: false,
    },
  });

  // 8. Offload heavy compute to background worker
  after(async () => {
    await processWritingFeedback(attempt.id);
  });

  revalidatePath("/dashboard");
  revalidatePath("/writing");

  return { success: true, data: { id: attempt.id } };
}

/**
 * Get writing attempt for review
 * @param attemptId - Writing attempt ID
 * @returns Success response with attempt and task data, or error
 */
export async function getWritingAttempt(attemptId: string) {
  try {
    // 1. Authenticate user
    const dbUserId = await getAuthenticatedId();

    // 2. Validate attempt ID
    if (!attemptId || typeof attemptId !== "string") throw new Error("Invalid attempt ID");

    // 3. Fetch attempt
    const attempt = await prisma.writingAttempt.findFirst({
      where: { id: attemptId, userId: dbUserId },
      include: {
        task: true,
      },
    });

    // 4. Handle not found
    if (!attempt) return { success: false, error: "Attempt not found" };
    if (attempt.userId !== dbUserId) return { success: false, error: "Unauthorized" };

    return { success: true, data: attempt };
  } catch (error) {
    console.error("Error fetching writing attempt:", error);
    return { success: false, error: "Failed to fetch writing attempt" };
  }
}
