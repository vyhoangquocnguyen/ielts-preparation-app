import FilterableExerciseList from "@/components/module/filterExerciseList";
import { Button } from "@/components/ui/button";
import { getListeningExercises } from "@/lib/actions/listening";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Listening Exercise | IELTS Prep",
  description: "Practice IELTS listening with authentic materials",
};
const ListeningPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; category?: string }>;
}) => {
  const resolvedParams = await searchParams;
  const { success, data: exercises } = await getListeningExercises(resolvedParams);

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Listening Practice</h1>
            <p className="text-muted-foreground mt-2">Choose an exercise to practice your IELTS listening skills</p>
          </div>
        </div>

        <Suspense fallback={<p>Loading...</p>}>
          <FilterableExerciseList exercises={exercises} moduleType="listening" />
        </Suspense>
      </div>
    </div>
  );
};

export default ListeningPage;
