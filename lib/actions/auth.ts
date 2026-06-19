'use server'

import { auth, currentUser, createClerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * Helper to get the authenticated Database ID from the JWT.
 * This prevents repeated Clerk-to-Prisma lookups.
 * Includes a Just-In-Time (JIT) provisioning fallback if metadata is missing.
 */

export async function getAuthenticatedId() {
  const { sessionClaims, userId: clerkId } = await auth();

  // 1. Try to get ID from session claims (Optimized path)
  const dbUserId = sessionClaims?.metadata?.dbUserId as string | undefined;

  if (dbUserId) return dbUserId;

  // 2. Fallback: No ID in session (either new user or metadata not synced yet)
  if (!clerkId) {
    throw new Error("Unauthorized: No Clerk ID found");
  }

  // 3. Check database by clerkId
  let user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true }
  });

  // 4. If not in DB, create user (JIT Provisioning)
  // This handles cases where the webhook might be delayed or not set up (local dev)
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("User not found in Clerk");

    const email = clerkUser.emailAddresses[0]?.email_address;
    if (!email) throw new Error("User has no email address");

    user = await prisma.user.create({
      data: {
        clerkId: clerkId,
        email: email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imgUrl: clerkUser.imageUrl,
        role: "STUDENT",
        plan: "FREE",
      },
      select: { id: true }
    });
  }

  // 5. Sync metadata back to Clerk so next request is fast (via JWT metadata)
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  await clerkClient.users.updateUserMetadata(clerkId, {
    publicMetadata: {
      dbUserId: user.id,
      role: "STUDENT",
      plan: "FREE",
    },
  });

  return user.id;
}
