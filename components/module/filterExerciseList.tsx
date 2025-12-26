"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { BookOpenIcon } from "lucide-react";
import ExerciseCard from "./exerciseCard";
import { BaseExercise, ModuleType } from "@/types";

interface FilterProps<T extends BaseExercise> {
  exercises: T[];
  moduleType: ModuleType;
}
const FilterableExerciseList = <T extends BaseExercise>({ exercises, moduleType }: FilterProps<T>) => {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("all");
  const [partFilter, setPartFilter] = useState<string>("all");

  const filteredExercise = exercises.filter((exercise) => {
    const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    const matchesTaskType = taskTypeFilter === "all" || exercise.taskType === taskTypeFilter;
    const matchesPart = partFilter === "all" || exercise.part === partFilter;
    return matchesDifficulty && matchesCategory && matchesTaskType && matchesPart;
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
  const taskTypes = [
    { label: "All", value: "all" },
    { label: "Task 1", value: "task1" },
    { label: "Task 2", value: "task2" },
  ];
  const parts = [
    { label: "All", value: "all" },
    { label: "Part 1", value: "part1" },
    { label: "Part 2", value: "part2" },
    { label: "Part 3", value: "part3" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-6 bg-white/5 p-4 rounded-xl border border-white/10">
        {(moduleType === "listening" || moduleType === "reading") && (
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
        )}

        {moduleType !== "speaking" && (
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
        )}

        {moduleType === "writing" && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Task Type</label>
            <div className="flex flex-wrap gap-2">
              {taskTypes.map((f) => (
                <Button
                  key={f.value}
                  variant={taskTypeFilter === f.value ? "default" : "outline"}
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setTaskTypeFilter(f.value)}>
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {moduleType === "speaking" && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Part</label>
            <div className="flex flex-wrap gap-2">
              {parts.map((f) => (
                <Button
                  key={f.value}
                  variant={partFilter === f.value ? "default" : "outline"}
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setPartFilter(f.value)}>
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {filteredExercise.length} {filteredExercise.length === 1 ? "exercise" : "exercises"}
      </div>
      {filteredExercise.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold">No exercises found</h3>
          <p className="mt-1 text-sm text-gray-500">Try selecting a different filter.</p>
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
