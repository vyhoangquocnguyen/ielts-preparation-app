import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDifficultyColor } from "@/lib/utils";
import { ClockIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "../ui/button";

import { ModuleType } from "@/types";

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  wordCount?: number | null;
  duration?: number | null;
  _count: { questions: number };
}

interface ExerciseCardProps {
  exercise: Exercise;
  moduleType: ModuleType;
}

const ExerciseCard = ({ exercise, moduleType }: ExerciseCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="line-clamp-1">{exercise.title}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(exercise.difficulty)}`}>
            {exercise.difficulty}
          </span>
        </CardTitle>
        {exercise.description && <CardDescription className="line-clamp-2">{exercise.description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {moduleType === "reading" ? (
            <div className="flex items-center gap-1">
              <BookOpenIcon className="w-4 h-4" />
              <span>{exercise.wordCount || "0"} words</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>{exercise.duration || "0"} min</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {exercise._count.questions} Qs
            </span>
          </div>
        </div>
        {/* Start Button */}
        <Link href={`/${moduleType}/${exercise.id}`}>
          <Button className="w-full">Start Exercise</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
