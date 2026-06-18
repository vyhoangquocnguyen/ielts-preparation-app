'use server'

import { auth } from "@clerk/nextjs/server";

/**
 * Helper to get the authenticated Database ID from the JWT.
 * This prevents repeated Clerk-to-Prisma lookups.
 */

export async function getAuthenticatedId() {
  const { sessionClaims } = await auth();
  const dbUserId = sessionClaims?.metadata.dbUserId;

  if (!dbUserId) {
    throw new Error("Unauthorized: No Database ID found in session");
  }

  return dbUserId;
}
