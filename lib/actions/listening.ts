"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { SubmitListeningInput, submitListeningSchema } from "../validation";
import { ZodError } from "zod";
import { calculateBandScore } from "../utils";
import { revalidatePath } from "next/cache";

/***** Get listening exercises, fetch all with questions *****/
export async function getListeningExercises(filter?: { difficulty?: string; category?: string }) {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  // 2. Validate difficulty
  if (filter?.difficulty) {
    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(filter.difficulty)) {
      throw new Error("Invalid difficulty level");
    }
  }
  if (filter?.category) {
    const validCategories = ["academic", "general"]; // academic or general
    if (!validCategories.includes(filter.category)) {
      throw new Error("Invalid category");
    }
  }
  // 2. Build database query
  try {
    const where = {
      isPublished: true,
      difficulty: filter?.difficulty,
      category: filter?.category,
    };
    // 3. Fetch exercises
    const exercises = await prisma.listeningExercise.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        duration: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { order: "asc" },
    });
    return exercises;
  } catch (error) {
    console.error("Error fetching exercises:", error);
    throw new Error("Failed to fetch exercises");
  }
}

/***** Get listening exercise by exerciseId *****/
export async function getListeningExerciseById(exerciseId: string) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 2. Validate id
    if (!exerciseId || typeof exerciseId !== "string") {
      throw new Error("Invalid exercise ID");
    }
    // 3. Fetch exercise
    const exercise = await prisma.listeningExercise.findUnique({
      where: { id: exerciseId, isPublished: true },
      include: {
        questions: {
          orderBy: {
            questionNumber: "asc",
          },
        },
      },
    });
    // 4. Handle not found
    if (!exercise) {
      throw new Error("Exercise not found");
    }
    // 5. Return exercise
    return exercise;
  } catch (error) {
    console.error("Error fetching exercise:", error);
    throw new Error("Failed to fetch exercise");
  }
}

/**** Submit and score listening exercise ****/
export async function submitListeningAnswers(data: SubmitListeningInput) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error("User not found");

    // 2. Validate exerciseId
    let validatedData;
    try {
      validatedData = submitListeningSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((error) => error.message).join(", ");
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error("Validation error");
    }

    // 3. Fetch exercise
    const exercise = await prisma.listeningExercise.findUnique({
      where: { id: validatedData.exerciseId },
      include: {
        questions: true,
      },
    });
    // 4. Handle not found
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    // 5. Check if user answered the right number of questions
    if (validatedData.answers.length !== exercise.questions.length) {
      throw new Error(`Expected ${exercise.questions.length} answers, but received ${validatedData.answers.length}`);
    }

    // 6. Check all questions ids are valid
    const validQuestionIds = new Set(exercise.questions.map((q) => q.id));
    for (const answer of validatedData.answers) {
      if (!validQuestionIds.has(answer.questionId)) {
        throw new Error(`Invalid question ID: ${answer.questionId}`);
      }
    }

    // 7. Convert to Record format
    const answersRecord: Record<string, string> = {};
    for (const answer of validatedData.answers) {
      answersRecord[answer.questionId] = answer.answer;
    }

    // Check answers
    let correctCount = 0;
    const totalQuestions = exercise.questions.length;

    exercise.questions.forEach((question) => {
      const userAnswer = answersRecord[question.id];
      const correctAnswer = question.correctAnswer;

      if (userAnswer && correctAnswer) {
        const normalizedUserAnswer = userAnswer.trim().toLowerCase();
        const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();

        if (normalizedUserAnswer === normalizedCorrectAnswer) {
          correctCount++;
        }
      }
    });

    //   8. Calculate band score
    const bandScore = calculateBandScore(correctCount, totalQuestions);

    //   9. Save to database
    const attempt = await prisma.listeningAttempt.create({
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

    //   10. Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastStudyDate: new Date(),
        totalStudyTime: {
          increment: Math.floor(validatedData.timeSpent / 60),
        },
      },
    });

    //   11. Revalidate & return
    revalidatePath("/dashboard");
    return attempt.id;
  } catch (error) {
    console.error("Error submitting answers:", error);
    throw new Error("Failed to submit answers");
  }
}
