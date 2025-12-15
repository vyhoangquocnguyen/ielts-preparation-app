import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBarIcon, UserIcon } from "@heroicons/react/24/outline";

import ProfileForm from "@/components/dashboard/profileForm";

const ProfilePage = async () => {
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
        <div className="flex flex-col items-center gap-y-2">
          <p className="text-muted-foreground">User not found. Please try signing out and signing in again.</p>
          <Link href="/sign-in" className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in justify-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information and study preferences.</p>
      </div>

      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="font-medium">🔥{user.currentStreak} days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="font-medium">{user.longestStreak} days</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details and study goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </div>

      {/* Study Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Study Statistics
          </CardTitle>
          <CardDescription>Your overall progess and achievements</CardDescription>
        </CardHeader>
        <CardContent >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Study Time</p>
              <p className="text-xl font-bold">
                {Math.floor(user.totalStudyTime / 60)}h {user.totalStudyTime % 60}m
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Target Score</p>
              <p className="text-xl font-bold">{user.targetScore || "Not Set"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Study Goal</p>
              <p className="text-xl font-bold capitalize">{user.studyGoal || "Not Set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
