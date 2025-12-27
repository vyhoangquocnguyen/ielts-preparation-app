import { WritingAttemptWithTask, WritingFeedbackDetailed } from "@/types";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FeedbackDisplay from "../geminiAi/FeedbackDisplay";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { formatTime } from "@/lib/utils";

interface WritingReviewLayoutProps {
  attempt: WritingAttemptWithTask;
}

export default function WritingReviewLayout({ attempt }: WritingReviewLayoutProps) {
  const { task, content, overallScore, timeSpent, feedback } = attempt;
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
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full shadown-lg mb-4">
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
        <FeedbackDisplay feedback={feedback as WritingFeedbackDetailed | string | null} />

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
