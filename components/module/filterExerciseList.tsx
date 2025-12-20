"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { BookOpenIcon } from "lucide-react";
import ExerciseCard from "./exerciseCard";
import { ModuleType } from "@/types";

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  category: string;
  wordCount?: number | null;
  duration?: number | null;
  _count: { questions: number };
}

interface FilterProps {
  exercises: Exercise[];
  moduleType: ModuleType;
}
const FilterableExerciseList = ({ exercises, moduleType }: FilterProps) => {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredExercise = exercises.filter((exercise) => {
    const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    return matchesDifficulty && matchesCategory;
  });

  const difficulties = [
    { label: "All", value: "all" },
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];
  const categories = [
    { label: "All", value: "all" },
    { label: "Academic", value: "academic" },
    { label: "General", value: "general" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-6 bg-white/5 p-4 rounded-xl border border-white/10">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((f) => (
              <Button
                key={f.value}
                variant={difficultyFilter === f.value ? "default" : "outline"}
                size="sm"
                className="rounded-lg"
                onClick={() => setDifficultyFilter(f.value)}>
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((f) => (
              <Button
                key={f.value}
                variant={categoryFilter === f.value ? "default" : "outline"}
                size="sm"
                className="rounded-lg"
                onClick={() => setCategoryFilter(f.value)}>
                {f.label}
              </Button>
            ))}
          </div>
        </div>
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
            <ExerciseCard key={exercise.id} exercise={exercise} moduleType={moduleType} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterableExerciseList;
