'use server'

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * Helper to get the authenticated Database ID from the JWT.
 * This prevents repeated Clerk-to-Prisma lookups.
 */

export async function getAuthenticatedId() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No session found");
  }

  const dbUserId = sessionClaims?.metadata.dbUserId;

  // Fallback: If metadata sync is delayed, look up by Clerk ID
  if (!dbUserId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) {
      throw new Error("User not found in database. Please ensure signup webhook completed.");
    }

    return user.id;
  }

  return dbUserId;
}
