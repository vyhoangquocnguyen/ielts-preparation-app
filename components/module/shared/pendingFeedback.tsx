"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PendingFeedback({ title }: { title: string }) {
  const router = useRouter();

  useEffect(() => {
    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-10 pb-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">AI</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Generating AI Feedback</h2>
            <p className="text-muted-foreground">Our AI is analyzing your {title} response...</p>
          </div>

          <div className="pt-4">
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground/60 italic">
            This usually takes 10-20 seconds. Thank you for your patience!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
