import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import ExerciseCard from "@/components/module/exerciseCard";
import { getReadingExercises } from "@/lib/actions/reading";
import FilterableExerciseList from "@/components/module/filterExerciseList";

const ReadingPracticePage = async () => {
  const exercises = await getReadingExercises();

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

      <FilterableExerciseList exercises={exercises} />

      {/* <div className="flex flex-col gap-y-2 justify-center p-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            All
          </Button>
          <Button variant="outline" size="sm">
            Easy
          </Button>
          <Button variant="outline" size="sm">
            Medium
          </Button>
          <Button variant="outline" size="sm">
            Hard
          </Button>
        </div>

        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold">No Exercises Available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for new reading exercises.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default ReadingPracticePage;
