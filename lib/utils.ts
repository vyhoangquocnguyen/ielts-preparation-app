import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)} days ago`;
  return date.toLocaleDateString("en-US", {
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    month: "short",
    day: "numeric",
  });
}
// Get Score color
export function getScoreColor(score: number) {
  if (score >= 8.0) {
    return "text-green-600 dark:text-green-400";
  } else if (score >= 7.0) {
    return "text-blue-600 dark:text-blue-400";
  } else if (score >= 6.0) {
    return "text-yellow-600 dark:text-yellow-400";
  } else if (score >= 5.0) {
    return "text-orange-600 dark:text-orange-400";
  }
  return "text-red-600 dark:text-red-400";
}

// Calculate streak
export function calculateStreak(lastStudyDate: Date | null): {
  currentStreak: number;
  shouldReset: boolean;
} {
  if (!lastStudyDate) {
    return {
      currentStreak: 0,
      shouldReset: false,
    };
  }
  const today = new Date();
  const lastStudy = new Date(lastStudyDate);

  // Set both dates to midnight for comparison
  today.setHours(0, 0, 0, 0);
  lastStudy.setHours(0, 0, 0, 0);

  const diffInDays = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return {
      currentStreak: 1,
      shouldReset: false,
    };
  } else if (diffInDays === 1) {
    return {
      currentStreak: 1,
      shouldReset: false,
    };
  } else {
    return {
      currentStreak: 1,
      shouldReset: true,
    };
  }
}

// Calculate band score

export function calculateBandScore(correctCount: number, totalQuestion: number): number {
  const percentage = (correctCount / totalQuestion) * 100;
  if (percentage >= 90) return 9;
  if (percentage >= 82) return 8.5;
  if (percentage >= 75) return 8;
  if (percentage >= 68) return 7.5;
  if (percentage >= 60) return 7;
  if (percentage >= 52) return 6.5;
  if (percentage >= 45) return 6;
  if (percentage >= 37) return 5.5;
  if (percentage >= 30) return 5;
  if (percentage >= 23) return 4.5;
  if (percentage >= 16) return 4;
  if (percentage >= 10) return 3.5;
  if (percentage >= 5) return 3;
  return 2.5;
}

// Get Difficulty Color
export function getDifficultyColor(difficulty: string) {
  if (difficulty === "easy") return "bg-green-100 text-green-800";
  if (difficulty === "medium") return "bg-yellow-100 text-yellow-800";
  if (difficulty === "hard") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

// Format time
export function formatTime(seconds: number) {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
