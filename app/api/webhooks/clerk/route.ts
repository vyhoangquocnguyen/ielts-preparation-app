import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing webhook secret");
  }

  // 2. Get the Message from Clerk
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Response("Error:Missing headers", { status: 400 });
  }

  // 3. Read the message body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 4. Verify the message
  const wh = new Webhook(WEBHOOK_SECRET);
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
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    try {
      // Create user in database
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imgUrl: image_url || null,
        },
      });
      console.log(`User creaated: ${email_addresses[0].email_address}`);
    } catch (error) {
      console.error("Error creating user in database:", error);
      return new Response("Error: Could not create user", { status: 500 });
    }
  }

  // When user updates their profile
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    try {
      // Update user in database
      await prisma.user.update({
        where: {
          clerkId: id,
        },
        data: {
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imgUrl: image_url || null,
        },
      });
      console.log(`User updated: ${email_addresses[0].email_address}`);
    } catch (error) {
      console.error("Error updating user in database:", error);
      return new Response("Error: Could not update user", { status: 500 });
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
