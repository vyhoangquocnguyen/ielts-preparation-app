import { getReadingAttempt } from "@/lib/actions/reading";
import ReviewLayout from "@/components/module/reviewLayout";
import { redirect } from "next/navigation";
import { ReadingAttemptWithExercise } from "@/types";

type Props = {
  params: Promise<{
    exerciseId: string;
    attemptId: string;
  }>;
};

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params;
    const { success, data: attempt } = await getReadingAttempt(attemptId);
    if (!success || !attempt) {
      return { title: "Review - IELTS Reading" };
    }
    const { exercise, score } = attempt;
    return {
      title: `Review: ${exercise.title} - Score ${score.toFixed(1)}`,
      description: `Your scored ${score.toFixed(1)} on ${exercise.title}`,
    };
  } catch {
    return {
      title: "Review - IELTS Reading",
    };
  }
}

async function ReviewPage({ params }: Props) {
  const { exerciseId, attemptId } = await params;
  const { success, data: attempt } = await getReadingAttempt(attemptId);

  // Verify attempt exists and exercise ID matches
  if (!success || !attempt || attempt.exercise.id !== exerciseId) {
    redirect(`/reading`);
  }

  return <ReviewLayout attempt={attempt as ReadingAttemptWithExercise} moduleType="reading" />;
}

export default ReviewPage;
