import { getWritingAttempt } from "@/lib/actions/writing";
import { redirect } from "next/navigation";
import {
  ArrowLeftCircleIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  CheckCircleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import FeedbackDisplay from "@/components/module/shared/feedbackDisplay";
import { WritingFeedbackDetailed } from "@/types";

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
  const { task, content, overallScore, timeSpent, feedback: rawFeedback } = attempt;
  const feedback = rawFeedback as WritingFeedbackDetailed;

  const criteria = [
    {
      title: "Task Achievement",
      icon: CheckCircleIcon,
      score: feedback.taskAchievement.score,
      comments: feedback.taskAchievement.comments,
      suggestions: feedback.taskAchievement.suggestions,
      description: "How well you addressed the task requirements",
    },
    {
      title: "Coherence & Cohesion",
      icon: ArrowTrendingUpIcon,
      score: feedback.coherenceCohesion.score,
      comments: feedback.coherenceCohesion.comments,
      suggestions: feedback.coherenceCohesion.suggestions,
      description: "How well your response is organized and connected",
    },
    {
      title: "Lexical Resource",
      icon: LightBulbIcon,
      score: feedback.lexicalResource.score,
      comments: feedback.lexicalResource.comments,
      suggestions: feedback.lexicalResource.suggestions,
      description: "Your use of vocabulary and range of expression",
    },
    {
      title: "Grammatical Accuracy",
      icon: BellAlertIcon,
      score: feedback.grammaticalAccuracy.score,
      comments: feedback.grammaticalAccuracy.comments,
      suggestions: feedback.grammaticalAccuracy.suggestions,
      errors: feedback.grammaticalAccuracy.errors,
      description: "Your control of grammar and sentence structures",
    },
  ];

  const tips = [
    { icon: "📝", text: "Review the feedback carefully and identify patterns in your writing" },
    { icon: "🔄", text: "Try the task again, focusing on the areas marked for improvement" },
    { icon: "📚", text: "Study model answers and notice how high-scoring responses are structured" },
    { icon: "✍️", text: "Practice regularly to build consistency and confidence" },
  ];
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/writing" className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-700">
            <ArrowLeftCircleIcon className="w-6 h-6" />
            Back to Writing
          </Link>
          <h1 className="text-3xl font-bold mt-2">AI Feedback</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{task.title}</p>
        </div>
        {/* Overall Score */}
        <Card className="mb-6 border-2 ">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full shadow-lg mb-4">
                <span className="text-4xl font-bold">{overallScore}</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Overall Band Score</h2>
              <div className="flex items-center justify-center gap-6 text-sm ">
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{formatTime(timeSpent)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        <FeedbackDisplay
          overallScore={feedback.overallScore}
          criteria={criteria}
          strengths={feedback.strengths}
          improvements={feedback.improvements}
          rewrittenSample={feedback.rewrittenSample}
          tips={tips}
        />
        {/* Your Response */}
        <Card className="my-6">
          <CardHeader>Your Response</CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{content}</div>
            </div>
          </CardContent>
        </Card>

        {/* Acition Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href={`/writing/${attempt.taskId}`}>
            <Button variant="outline">
              <ArrowPathIcon className="size-4 mr-2" />
              Try Again
            </Button>
          </Link>
          <Link href="/writing">
            <Button size="lg">More Tasks</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
