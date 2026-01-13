import React, { Suspense } from "react";

export const metadata = {
  title: "Analytics | IELTS Prep",
  description: "Track your progress and identify areas for improvement",
};
interface Props {
  searchParams: {
    range?: string;
  };
}

export default function Page({ searchParams }: Props) {
  const timeRange = parseInt(searchParams.range || "30");

  return (
    <div className="min-h-screen ">
          <div className="container mx-auto px-4 py-6 space-y-6">
              {/* Header */}

              {/* Content */}
              <section>
                  <Suspense fallback={"... loading"}>
                      {/* <Analytics timeRange={timeRange} /> */}
                  </Suspense>
              </section>
      </div>
    </div>
  );
}
