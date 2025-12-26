import Link from "next/link";
import { getDifficultyColor } from "@/lib/utils";
import { ClockIcon, BookOpenIcon, PencilSquareIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { BaseExercise, ModuleType } from "@/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ExerciseCardProps<T extends BaseExercise> {
  exercise: T;
  moduleType: ModuleType;
}

const ExerciseCard = <T extends BaseExercise>({ exercise, moduleType }: ExerciseCardProps<T>) => {
  // Safe access to properties that might not exist on all exercise types
  const difficulty = exercise.difficulty || "medium";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="line-clamp-1">{exercise.title}</span>
          {exercise.difficulty && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          )}
        </CardTitle>
        {exercise.category && (
          <span className="text-xs text-muted-foreground first-letter:uppercase">{exercise.category}</span>
        )}
        {exercise.description && <CardDescription className="line-clamp-2">{exercise.description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {moduleType === "reading" ? (
            <div className="flex items-center gap-1">
              <BookOpenIcon className="w-4 h-4" />
              <span>{exercise.wordCount || exercise.minWords || "0"} words</span>
            </div>
          ) : moduleType === "listening" ? (
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>{exercise.duration || exercise.speakingTime || "0"} min</span>
            </div>
          ) : moduleType === "writing" ? (
            <div className="flex items-center gap-1">
              <PencilSquareIcon className="w-4 h-4" />
              <span>{exercise.wordCount || exercise.minWords || "0"} words</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <MicrophoneIcon className="w-4 h-4" />
              <span>
                {exercise.part ? `Part ${exercise.part.replace("part", "")}` : "Speaking"} •{" "}
                {exercise.speakingTime || "0"}s
              </span>
            </div>
          )}

          {exercise._count?.questions !== undefined && (
            <div className="flex items-center gap-1">
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {exercise._count.questions} Qs
              </span>
            </div>
          )}
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
