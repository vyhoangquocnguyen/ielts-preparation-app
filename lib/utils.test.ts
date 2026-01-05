import { describe, it, expect, beforeEach } from "vitest";
import {
  cn,
  formatRelativeTime,
  getScoreColor,
  calculateNewStreak,
  calculateBandScore,
  getDifficultyColor,
  formatTime,
} from "./utils";

describe("Utility Functions", () => {
  describe("cn - className merger", () => {
    it("should merge tailwind classes correctly", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4"); // px-4 overrides px-2
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("base-class");
      expect(result).toContain("active-class");
    });

    it("should ignore false/null/undefined values", () => {
      const result = cn("class1", false && "class2", undefined, "class3");
      expect(result).toBe("class1 class3");
    });
  });

  describe("formatRelativeTime", () => {
    let now: Date;

    beforeEach(() => {
      now = new Date();
    });

    it("should show 'just now' for recent times (< 1 minute)", () => {
      const recentDate = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      expect(formatRelativeTime(recentDate)).toBe("just now");
    });

    it("should show minutes ago for times < 60 minutes", () => {
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      expect(formatRelativeTime(tenMinutesAgo)).toBe("10 minutes ago");
    });

    it("should show hours ago for times < 24 hours", () => {
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe("2 hours ago");
    });

    it("should show days ago for times < 30 days", () => {
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(fiveDaysAgo)).toBe("5 days ago");
    });

    it("should show formatted date for old times (> 30 days)", () => {
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
      const result = formatRelativeTime(twoMonthsAgo);
      // Should contain month and day
      expect(result).toMatch(/\w+ \d+/);
    });
  });

  describe("getScoreColor", () => {
    it("should return green for score >= 8.0", () => {
      expect(getScoreColor(8.0)).toBe("text-green-600 dark:text-green-400");
      expect(getScoreColor(9.0)).toBe("text-green-600 dark:text-green-400");
    });

    it("should return blue for score >= 7.0 and < 8.0", () => {
      expect(getScoreColor(7.5)).toBe("text-blue-600 dark:text-blue-400");
      expect(getScoreColor(7.0)).toBe("text-blue-600 dark:text-blue-400");
    });

    it("should return yellow for score >= 6.0 and < 7.0", () => {
      expect(getScoreColor(6.5)).toBe("text-yellow-600 dark:text-yellow-400");
    });

    it("should return orange for score >= 5.0 and < 6.0", () => {
      expect(getScoreColor(5.5)).toBe("text-orange-600 dark:text-orange-400");
    });

    it("should return red for score < 5.0", () => {
      expect(getScoreColor(4.5)).toBe("text-red-600 dark:text-red-400");
      expect(getScoreColor(2.5)).toBe("text-red-600 dark:text-red-400");
    });
  });

  describe("calculateNewStreak", () => {
    let today: Date;

    beforeEach(() => {
      today = new Date();
      today.setHours(0, 0, 0, 0);
    });

    it("should return 1 for first study session (no last study date)", () => {
      expect(calculateNewStreak(0, null)).toBe(1);
    });

    it("should keep the same streak if studied today", () => {
      expect(calculateNewStreak(5, today)).toBe(5);
    });

    it("should increment streak if studied yesterday", () => {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      expect(calculateNewStreak(5, yesterday)).toBe(6);
    });

    it("should reset streak to 1 if missed a day", () => {
      const twoDaysAgo = new Date(today.getTime() - 48 * 60 * 60 * 1000);
      expect(calculateNewStreak(5, twoDaysAgo)).toBe(1);
    });

    it("should reset streak to 1 if more than a day missed", () => {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(calculateNewStreak(10, weekAgo)).toBe(1);
    });
  });

  describe("calculateBandScore", () => {
    it("should return 9 for 90% or more correct", () => {
      expect(calculateBandScore(9, 10)).toBe(9);
      expect(calculateBandScore(18, 20)).toBe(9);
    });

    it("should return 8.5 for 82-89%", () => {
      expect(calculateBandScore(16, 20)).toBe(8.5);
      expect(calculateBandScore(82, 100)).toBe(8.5);
    });

    it("should return 8 for 75-81%", () => {
      expect(calculateBandScore(15, 20)).toBe(8);
      expect(calculateBandScore(75, 100)).toBe(8);
    });

    it("should return 7.5 for 68-74%", () => {
      expect(calculateBandScore(68, 100)).toBe(7.5);
    });

    it("should return 7 for 60-67%", () => {
      expect(calculateBandScore(12, 20)).toBe(7);
      expect(calculateBandScore(60, 100)).toBe(7);
    });

    it("should return 2.5 for less than 5%", () => {
      expect(calculateBandScore(0, 100)).toBe(2.5);
      expect(calculateBandScore(1, 100)).toBe(2.5);
    });

    it("should handle edge case: 0 correct out of 0", () => {
      // This would be division by zero, but the function doesn't handle it
      // In a real scenario, you might want to add a guard clause
      expect(() => calculateBandScore(0, 0)).not.toThrow();
    });
  });

  describe("getDifficultyColor", () => {
    it("should return green for easy difficulty", () => {
      expect(getDifficultyColor("easy")).toBe("bg-green-100 text-green-800");
    });

    it("should return yellow for medium difficulty", () => {
      expect(getDifficultyColor("medium")).toBe("bg-yellow-100 text-yellow-800");
    });

    it("should return red for hard difficulty", () => {
      expect(getDifficultyColor("hard")).toBe("bg-red-100 text-red-800");
    });

    it("should return gray for unknown difficulty", () => {
      expect(getDifficultyColor("extreme")).toBe("bg-gray-100 text-gray-800");
    });
  });

  describe("formatTime", () => {
    it("should format seconds only", () => {
      expect(formatTime(45)).toBe("00:00:45");
    });

    it("should format minutes and seconds", () => {
      expect(formatTime(125)).toBe("00:02:05"); // 2 minutes 5 seconds
    });

    it("should format hours, minutes, and seconds", () => {
      expect(formatTime(3661)).toBe("01:01:01"); // 1 hour 1 minute 1 second
    });

    it("should handle zero", () => {
      expect(formatTime(0)).toBe("00:00:00");
    });

    it("should pad with zeros", () => {
      expect(formatTime(3605)).toBe("01:00:05"); // 1 hour 5 seconds
    });

    it("should handle large times", () => {
      expect(formatTime(86400)).toBe("24:00:00"); // 24 hours
    });
  });
});
