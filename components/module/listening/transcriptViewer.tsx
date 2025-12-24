'use client'

import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useState } from "react";


interface TranscriptViewerProps {
  transcript: string;
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
const [isExpanded, setIsExpanded] = useState(false);
  const parsedTranscript = transcript.split("\n\n").filter((p) => p.trim());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <DocumentTextIcon className="h-5 w-5" />
        <span className="font-semibold">Audio Transcript</span>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        {parsedTranscript.map((p, i) => (
          <p key={i} className="mb-4 text-muted-foreground">
            {p}
          </p>
        ))}
      </div>
      {parsedTranscript.length > 2 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-500 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      )}
      
    </div>
  );
}
