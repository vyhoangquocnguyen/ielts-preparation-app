"use client";

import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
  PlayCircleIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import { Activity, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  maxDuration: number;
};

export default function AudioRecorder({ onRecordingComplete, maxDuration }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check microphone permission on mount

  const checkPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); //stop immediately
      setHasPermission(true);
    } catch (error) {
      console.error("Microphone permission denied");
      toast.error("Microphone permission denied. Please grant permission to use the microphone.");
      setHasPermission(false);
    }
  };
  useEffect(() => {
    checkPermission();
  }, []);

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  const startRecording = async () => {
    try {
      chunkRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunkRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunkRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        stream.getTracks().forEach((track) => track.stop());

        onRecordingComplete(audioBlob, duration);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();

      // Start Timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        //   Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);
      setIsRecording(true);
    } catch (error) {
      toast.error("Failed to start recording. Please try again.");
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDuration(0);
    chunkRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (!hasPermission) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">Microphone access is required to record your response.</p>
        <Button onClick={checkPermission}>Request Microphone Access</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recording Indicator */}
      <Activity mode={isRecording ? "visible" : "hidden"}>
        <div className="flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-p">
            <span className="text-red-600 dark:text-red-400 font-semibold">Recording in progress...</span>
          </div>
        </div>
      </Activity>
      {/* Timer Display */}
      <div className="text-center">
        <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white">{formatTime(duration)}</div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {isRecording ? "Recording..." : audioUrl ? "Recording duration" : "Ready to record"}
        </p>
        {maxDuration && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Maximum: {formatTime(maxDuration)}</p>
        )}
      </div>
      {/* Waveform Visual */}

      {/* Audio Playback */}
      <Activity mode={audioUrl && !isRecording ? "visible" : "hidden"}>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
            <PlayCircleIcon className="w-4 h-4" />
            Recording complete! Listen to your response:
          </p>
          <audio controls className="w-full" src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      </Activity>

      {/* Controls Buttons */}
      <div className="flex gap-4 justify-center">
        {!isRecording && !audioUrl && (
          <Button onClick={startRecording} size="lg" className="min-w-[200px]">
            <MicrophoneIcon className="w-5 h-5 mr-2" />
            Start Recording
          </Button>
        )}
        {isRecording && (
          <Button onClick={stopRecording} size="lg" variant="destructive" className="min-w-[200px]">
            <Square2StackIcon className="w-5 h-5 mr-2" />
            Stop Recording
          </Button>
        )}
        {audioUrl && !isRecording && (
          <Button onClick={resetRecording} size="lg" className="min-w-[200px]">
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Record Again
          </Button>
        )}
      </div>
      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {!isRecording && !audioUrl && <p>Click the button above to start recording your response</p>}
        {isRecording && <p>Speak clearly into your microphone. Click "Stop Recording" when finished.</p>}
        {audioUrl && <p>Listen to your recording above. You can record again or submit your response.</p>}
      </div>
    </div>
  );
}
