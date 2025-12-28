"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Get speaking exercises, fetch all with questions
export async function getSpeakingExercises(filterParts?: string) {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }
  // 2. validate if part is provided
  if (filterParts) {
    const validParts = ["part1", "part2", "part3"];
    if (!validParts.includes(filterParts)) {
      return { success: false, error: "Invalid part" };
    }
  }

  // 3. Fetch exercises
  const exercises = await prisma.speakingExercise.findMany({
    where: {
      isPublished: true,
      ...(filterParts && { part: filterParts }),
    },
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

  return { success: true, exercises };
}

// Get speaking exercise by id
export async function getSpeakingExerciseById(id: string) {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  // 2. Validate id
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
    return { success: false, error: "Exercise not found" };
  }
  // 5. Return exercise
  return { success: true, exercise };
}

// export async function submitSpeakingExercise(data: SubmitSpeakingInput) {