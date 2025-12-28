import { getSpeakingExercises } from "@/lib/actions/speaking";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import FilterableExerciseList from "@/components/module/filterExerciseList";

export const metadata = {
  title: "Speaking Practice | IELTS Prep",
  description: "Practice IELTS speaking with authentic materials",
};

const SpeakingPracticePage = async ({ searchParams }: { searchParams: Promise<{ part?: string }> }) => {
  const resolvedParams = await searchParams;
  const { success, exercises } = await getSpeakingExercises(resolvedParams);

  if (!success || !exercises) {
    return (
      <div className="container flex flex-col gap-y-2 justify-center items-center mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold ">Something went wrong</h1>
          <p className="text-muted-foreground">Please check again later.</p>
        </div>
        <Link href="/dashboard" className="mt-4">
          <Button variant="outline" className="gap-2 rounded-lg">
            <ArrowLeftIcon className="h-4 w-4" />
            Dashboard
          </Button>
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
          {/* Title & Description */}
          <div className="flex flex-col gap-y-2 p-2">
            <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
            <p className="text-muted-foreground">Choose an exercise to practice your IELTS speaking skills</p>
          </div>
        </div>
      </div>
      <FilterableExerciseList exercises={exercises} moduleType="speaking" />
    </div>
  );
};

export default SpeakingPracticePage;
