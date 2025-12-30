"use client";

import { useRouter } from "next/navigation";
import { Activity, useState } from "react";
import { Button } from "@/components/ui/button";
import { SpeakingExercise } from "@/types";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { submitSpeakingExercise } from "@/lib/actions/speaking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowPathIcon, ExclamationCircleIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import AudioRecorder from "./audioRecorder";

interface ExerciseLayoutProps {
  exercise: SpeakingExercise;
}

export default function SpeakingExerciseLayout({ exercise }: ExerciseLayoutProps) {
  const router = useRouter();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = (blob: Blob, recordingDuration: number) => {
    setAudioBlob(blob);
    setDuration(recordingDuration);
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      setError("Please record your answer");
      return;
    }
    if (duration < 10) {
      setError("Please record for at least 10 seconds");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        //   Call server action to submit exercise
        const result = await submitSpeakingExercise({
          exerciseId: exercise.id,
          audioBlob: base64Audio,
          duration,
        });
        // TODO: can deconstruct result here
        if (result.success && result.data) {
          // Navigate to feedback page
          router.push(`/speaking/${exercise.id}/feedback/${result.data.attemptId}`);
        }
      };
    } catch (error) {
      setError("Failed to submit exercise");
      setIsSubmitting(false);
    }
  };
  return (
    <div className="mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/speaking">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to List
          </Button>
        </Link>
        {/* <Timer initialTime={3600} onTimeUpdate={setTimeSpent} onTimeUp={handleSubmit} /> */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{exercise.title}</h1>
            <span
              className={`text-xs px-2 py-2 rounded-full font-medium${
                exercise.part === "part1"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : exercise.part === "part2"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              }`}>
              {exercise.part.replace("part", "Part ")}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{exercise.description}</p>
        </div>
      </div>
      {/* Question/ Cue Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{exercise.part === "part2" ? "Cue Card" : "Question"}</CardTitle>
        </CardHeader>
        <CardContent>
          {exercise.part === "part2" && exercise.cueCard ? (
            <div className="prose dark:prose-invert max-w-none">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                <p className="text-gray-900 dark:text-white font-semibold mb-2">{exercise.topic}</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{exercise.cueCard}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Preparation Time</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{exercise.prepTime} seconds</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Speaking Time</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{exercise.speakingTime} seconds</p>
                </div>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {exercise.questions.map((question, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 dark:text-gray-300">{question}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Audio Recorder */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Record Your Response</CardTitle>
        </CardHeader>
        <CardContent>
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={exercise.part === "part2" ? (exercise.speakingTime || 120) + 60 : 180}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      {audioBlob && (
        <div className="flex justify-center">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[250px]" size="lg">
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                Processing & Generating AI Feedback...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="mr-2 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </div>
      )}

      {isSubmitting && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we transcribe your audio and generate AI feedback. This may take a while.
          </p>
        </div>
      )}
      {/* Tips */}
      <Card className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-900 dark:text-purple-100">Speaking Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-purple-900 dark:text-purple-100">
            <li>🎤 Speak clearly and at a natural pace</li>
            <li>💭 Take a moment to organize your thoughts before speaking</li>
            <li>📝 For Part 2, use the preparation time to make brief notes</li>
            <li>🗣️ Try to speak fluently without long pauses</li>
            <li>✨ Use a variety of vocabulary and grammar structures</li>
            <li>🎯 Answer the questions directly and develop your ideas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
