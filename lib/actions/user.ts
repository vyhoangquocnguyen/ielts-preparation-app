import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
// Get current user from database


export async function getCurrentUser() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }
    const user = await prisma.user.findUnique({
        where: {
            clerkId: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}