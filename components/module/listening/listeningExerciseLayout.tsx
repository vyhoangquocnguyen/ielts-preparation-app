"use client";

import { ListeningExerciseWithQuestions } from "@/types";
import AudioPlayer from "@/components/module/listening/audioPlayer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { submitListeningAnswers } from "@/lib/actions/listening";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Timer from "../timer";
interface Props {
  exercise: ListeningExerciseWithQuestions;
}

export default function ListeningExerciseLayout({ exercise }: Props) {
  const { id, title, description, audioUrl } = exercise;
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
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

    setSubmitting(true);

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
          setSubmitting(false);
          router.push(`/listening/${id}/review/${attemptId}`);
          return "Exercise submitted! Checking your answers...";
        },
        error: (err) => {
          setSubmitting(false);
          console.error("Submission error:", err);
          return err instanceof Error ? err.message : "Failed to submit answers. Please try again.";
        },
      }
    );
  };
  return (
    <div>
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
      <p>{description}</p>
      <AudioPlayer audioUrl={audioUrl} />
    </div>
  );
}
