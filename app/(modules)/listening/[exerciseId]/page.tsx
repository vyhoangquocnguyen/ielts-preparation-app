import { ExerciseLayout } from "@/components/module/exerciseLayout";
import { getListeningExerciseById } from "@/lib/actions/listening";
import { notFound } from "next/navigation";

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
      <ExerciseLayout exercise={exercise} moduleType="listening" />
    </div>
  );
};

export default ListeningExercisePage;
