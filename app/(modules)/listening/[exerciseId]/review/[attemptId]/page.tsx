import ReviewLayout from "@/components/module/reviewLayout";
import { getListeningAttempt } from "@/lib/actions/listening";
import { ListeningAttemptWithExercise } from "@/types";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    exerciseId: string;
    attemptId: string;
  }>;
};

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params;
    const { success, data: attempt } = await getListeningAttempt(attemptId);
    if (!success || !attempt) {
      return { title: "Review - IELTS Listening" };
    }
    const { exercise, score } = attempt;
    return {
      title: `Review: ${exercise.title} - Score ${score.toFixed(1)}`,
      description: `You scored ${score.toFixed(1)} on ${exercise.title}`,
    };
  } catch {
    return {
      title: "Review - IELTS Listening",
    };
  }
}

export default async function ListeningReviewPage({ params }: Props) {
  const { exerciseId, attemptId } = await params;
  const { success, data: attempt } = await getListeningAttempt(attemptId);

  // Verify attempt exists and exercise ID matches
  if (!success || !attempt || attempt.exercise.id !== exerciseId) {
    redirect(`/listening`);
  }

  return <ReviewLayout attempt={attempt as ListeningAttemptWithExercise} moduleType="listening" />;
}
