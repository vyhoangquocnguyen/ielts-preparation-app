import React from "react";
import { getSpeakingExercises } from "@/lib/actions/speaking";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import FilterableExerciseList from "@/components/module/filterExerciseList";
import ExerciseCard from "@/components/module/exerciseCard";

const SpeakingPracticePage = async () => {
  const exercises = await getSpeakingExercises();
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-y-2 p-2">
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2 rounded-lg">
            <ArrowLeftIcon className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <div className="flex items-center justify-center text-center p-8">
          {/* Title & Description */}
          <div className="flex flex-col gap-y-2 p-2">
            <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
            <p className="text-muted-foreground">Choose an exercise to practice your IELTS speaking skills</p>
          </div>
        </div>
      </div>
          {/* <FilterableExerciseList exercises={exercises} /> */}
          {/* Exercises Cards */}
          <div className="space-y-6">
              {exercises.length === 0 ? (
                  <div className="text-center py-12">
                      <BookOpenIcon className="w-12 h-12 mx-auto text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold">No exercises found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try selecting a different difficulty level.</p>
                  </div>
              ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {/* {exercises.map((exercise) => (
                            //   <ExerciseCard key={exercise.id} exercise={exercise} />
                      ))} */}
                  </div>
              )}
              
          </div>
    </div>
  );
};

export default SpeakingPracticePage;
