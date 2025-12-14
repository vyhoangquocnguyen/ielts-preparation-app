import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BoltIcon, BookOpenIcon, ChartBarIcon, ClockIcon, FireIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";
import { getDashboardStatistics, getRecentActivity } from "@/lib/actions/user";
import { formatRelativeTime, getScoreColor } from "@/lib/utils";
import StatsCard from "@/components/dashboard/statsCard";
const DashboardPage = async () => {
  // Authentication
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">User not found. Please try signing out and signing in again.</p>
      </div>
    );
  }
  // Fetch dashboard data
  const [stats, recentActivity] = await Promise.all([getDashboardStatistics(user.id), getRecentActivity(user.id, 5)]);

  // Calculate overall average score
  const score = Object.values(stats.averageScore).filter((s): s is number => s !== null && s > 0);
  const overallAverageScore = score.length > 0 ? score.reduce((acc, val) => acc + val, 0) / score.length : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back, {user.firstName || "Student"}!
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">Your process overview. Keep up the great work!</p>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Streak Card */}
        <StatsCard
          title="Current Streak"
          value={`${user.currentStreak ?? 0} days`}
          icon={FireIcon}
          description={
            (user.currentStreak ?? 0) > 0 ? `Longest: ${user.longestStreak ?? 0} days` : "Start learning today"
          }
          iconColor="text-orange-500"
        />

        {/* Exercise Completed Card */}
        <StatsCard
          title="Exercise Completed"
          value={`${stats.exerciseCompleted}`}
          icon={BookOpenIcon}
          description="Total across all modules"
          iconColor="text-blue-500"
        />
        {/* Study Time Card */}
        <StatsCard
          title="Study Time"
          value={`${Math.floor((stats.totalStudyTime ?? 0) / 60)}h ${(stats.totalStudyTime ?? 0) % 60}m`}
          icon={ClockIcon}
          description={"Total study time"}
          iconColor="text-green-500"
        />
        {/* Average Score Card */}
        <StatsCard
          title="Average Score"
          value={`${overallAverageScore > 0 ? overallAverageScore.toFixed(1) : "N/A"}`}
          icon={TrophyIcon}
          description={user.targetScore ? `Target: ${user.targetScore}` : `Set a target score`}
          iconColor="text-purple-500"
        />
      </div>
      {/* Progress */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex items-center">
          <CardTitle className="flex items-center gap-x-1">
            <ChartBarIcon className="size-5" />
            Module Progress
          </CardTitle>
          <CardDescription>Your average performance by module</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2">
          <ModuleScore
            name="Listening"
            score={stats.averageScore.listening ?? 0}
            count={stats.moduleCounts.listening}
          />
          <ModuleScore name="Reading" score={stats.averageScore.reading ?? 0} count={stats.moduleCounts.reading} />
          <ModuleScore name="Writing" score={stats.averageScore.writing ?? 0} count={stats.moduleCounts.writing} />
          <ModuleScore name="Speaking" score={stats.averageScore.speaking ?? 0} count={stats.moduleCounts.speaking} />
        </CardContent>
      </Card>
      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex items-center">
          <CardTitle className="flex items-center gap-x-1">
            <ClockIcon className="size-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your recent activity activities</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between py-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.exerciseTitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground capitalize">{activity.moduleType}</span>
                    <span className="text-xs text-muted-foreground ">.</span>
                    <span className="text-xs text-muted-foreground ">{formatRelativeTime(activity.completedAt)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex items-center">
          <CardTitle className="flex items-center gap-x-1">
            <BoltIcon className="size-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Let's get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/listening">
              <Button variant="outline" className="w-full hover:cursor-pointer">
                Listening Practice
              </Button>
            </Link>
            <Link href="/reading">
              <Button variant="outline" className="w-full hover:cursor-pointer">
                Reading Practice
              </Button>
            </Link>
            <Link href="/writing">
              <Button variant="outline" className="w-full hover:cursor-pointer">
                Writing Practice
              </Button>
            </Link>
            <Link href="/speaking">
              <Button variant="outline" className="w-full hover:cursor-pointer">
                Speaking Practice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function ModuleScore({ name, score, count }: { name: string; score: number; count: number }) {
  const percentage = (score / 9) * 100;
  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground">
          {count} {count === 1 ? "exercise" : "exercises"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200  rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
          <div
            className="bg-linear-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className={`text-sm font-semibold min-w-12 text-right ${getScoreColor(score)}`}>
          {score > 0 ? score.toFixed(1) : "N/A"}
        </span>
      </div>
    </div>
  );
}
export default DashboardPage;
