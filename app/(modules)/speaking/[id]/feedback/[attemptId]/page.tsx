import FeedbackDisplay from "@/components/module/shared/feedbackDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSpeakingFeedback } from "@/lib/actions/speaking";
import { formatTime } from "@/lib/utils";
import { SpeakingFeedbackDetailed } from "@/types";
import {
  ArrowLeftCircleIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckBadgeIcon,
  LightBulbIcon,
  MicrophoneIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { notFound } from "next/navigation";

export const generateMetadata = async ({ params }: { params: { id: string; attemptId: string } }) => {
  try {
    const { attemptId } = await params;
    const { attempt, success } = await getSpeakingFeedback(attemptId);
    if (attempt !== undefined && success) {
      return {
        title: `Review: ${attempt.exercise.title} - Score ${attempt.overallScore?.toFixed(1)}`,
        description: `Your scored ${attempt.overallScore?.toFixed(1)} on ${attempt.exercise.title}`,
      };
    }
  } catch {
    return {
      title: "Review - IELTS Speaking",
    };
  }
};

export default async function SpeakingFeedBackPage({ params }: { params: Promise<{ id: string; attemptId: string }> }) {
  const { attemptId } = await params;
  const { attempt, success } = await getSpeakingFeedback(attemptId);

  if (!success || !attempt) notFound();
  const { exercise, feedback: rawFeedback } = attempt;
  const feedback = rawFeedback as SpeakingFeedbackDetailed;
  const {
    strengths,
    improvements,
    fluencyCoherence,
    lexicalResource,
    grammaticalAccuracy,
    pronunciation,
    overallScore,
  } = feedback;

  const criteria = [
    {
      title: "Fluency & Coherence",
      icon: ChatBubbleLeftEllipsisIcon,
      score: fluencyCoherence.score,
      comments: fluencyCoherence.comments,
      suggestions: fluencyCoherence.suggestions,
      description: "Flow of speech and logical organization",
    },
    {
      title: "Lexical Resource",
      icon: LightBulbIcon,
      score: lexicalResource.score,
      comments: lexicalResource.comments,
      suggestions: lexicalResource.suggestions,
      description: "Range and accuracy of vocabulary used",
    },
    {
      title: "Grammatical Range & Accuracy",
      icon: CheckBadgeIcon,
      score: grammaticalAccuracy.score,
      comments: grammaticalAccuracy.comments,
      suggestions: grammaticalAccuracy.suggestions,
      errors: grammaticalAccuracy.errors,
      description: "Variety and accuracy of grammar",
    },
    {
      title: "Pronunciation",
      icon: MicrophoneIcon,
      score: pronunciation.score,
      comments: pronunciation.comments,
      suggestions: pronunciation.suggestions,
      issues: pronunciation.issues,
      description: "Clarity and natural rhythm",
    },
  ];

  const tips = [
    { icon: "🎤", text: "Record yourself regularly to track improvement over time" },
    { icon: "👂", text: "Listen to native speakers and mimic their pronunciation" },
    { icon: "📚", text: "Expand vocabulary by reading widely and noting new words" },
    { icon: "🗣️", text: "Practice speaking on various topics for 2 minutes without stopping" },
    { icon: "✍️", text: "Work on grammar through writing exercises and correction" },
    { icon: "💬", text: "Join speaking groups or find language exchange partners" },
  ];
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/speaking" className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-700">
            <ArrowLeftCircleIcon className="w-6 h-6" />
            Back to Speaking Exercises
          </Link>
          <h1 className="text-3xl font-bold mt-2">AI Feedback</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{attempt.exercise.title}</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Feedback</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {exercise.title} • {exercise.part.replace("part", "Part ")}
          </p>
        </div>
        {/* Overall Score */}
        <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-4">
                <span className="text-4xl font-bold text-blue-600">{attempt.overallScore}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Overall Band Score</h2>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{formatTime(attempt.audioDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircleIcon className="w-4 h-4" />
                  <span>Recording available below</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Audio Player & Transcript */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Recording</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Audio Player */}
            <div>
              <audio controls className="w-full" src={attempt.audioUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>

            {/* Transcript */}
            {attempt.transcript && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transcript</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{attempt.transcript}</p>
                </div>
                {attempt.transcript.includes("mock") && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Note: This is a mock transcript for development. In production, this would be the actual
                    speech-to-text transcription.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* AI Feedback */}
        <FeedbackDisplay
          overallScore={overallScore}
          criteria={criteria}
          strengths={strengths}
          improvements={improvements}
          tipsTitle="Practice Tips"
          tips={tips}
        />
        {/* Questions References */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(exercise.questions as string[]).map((question, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-blue-600">{index + 1}.</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href={`/speaking/${exercise.id}`}>
            <Button variant="outline" size="lg">
              <ArrowLeftCircleIcon className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Link>
          <Link href="/speaking">
            <Button size="lg">More Exercises</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
