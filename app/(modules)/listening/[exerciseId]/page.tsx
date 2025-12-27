import ListeningExerciseLayout from "@/components/module/listening/listeningExerciseLayout";
import { getListeningExerciseById } from "@/lib/actions/listening";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata({ params }: { params: { exerciseId: string } }) {
  const { exerciseId } = await params;
  try {
    const { success, data: exercise } = await getListeningExerciseById(exerciseId);
    if (!success || !exercise) {
      return { title: "Exercise not found" };
    }
    return {
      title: `${exercise.title} | IELTS Prep - Listening Practice`,
      description: exercise.description || "Practice IELTS listening with authentic materials",
    };
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return {
      title: "Exercise not found",
    };
  }
}

const ListeningExercisePage = async ({ params }: { params: { exerciseId: string } }) => {
  const { exerciseId } = await params;
  const { success, data: exercise } = await getListeningExerciseById(exerciseId);

  if (!success || !exercise || !exercise.questions || exercise.questions.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      {/* <div className="border-b rounded-2xl glass sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{exercise.title}</h1>
            <p className="text-sm text-muted-foreground">{exercise.questions.length} questions - 60 minutes</p>
          </div>
        </div>
      </div> */}
      <Suspense fallback={<div>Loading...</div>}>
        <ListeningExerciseLayout exercise={exercise} />
      </Suspense>
    </div>
  );
};

export default ListeningExercisePage;
