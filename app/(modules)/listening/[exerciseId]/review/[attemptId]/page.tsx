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

export const metadata = {
  title: "Listening Review",
  description: "Review your listening answers",
};

export default async function ListeningReviewPage({ params }: Props) {
  const { exerciseId, attemptId } = await params;
  const attempt = (await getListeningAttempt(attemptId)) as ListeningAttemptWithExercise;

  // Verify attempt exists and exercise ID matches
  if (!attempt || attempt.exercise.id !== exerciseId) {
    redirect(`/listening`);
  }

  return <ReviewLayout attempt={attempt} moduleType="listening" />;
}
