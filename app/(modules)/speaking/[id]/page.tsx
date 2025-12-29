import SpeakingExerciseLayout from "@/components/module/speaking/speakingExerciseLayout";
import { getSpeakingExerciseById } from "@/lib/actions/speaking";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const { success, exercise } = await getSpeakingExerciseById(id);
    if (!success || !exercise) {
      return {
        title: `Exercise not found`,
      };
    }
    return {
      title: `${exercise.title} | IELTS Prep - Speaking Practice`,
      description: exercise.description || "Practice IELTS speaking with authentic materials",
    };
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return {
      title: "Exercise not found",
    };
  }
}

export default async function SpeakingPracticePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { success, exercise } = await getSpeakingExerciseById(id);
  if (!success || !exercise) {
    notFound();
  }
  return <div className="min-h-screen">
    <SpeakingExerciseLayout exercise={exercise} />
    </div>;
}
