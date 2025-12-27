import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getReadingExercises } from "@/lib/actions/reading";
import FilterableExerciseList from "@/components/module/filterExerciseList";
import { Suspense } from "react";

const ReadingPracticePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; category?: string }>;
}) => {
  const resolvedParams = await searchParams;
  const { success, data: exercises } = await getReadingExercises(resolvedParams);

  if (!success || !exercises) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold">Failed to load exercises</h1>
        <p className="text-muted-foreground">Please try again later.</p>
        <Link href="/dashboard" className="mt-4">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reading Practice</h1>
            <p className="text-muted-foreground mt-2">Choose an exercise to practice your IELTS reading skills</p>
          </div>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <FilterableExerciseList exercises={exercises} moduleType="reading" />
      </Suspense>
    </div>
  );
};

export default ReadingPracticePage;
