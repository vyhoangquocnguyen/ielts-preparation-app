import { getWritingAttempt } from "@/lib/actions/writing";
import WritingReviewLayout from "@/components/module/writing/writingReview";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ taskId: string; attemptId: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params;
    const { success, data: attempt } = await getWritingAttempt(attemptId);
    if (!success) return { title: "Review - IELTS Writing" };
    return {
      title: `Review: ${attempt?.task.title} - Score ${attempt?.overallScore?.toFixed(1)}`,
      description: `Your scored ${attempt?.overallScore?.toFixed(1)} on ${attempt?.task.title}`,
    };
  } catch {
    return {
      title: "Review - IELTS Writing",
    };
  }
}

export default async function ReviewPage({ params }: Props) {
  const { attemptId, taskId } = await params;
  const { success, data: attempt } = await getWritingAttempt(attemptId);
  // Verify attempt exists and match exerciseId
  if (!success || attempt?.taskId !== taskId) return redirect(`/writing`);

  return <WritingReviewLayout attempt={attempt} />;
}
