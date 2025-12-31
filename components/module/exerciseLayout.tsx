"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { submitReadingAnswers } from "@/lib/actions/reading";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Timer from "./timer";
import { toast } from "sonner";
import QuestionsPanel from "./questionsPanel";

type Question = {
  id: string;
  questionNumber: number;
  questionType: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
};

type Exercise = {
  id: string;
  title: string;
  passage: string;
  questions: Question[];
};

export function ExerciseLayout({ exercise }: { exercise: Exercise }) {
  const router = useRouter();

  // State Management
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  }, []);

  const allQuestionsAnswered = useMemo(
    () => exercise.questions.every((q) => answers[q.id] && answers[q.id].trim() !== ""),
    [exercise.questions, answers]
  );

  const handleSubmit = useCallback(async () => {
    // Check if all quetions are answered
    if (!allQuestionsAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    setIsSubmitting(true);

    try {
      // Convert answers object to array format for validation
      const answerArray = exercise.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "",
      }));

      const result = await submitReadingAnswers({
        exerciseId: exercise.id,
        answers: answerArray,
        timeSpent,
      });

      if (result.success && result.data) {
        toast.success("Exercise submitted! Checking your answers...");
        router.push(`/reading/${exercise.id}/review/${result.data}`);
      } else {
        toast.error(result.error || "Failed to submit answers. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit answers. Please try again.");
      }
      setIsSubmitting(false);
    }
  }, [allQuestionsAnswered, exercise.id, exercise.questions, answers, timeSpent, router]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button + Timer Row */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/reading">
          <Button variant="outline" size="sm" className="gap-2 rounded-md">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <Timer initialTime={3600} onTimeUpdate={setTimeSpent} onTimeUp={handleSubmit} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <Card className="p-6 h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h2 className="text-xl font-semibold mb-4">Reading Passage</h2>
            <div className="whitespace-pre-line leading-relaxed max-w-prose">
              {exercise.passage.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph.trim()}</p>
              ))}
            </div>
          </div>
        </Card>
        {/* Right Column */}
        <Card className="p-6 h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin">
          <QuestionsPanel questions={exercise.questions} answers={answers} onAnswerChange={handleAnswerChange} />
          {/* Submit Button */}
          <div className="mt-6 pt-6 border-t">
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="w-full"
              size="lg">
              {isSubmitting ? "Submitting..." : "Submit Answers"}
            </Button>
            {!allQuestionsAnswered && (
              <p className="text-sm text-muted-foreground text-center mt-2">Answer all question before submitting</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
