import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDifficultyColor } from "@/lib/utils";
import { BookOpenIcon } from "lucide-react";
import { ClockIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "../ui/button";

const ExerciseCard = ({ exercise }: { exercise: any }) => {
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
          <div className="flex items-center gap-1">
            <BookOpenIcon className="w-4 h-4" />
            <span>{exercise.wordCount || "~800"} words</span>
          </div>

          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>60 min</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">{exercise._count.questions} questions</div>
        {/* Start Button */}
        <Link href={`/reading/${exercise.id}`}>
          <Button className="w-full">Start Exercise</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
