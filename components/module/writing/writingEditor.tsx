"use client";

import { WritingTask } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  PencilSquareIcon, CheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { submitWritingTask } from "@/lib/actions/writing";
import Timer from "../timer";

interface WritingEditorProps {
  task: WritingTask;
}

export default function WritingEditor({ task }: WritingEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  // Word count is computed directly from content.
  // useMemo ensures this only recalculates when 'content' changes.
  const wordCount = useMemo(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  }, [content]);

  const initialTime = useMemo(() => (task.timeLimit || 20) * 60, [task.id, task.timeLimit]);
  // --- EFFECTS ---

  // Load saved content
  useEffect(() => {
    const saved = sessionStorage.getItem(`writing-task-${task.id}`);
    if (saved) {
      setContent(saved);
    }
  }, [task.id]);

  // Save content on change
  useEffect(() => {
    sessionStorage.setItem(`writing-task-${task.id}`, content);
  }, [task.id, content]);

  // --- HANDLERS ---

  const handleSubmit = useCallback(async () => {
    if (wordCount < (task.minWords || 150)) {
      throw new Error(
        `Your word count (${wordCount}) is below the minimum required (${task.minWords}). Do you still want to submit?`
      );
      return;
    }
    if (!content.trim()) {
      throw new Error("Please write something before submitting.");
      return;
    }
    setIsSubmitting(true);

    try {
      // Logic for submission would go here (calling a server action)
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const result = await submitWritingTask({ taskId: task.id, content, wordCount, timeSpent });
      if (result.success && result.data) {
        // Clear saved content
        sessionStorage.removeItem(`writing-task-${task.id}`);
        //   Navigate to feedback page
        router.push(`/writing/${task.id}/feedback/${result.data.id}`);
        toast.success("Task submitted successfully!");
      }
    } catch {
      toast.error("Failed to submit task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [wordCount, task.minWords, router, task.id, content, startTime]);

  const handleTimeUp = () => {
    if (!isSubmitting && content.trim()) {
      handleSubmit();
    }
  };
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="p-4 md:p-8 space-y-6 animate-fade-in">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 sticky top-4 z-10">
          <div className="flex items-center gap-4">
            <Link href="/writing">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold line-clamp-1">{task.title}</h1>
              <p className="text-xs pt-1 text-muted-foreground tracking-wider">
                {task.taskType === "task1" ? "Task 1" : "Task 2"} • <span className="uppercase ">{task.category}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Word Count</span>
              <span
                className={`text-lg font-mono font-bold ${
                  wordCount < (task.minWords || 150) ? "text-orange-400" : "text-green-400"
                }`}>
                {wordCount} / {task.minWords}
              </span>
            </div>

            <Timer initialTime={initialTime} onTimeUp={handleTimeUp} />

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || content.length < 10}
              className="rounded-xl px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20">
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side: Prompt & Instructions */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden sticky lg:top-28">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <PencilSquareIcon className="w-5 h-5 text-blue-400" />
                Task Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {task.imgUrl && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <Image src={task.imgUrl} width={500} height={500} alt="Writing Task visual aid" className="w-full h-auto object-cover" />
                </div>
              )}
              <div className="prose prose-invert max-w-none">
                <p className="text-md leading-relaxed text-gray-200 whitespace-pre-wrap">{task.prompt}</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-sm text-blue-200">
                <strong className="block mb-1 text-blue-400">Preparation Tips:</strong>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li>Keep track of the time and word count</li>
                  <li>Spend about 5 minutes planning your response</li>
                  <li>Ensure your handwriting is legible (if this were paper)</li>
                  <li>Check for grammar and spelling errors at the end</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Right Side: Editor */}
          <div className="space-y-4">
            <div className="md:hidden flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-sm font-medium">
                Word Count: <span className="font-mono">{wordCount}</span>
              </span>
              <span className="text-sm font-medium">
                Goal: <span className="font-mono">{task.minWords}</span>
              </span>
            </div>

            <Textarea
              placeholder="Start writing your response here..."
              className="min-h-[600px] text-lg p-6 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-500/50 rounded-2xl transition-all resize-none shadow-inner leading-relaxed overflow-y-auto"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />

            <p className="text-xs text-center text-muted-foreground pt-4">
              Your progress is automatically tracked. Make sure to submit before the time runs out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
