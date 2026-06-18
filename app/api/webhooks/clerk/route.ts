import { createClerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { UserRole, Plan } from "@prisma/client";

export async function POST(req: Request) {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error("Missing webhook secret");
  }

  // 2. Get the Message from Clerk
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error:Missing headers", { status: 400 });
  }

  // 3. Read the message body
  const body = await req.text();
  console.log("Body length:", body.length);

  // 4. Verify the message
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // 5. Handle different types of events
  const eventType = event.type;

  // When a new user signs up
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    if (!email_addresses || email_addresses.length === 0) {
      console.error("Error: No email addresses found in webhook event");
      return new Response("Error: Missing email address", { status: 400 });
    }

    const email = email_addresses[0].email_address;
    const userData = {
      email: email,
      firstName: first_name || null,
      lastName: last_name || null,
      imgUrl: image_url || null,
      role: UserRole.STUDENT,
      plan: Plan.FREE,
    };

    try {
      // Use upsert to handle both creation and updates safely
      const dbUser = await prisma.user.upsert({
        where: { clerkId: id },
        update: userData,
        create: {
          clerkId: id,
          ...userData,
        },
      });

      // Sync DB ID back to Clerk Metadata if it was a creation or missing
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          dbUserId: dbUser.id,
          role: UserRole.STUDENT,
          plan: Plan.FREE,
        },
      });

      console.log(`User processed (${eventType}): ${email}`);
      return new Response("User Synced", { status: 200 });
    } catch (error) {
      console.error(`Error processing user ${eventType}:`, error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  // When user deletes their account
  if (eventType === "user.deleted") {
    const { id } = event.data;
    try {
      // Delete user from database
      await prisma.user.delete({
        where: {
          clerkId: id,
        },
      });
      console.log(`User deleted: ${id}`);
    } catch (error) {
      console.error("Error deleting user from database:", error);
      return new Response("Error: Could not delete user", { status: 500 });
    }
  }

  return new Response("Success", { status: 200 });
}
