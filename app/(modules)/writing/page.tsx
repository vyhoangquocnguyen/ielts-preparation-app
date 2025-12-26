import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import FilterableExerciseList from "@/components/module/filterExerciseList";
import { getWritingTasks } from "@/lib/actions/writing";

export default async function WritingPracticePage() {
    const tasks = await getWritingTasks();
    return <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-y-2 p-2">
            <Link href="/dashboard">
                <Button variant="outline" className="gap-2 rounded-lg">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Dashboard
                </Button>
            </Link>
            <div className="flex items-center justify-center text-center p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Writing Practice</h1>
                    <p className="text-muted-foreground mt-2">Choose a task to practice your IELTS writing skills</p>
                </div>
            </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <FilterableExerciseList exercises={tasks} moduleType="writing" />
      </Suspense>
  </div>;
}
