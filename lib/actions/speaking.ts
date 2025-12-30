"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { SubmitSpeakingInput } from "../validation";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { generateSpeakingAIFeedback } from "../geminiAi";
import { transcribeAudio } from "../utils";

// Get speaking exercises, fetch all with questions
export async function getSpeakingExercises(filter?: { part?: string }) {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }
  // 2. validate if part is provided
  if (filter?.part) {
    const validParts = ["part1", "part2", "part3"];
    if (!validParts.includes(filter.part)) {
      return { success: false, error: "Invalid part" };
    }
  }

  // 3. Fetch exercises
  const exercises = await prisma.speakingExercise.findMany({
    where: {
      isPublished: true,
      ...(filter?.part && { part: filter.part }),
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

export async function submitSpeakingExercise(data: SubmitSpeakingInput): Promise<{
  success: boolean;
  data: {
    error?: string;
    attemptId?: string;
  };
}> {
  // 1. Authenticate user
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
  // 2. Validate id
  if (!data.exerciseId || typeof data.exerciseId !== "string") {
    throw new Error("Invalid exercise ID");
  }
  // 3. Fetch exercise
  const exercise = await prisma.speakingExercise.findUnique({
    where: {
      id: data.exerciseId,
    },
  });
  // 4. Handle not found
  if (!exercise) {
    return { success: false, data: { error: "Exercise not found" } };
  }
  /*** PROCESS AUDIO ***/
  // 1. extract base64 data
  const base64Data = data.audioBlob.split(",")[1];
  // 2. convert base64 to buffer
  const buffer = Buffer.from(base64Data, "base64");

  // 3. Upload audio to storage
  const filename = `speaking/${user.id}/${Date.now()}.webm`;
  const blob = await put(filename, buffer, {
    access: "public",
    contentType: "audio/webm",
  });

  console.log("Audio uploaded to storage:", blob.url);
  /*** TRANSCRIPT AUDIO ***/
  /*** TODO: IMPLEMENT ACTUAL TRANSCRIPTION - (maybe OpenAI Whisper API ?) ***/
  const transcript = await transcribeAudio(blob.url);

  /*** GENERATE AI FEEDBACK ***/
  const feedback = await generateSpeakingAIFeedback(
    exercise.part,
    exercise.questions as string[],
    transcript,
    data.duration
  );

  /*** TODO: SAVE TO DB ***/
  const attempt = await prisma.speakingAttempt.create({
    data: {
      userId: user.id,
      exerciseId: exercise.id,
      audioUrl: blob.url,
      transcript,
      overallScore: feedback.overallScore,
      feedback: feedback,
      completed: true,
      audioDuration: data.duration,
    },
  });
  /*** TODO: UPDATE USER ANALYTICS ***/
  /*** TODO: UPDATE USER PROGRESS ***/
  /*** REVALIDATE CACHE ***/
  revalidatePath("/speaking");
  revalidatePath("/dashboard");

  // 5. Return result
  return { success: true, data: { attemptId: "attemptStringHere" } };
}
