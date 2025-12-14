import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
          <button className="btn btn-primary">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Profile</h1>
      </div>
    </div>
  );
};

export default ProfilePage;
