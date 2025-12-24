"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { submitListeningAnswers } from "@/lib/actions/listening";

import { toast } from "sonner";
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ListeningExerciseWithQuestions } from "@/types";

import Timer from "../timer";
import AudioPlayer from "@/components/module/listening/audioPlayer";
import { Button } from "@/components/ui/button";
import QuestionsPanel from "../reading/questionsPanel";
interface Props {
  exercise: ListeningExerciseWithQuestions;
}

export default function ListeningExerciseLayout({ exercise }: Props) {
  const { id, title, description,questions, audioUrl } = exercise;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Initialize state from sessionStorage (Hydration-safe)
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const savedAnswers = sessionStorage.getItem(`listening-${id}`);
      if (savedAnswers) {
        try {
          return JSON.parse(savedAnswers);
        } catch (error) {
          console.error("Error parsing saved answers:", error);
        }
      }
    }
    return {};
  });

  // Render-phase sync for ID changes (if component is reused)
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    const savedAnswers = typeof window !== "undefined" ? sessionStorage.getItem(`listening-${id}`) : null;
    setAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
  }

  // Debounced Auto-save answer to sessionStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      sessionStorage.setItem(`listening-${id}`, JSON.stringify(answers));
    }, 1000); // 1-second debounce

    return () => clearTimeout(timeoutId);
  }, [answers, id]);

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };
  // Handle submit
  const handleSubmit = async () => {
    // Validate answers
    const allAnswered = exercise.questions.every((question) => answers[question.id]);
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);

    const answerArray = exercise.questions.map((question) => ({
      questionId: question.id,
      answer: answers[question.id] || "",
    }));

    toast.promise(
      submitListeningAnswers({
        exerciseId: id,
        answers: answerArray,
        timeSpent,
      }),
      {
        loading: "Submitting your answers...",
        success: (attemptId) => {
          setIsSubmitting(false);
          sessionStorage.removeItem(`listening-${id}`);
          router.push(`/listening/${id}/review/${attemptId}`);
          return "Exercise submitted! Checking your answers...";
        },
        error: (err) => {
          setIsSubmitting(false);
          console.error("Submission error:", err);
          return err instanceof Error ? err.message : "Failed to submit answers. Please try again.";
        },
      }
    );
  };
  const answeredCount = Object.values(answers).filter((a) => a && a.trim() !== "").length;
  const totalQuestions = exercise.questions.length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button + Timer Row */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/listening">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to List
          </Button>
        </Link>
        <Timer initialTime={2400} onTimeUpdate={setTimeSpent} onTimeUp={handleSubmit} />
      </div>
      <div className="flex item-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>
            Progress: {answeredCount}/{questions.length}
          </span>
          <span>{Math.floor(progressPercentage)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="lg:sticky lg:top-6 h-fit">
          <CardHeader>
            <CardTitle>Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioPlayer audioUrl={audioUrl} />
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Instructions:</strong> Listen to the audio and answer the questions.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionsPanel questions={questions} answers={answers} onAnswerChange={handleAnswerChange} />
            {/* Submit Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full">
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                    Submit Answers
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                Make sure you've answered all questions before submitting
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
