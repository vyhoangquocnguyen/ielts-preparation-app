import { notFound, redirect } from "next/navigation";
import { getReadingAttempt } from "@/lib/actions/reading";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScoreColor } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "lucide-react";

type Props = {
  params: {
    exerciseId: string;
    attemptId: string;
  };
};

export async function generateMetadata({ params }: { params: { attempId: string } }) {
  try {
    const attempt = await getReadingAttempt(params.attempId);
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
  const { exerciseId, attemptId } = params;
  let attempt;
  try {
    attempt = await getReadingAttempt(exerciseId);
  } catch (error) {
    notFound();
  }

  // Validate attemp belongs to this exercise
  if (exerciseId !== attempt.exerciseId) {
    redirect("/reading");
  }
  const { exercise, answers, score, correctCount, totalQuestions, timeSpent } = attempt;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with Score */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Exercise Complete</h1>
        <p className="text-muted-foreground">{exercise.title}</p>
      </div>

      {/* Score Card */}
      <div className="mb-8 border-2">
        <Card>
          <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-center">Your Result</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Band Score */}
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${getScoreColor(score)}`}>{score.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Band Score</div>
              </div>

              {/* Correct Answer */}
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {correctCount}/{totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground">Correct ({percentage}%)</div>
              </div>

              {/* Time Spent */}
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, "0")}
                </div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <Link href={`reading/${exerciseId}`}>
            <Button variant="default" className="gap-2">
              <ArrowPathIcon className="w-4 h-4" />
              Retry
            </Button>
          </Link>
          <Link href="/reading">
            <Button variant="outline" className="gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              Back To Reading
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Question by Questions Review */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Answer Review</h2>

          {exercise.questions.map((question) => {
            const userAnswer = (answers as Record<string, string>)[question.id] || "No answer";
            const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
            return (
              <Card
                key={question.id}
                className={`border-l-4 ${
                  isCorrect ? "border-l-green-500 dark:border-l-green-400" : "border-l-red-500 dark:border-l-red-400"
                }`}>
                <CardHeader>
                  <CardTitle className="flex items-start gap-3 text-lg">
                    {isCorrect ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className="text-primary mr-2">Q{question.questionNumber}.</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* User Answer */}
                  <div>
                    <span className="text-sm font-medium">Your Answer:</span>
                    <span
                      className={`font-semibold ${
                        isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}>
                      {userAnswer}
                    </span>
                  </div>

                  {/* Correct Answers (if wrong) */}
                  {!isCorrect && (
                    <div>
                      <span className="text-sm font-medium">Correct Answer:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{question.correctAnswer}</span>
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-1">💡Explanation</div>
                      <div className="text-sm text-blue-800 dark:text-blue-300">{question.explanation}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-muted-foreground">Ready to practice more?</p>
        </div>
        <Link href="/reading">
          <Button size="lg" className="gap-2">
            Browse More Exercise
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ReviewPage;
