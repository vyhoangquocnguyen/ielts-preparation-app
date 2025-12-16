"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { calculateBandScore } from "../utils";
import { revalidatePath } from "next/cache";

// Get reading exercises, fetch all exercises with questions
export async function getReadingExercises(difficulty?: string) {
  //1. Authenticated use
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  //2. Build database query
  const where = {
    isPublished: true,
    ...(difficulty && { difficulty }),
  };
  // 3.Fetch from database
  const exercises = await prisma.readingExercise.findMany({
    where,
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });
  return exercises;
}

// Fetch single exercise with questions
export async function getReadingExerciseById(exerciseId: string) {
  // 1. Authenticated user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  // 2. Fetch the exercise
  const exercise = prisma.readingExercise.findUnique({
    where: {
      id: exerciseId,
    },
    // Include questions in the response
    include: {
      questions: {
        orderBy: {
          questionNumber: "asc",
        },
      },
    },
  });
  // handle not found
  if (!exercise) {
    throw new Error("Exercise not found");
  }
  return exercise;
}

// Submit and score answers
export async function submitReadingAnswers(data: {
  exerciseId: string;
  answers: Record<string, string>;
  timeSpent: number;
}) {
  // 1. Get user id
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // 2. Fetch exercise with correct answers
  const exercise = await getReadingExerciseById(data.exerciseId);
  if (!exercise) {
    throw new Error("Exercise not found");
  }
  // 3. Loop through questions and check answers
  let correctCount = 0;
  const totalQuestions = exercise.questions.length;
  for (const question of exercise.questions) {
    const userAnswer = data.answers[question.id];
    const correctAnswer = question.correctAnswer;
    if (userAnswer && correctAnswer) {
      const normalizedUserAnswer = userAnswer.trim().toLowerCase();
      const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();

      if (normalizedUserAnswer === normalizedCorrectAnswer) {
        correctCount++;
      }
    }
  }

  // 4. Calculate Band Score
  const bandScore = calculateBandScore(correctCount, totalQuestions);

  // 5. Save to databse
  const attempt = await prisma.readingAttempt.create({
    data: {
      userId: user.id,
      exerciseId: exercise.id,
      answers: data.answers,
      score: bandScore,
      correctCount,
      totalQuestions,
      timeSpent: data.timeSpent,
      completed: true,
    },
  });

  // 6. Update user stats
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastStudyDate: new Date(),
      totalStudyTime: {
        increment: Math.floor(data.timeSpent / 60),
      },
    },
  });

  // 7. Revalidate & return
  revalidatePath("/dashboard");
  return attempt.id;
}

// Get Attempt for review
export async function getReadingAttempt(attemptId: string) {
  // 1. Authenticated user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // 2. Fetch attempt
  const attempt = await prisma.readingAttempt.findUnique({
    where: {
      id: attemptId,
      userId: user.id,
    },
    include: {
      exercise: {
        include: {
          questions: {
            orderBy: {
              questionNumber: "asc",
            },
          },
        },
      },
    },
  });
  if (!attempt) {
    throw new Error("Attempt not found");
  }
  return attempt;
}
