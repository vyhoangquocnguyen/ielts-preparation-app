import { getWritingTaskById } from "@/lib/actions/writing";
import { notFound } from "next/navigation";
import WritingEditor from "@/components/module/writing/writingEditor";

export async function generateMetadata({ params }: { params: Promise<{ taskId: string }> }) {
  const taskId = (await params).taskId;
  const task = await getWritingTaskById(taskId);
  if (!task) {
    return { title: "Task not found" };
  }
  return {
    title: `${task.title} | IELTS Preparation`,
    description: task.prompt.substring(0, 160),
  };
}

export default async function WritingTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const taskId = (await params).taskId;
  const task = await getWritingTaskById(taskId);
  if (!task) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <WritingEditor task={task} />
    </div>
  );
}
