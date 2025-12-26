import React from "react";

type Props = {
  params: Promise<{ taskId: string; attemptId: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }) {
    try {
      const { attemptId } = await params;
      const attempt = await getWritingAttempt(attemptId);
      const { exercise, score } = attempt;
      return {
        title: `Review: ${exercise.title} - Score ${score.toFixed(1)}`,
        description: `Your scored ${score.toFixed(1)} on ${exercise.title}`,
      };
    } catch {
      return {
        title: "Review - IELTS Writing",
      };
    }
  }

export default function ReviewPage({ params }: Props) {
  return <div>ReviewPage</div>;
}
