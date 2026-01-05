"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { submitReadingAnswers } from "@/lib/actions/reading";
import { submitListeningAnswers } from "@/lib/actions/listening";
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Timer from "./timer";
import { toast } from "sonner";
import QuestionsPanel from "./questionsPanel";

import { ListeningExerciseWithQuestions, ReadingExerciseWithQuestions } from "@/types";
import AudioPlayer from "./listening/audioPlayer";

interface ExerciseProps {
  exercise: ReadingExerciseWithQuestions | ListeningExerciseWithQuestions;
  moduleType: "reading" | "listening";
}

export function ExerciseLayout({ exercise, moduleType }: ExerciseProps) {
  const router = useRouter();

  // State Management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // State persistence for auto-save
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const savedAnswers = sessionStorage.getItem(`${moduleType}-${exercise.id}`);
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
  const [prevId, setPrevId] = useState(exercise.id);
  if (exercise.id !== prevId) {
    setPrevId(exercise.id);
    const savedAnswers = typeof window !== "undefined" ? sessionStorage.getItem(`${moduleType}-${exercise.id}`) : null;
    setAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
  }

  // Debounced Auto-save answer to sessionStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      sessionStorage.setItem(`${moduleType}-${exercise.id}`, JSON.stringify(answers));
    }, 1000); // 1-second debounce

    return () => clearTimeout(timeoutId);
  }, [answers, exercise.id, moduleType]);

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
    // Check if all questions are answered
    if (!allQuestionsAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    setIsSubmitting(true);

    // Convert answers object to array format for validation
    const answerArray = exercise.questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || "",
    }));

    // Choose the correct submit function based on module type
    const submitFunction = moduleType === "reading" ? submitReadingAnswers : submitListeningAnswers;

    toast.promise(
      submitFunction({
        exerciseId: exercise.id,
        answers: answerArray,
        timeSpent,
      }).then((result) => {
        if (!result.success || !result.data) throw new Error(result.error);
        return result.data;
      }),
      {
        loading: "Submitting answers...",
        success: (attemptId) => {
          setIsSubmitting(false);
          sessionStorage.removeItem(`${moduleType}-${exercise.id}`);
          router.push(`/${moduleType}/${exercise.id}/review/${attemptId}`);
          return "Exercise submitted! Checking your answers...";
        },
        error: (err) => {
          setIsSubmitting(false);
          return err instanceof Error ? err.message : "Failed to submit answers. Please try again.";
        },
      }
    );
  }, [allQuestionsAnswered, exercise.id, exercise.questions, answers, timeSpent, router, moduleType]);

  const answeredCount = Object.values(answers).filter((a) => a && a.trim() !== "").length;
  const totalQuestions = exercise.questions.length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  // Module-specific configuration
  const timerDuration = moduleType === "reading" ? 3600 : 2400; // 60 min for reading, 40 min for listening

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button + Timer Row */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/${moduleType}`}>
          <Button variant="outline" size="sm" className="gap-2 rounded-md">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <Timer initialTime={timerDuration} onTimeUpdate={setTimeSpent} onTimeUp={handleSubmit} />
      </div>
      <div className="flex item-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{exercise.title}</h1>
        </div>
        {exercise.description && <p className="text-muted-foreground mt-1">{exercise.description}</p>}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>
            Progress: {answeredCount}/{exercise.questions.length}
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Reading Passage */}
        {moduleType === "reading" && (
          <Card className="p-6 h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h2 className="text-xl font-semibold mb-4">Reading Passage</h2>
              <div className="whitespace-pre-line leading-relaxed max-w-prose">
                {(exercise as ReadingExerciseWithQuestions).passage?.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph.trim()}</p>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Left Column - Audio Player */}
        {moduleType === "listening" && (
          <Card className="lg:sticky lg:top-6 h-fit">
            <CardHeader>
              <CardTitle>Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioPlayer audioUrl={(exercise as ListeningExerciseWithQuestions).audioUrl} />
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Instructions:</strong> Listen to the audio and answer the questions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Right Column - Questions */}
        <Card className="p-6 h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin">
          <QuestionsPanel questions={exercise.questions} answers={answers} onAnswerChange={handleAnswerChange} />
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
              Make sure you&apos;ve answered all questions before submitting
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
