"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { BookOpenIcon } from "lucide-react";
import ExerciseCard from "./exerciseCard";

type Exercise = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  wordCount: number | null;
  _count: { questions: number };
};
const FilterableExerciseList = ({ exercises }: { exercises: Exercise[] }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredExercise =
    selectedFilter === "all" ? exercises : exercises.filter((exercise) => exercise.difficulty === selectedFilter);

  const filter = [
    { label: "All", value: "all" },
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filter.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.value)}>
            {filter.label}
          </Button>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {filteredExercise.length} {filteredExercise.length === 1 ? "exercise" : "exercises"}
      </div>
      {filteredExercise.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold">No exercises found</h3>
          <p className="mt-1 text-sm text-gray-500">Try selecting a different difficulty level.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercise.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterableExerciseList;
