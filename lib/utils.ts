import { User } from "@/app/generated/prisma/client";
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
