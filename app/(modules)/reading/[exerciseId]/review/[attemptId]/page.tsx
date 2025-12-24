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
    const attempt = await getReadingAttempt(attemptId);
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
  const attempt = (await getReadingAttempt(attemptId)) as ReadingAttemptWithExercise;

  // Verify attempt exists and exercise ID matches
  if (!attempt || attempt.exercise.id !== exerciseId) {
    redirect(`/reading`);
  }

  return <ReviewLayout attempt={attempt} moduleType="reading" />;
}

export default ReviewPage;
