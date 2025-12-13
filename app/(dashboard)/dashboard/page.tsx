import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBarIcon, ClockIcon, PlusIcon } from "@heroicons/react/24/outline";
const DashboardPage = async () => {
  // Authentication
  //   const { userId } = auth();

    // Fetch User Data

    // const user = await prisma.user.findUnique({
    //     where: {
    //     //   clerkId: userId, << after finishing authentication
    //     email:"abc@gmail.com"
    //   },
    // });
    

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {/* Welcome back, {user.firstName || "Student"}! */}
          Welcome back, Student!
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">Your process overview. Keep up the great work!</p>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* First Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">This is the streak</div>
        {/* Second Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">This is the Exercise completed</div>
        {/* Third Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">This is the study time</div>
        {/* Fourth Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">This is the avg score</div>
      </div>
      {/* Progress */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <ChartBarIcon className="size-5" />
          <CardTitle>Module Progress</CardTitle>
          <CardDescription>Your average performance by module</CardDescription>
        </CardHeader>
      </Card>
      <CardContent>
        Modules Score Listening Modules Score Reading Modules Score Writing Modules Score Speaking
      </CardContent>
      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <ClockIcon className="size-5" />
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent activity listactivities</CardDescription>
        </CardHeader>
        <CardContent>
          Modules Score Listening Modules Score Reading Modules Score Writing Modules Score Speaking
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <PlusIcon className="size-5" />
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/listening">
              <Button variant="outline" className="w-full">
                Listening Practice
              </Button>
            </Link>
            <Link href="/reading">
              <Button variant="outline" className="w-full">
                Reading Practice
              </Button>
            </Link>
            <Link href="/writing">
              <Button variant="outline" className="w-full">
                Writing Practice
              </Button>
            </Link>
            <Link href="/speaking">
              <Button variant="outline" className="w-full">
                Speaking Practice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
