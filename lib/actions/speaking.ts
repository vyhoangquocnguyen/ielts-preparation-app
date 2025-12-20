"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Get speaking exercises, fetch all with questions
export async function getSpeakingExercises(part?: string) {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  // 2. validate if part is provided
  if (part) {
    const validParts = ["part1", "part2", "part3"];
    if (!validParts.includes(part)) {
      throw new Error("Invalid part");
    }
  }

  // 3. Fetch exercises
  const exercises = await prisma.speakingExercise.findMany({
    where: {
      part: part,
      isPublished: true,
    },
    orderBy: {
      order: "asc",
    },
  });

  return exercises;
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
    throw new Error("Exercise not found");
  }
  // 5. Return exercise
  return exercise;
}
