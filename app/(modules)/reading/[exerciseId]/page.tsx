import { ExerciseLayout } from "@/components/module/exerciseLayout";
import { getReadingExerciseById } from "@/lib/actions/reading";
import { notFound } from "next/navigation";
import React from "react";

export async function generateMetadata({ params }: { params: { exerciseId: string } }) {
  const { exerciseId } = await params;
  try {
    const { success, data: exercise } = await getReadingExerciseById(exerciseId);

    if (!success || !exercise) {
      return { title: "Exercise Not Found" };
    }

    return {
      title: `${exercise.title} - IELTS Reading Practice`,
      description: `Practice IELTS Reading: ${exercise.description}`,
    };
  } catch {
    return {
      title: "Exercise Not Found",
    };
  }
}

const ExercisePage = async ({ params }: { params: Promise<{ exerciseId: string }> }) => {
  // Extract ExerciseId from params
  const { exerciseId } = await params;
  // Fetch exercise by id
  const { success, data: exercise } = await getReadingExerciseById(exerciseId);

  // Error handling
  if (!success || !exercise || !exercise.questions || exercise.questions.length === 0) {
    notFound();
  }

  // Render layout
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b glass sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{exercise.title}</h1>
            <p className="text-sm text-muted-foreground">{exercise.questions.length} questions - 60 minutes</p>
          </div>
        </div>
      </div>
      {/* Main Content - Client Component */}
      <ExerciseLayout exercise={exercise} moduleType="reading" />
    </div>
  );
};

export default ExercisePage;
