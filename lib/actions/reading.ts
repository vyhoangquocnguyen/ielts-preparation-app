"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { calculateBandScore } from "../utils";
import { revalidatePath } from "next/cache";
import { submitReadingSchema, SubmitReadingInput } from "../validation";
import { ZodError } from "zod";

// Get reading exercises, fetch all exercises with questions
export async function getReadingExercises(filter?: { difficulty?: string; category?: string }) {
  //1. Authenticated use
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  // Validation difficulty if provided
  if (filter?.difficulty) {
    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(filter.difficulty)) {
      throw new Error("Invalid difficulty level");
    }
  }

  if (filter?.category) {
    const validCategories = ["academic", "general"];
    if (!validCategories.includes(filter.category)) {
      throw new Error("Invalid category");
    }
  }
  //2. Build database query
  const where = {
    isPublished: true,
    difficulty: filter?.difficulty,
    category: filter?.category,
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
  // Validate exerciseId format
  if (!exerciseId || typeof exerciseId !== "string") {
    throw new Error("Invalid exercise ID");
  }
  // 2. Fetch the exercise
  const exercise = await prisma.readingExercise.findUnique({
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
export async function submitReadingAnswers(data: SubmitReadingInput) {
  try {
    console.log("📝 submitReadingAnswers called with:", JSON.stringify(data, null, 2));

    // 1. Get user id
    const { userId } = await auth();
    console.log("🔐 Auth userId:", userId);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId, // Fixed: userId from Clerk is the clerkId, not the database id
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    // Validate input data
    let validatedData;
    try {
      validatedData = submitReadingSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(", ");
        throw new Error(`Validation failed: ${errorMessage}`);
      }
      throw new Error("Validation failed");
    }
    // 2. Fetch exercise with correct answers
    const exercise = await prisma.readingExercise.findUnique({
      where: { id: validatedData.exerciseId },
      include: {
        questions: true,
      },
    });
    if (!exercise) {
      throw new Error("Exercise not found");
    }
    // Check that user answered the right number of questions
    if (validatedData.answers.length !== exercise.questions.length) {
      throw new Error(`Expected ${exercise.questions.length} answers, but received ${validatedData.answers.length}`);
    }
    // Check all question ids are valid
    const validQuestionIds = new Set(exercise.questions.map((q) => q.id));
    for (const answer of validatedData.answers) {
      if (!validQuestionIds.has(answer.questionId)) {
        throw new Error(`Invalid question ID: ${answer.questionId}`);
      }
    }

    // Convert to RECORD Format

    const answersRecord: Record<string, string> = {};
    for (const answer of validatedData.answers) {
      answersRecord[answer.questionId] = answer.answer;
    }
    // 3. Loop through questions and check answers
    let correctCount = 0;
    const totalQuestions = exercise.questions.length;

    for (const question of exercise.questions) {
      const userAnswer = answersRecord[question.id];
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
        answers: answersRecord,
        score: bandScore,
        correctCount,
        totalQuestions,
        timeSpent: validatedData.timeSpent,
        completed: true,
      },
    });

    // 6. Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastStudyDate: new Date(),
        totalStudyTime: {
          increment: Math.floor(validatedData.timeSpent / 60),
        },
      },
    });

    // 7. Revalidate & return
    revalidatePath("/dashboard");
    console.log("✅ Success! Returning attempt ID:", attempt.id);
    return attempt.id;
  } catch (error) {
    console.error("💥 ERROR in submitReadingAnswers:");
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    throw error; // Re-throw to let Next.js handle it
  }
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
      clerkId: userId,
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
