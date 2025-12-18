'use client'
import { cn, formatTime } from "@/lib/utils";
import { ClockIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

type TimperProps = {
  initialTime: number;
  onTimeUpdate: (timeSpent: number) => void;
  onTimeUp: () => void;
};

const Timer = (props: TimperProps) => {
  const { initialTime, onTimeUpdate, onTimeUp } = props;
  const [time, setTime] = useState(initialTime);
  const [hasFinished, setHasFinished] = useState(false);

  // Use refs to store latest callbacks to avoid restarting the interval
  const onTimeUpdateRef = React.useRef(onTimeUpdate);
  const onTimeUpRef = React.useRef(onTimeUp);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Separate effect for the countdown interval
  useEffect(() => {
    if (hasFinished) return;

    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setHasFinished(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFinished]);

  // Side effect to update parent on time change
  useEffect(() => {
    const timeSpent = initialTime - time;
    onTimeUpdateRef.current(timeSpent);
  }, [time, initialTime]);

  // Side effect when time runs out
  useEffect(() => {
    if (hasFinished) {
      onTimeUpRef.current();
    }
  }, [hasFinished]);
  const isWarning = time <= 300 && time > 60;
  const isCritical = time <= 60;
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-colors",
        time > 300 && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
        isWarning && "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-400",
        isCritical && "bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-400 animate-pulse"
      )}>
      <ClockIcon className="w-5 h-5" />
      <span>{formatTime(time)}</span>
      {hasFinished && <span className="text-sm font-normal">Time's up!</span>}
    </div>
  );
};

export default Timer;
