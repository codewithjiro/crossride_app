import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/webhooks/clerk
 * Clerk webhook handler for user events
 * 
 * Clerk sends webhook events for:
 * - user.created: New user signs up
 * - user.updated: User profile changes
 * - user.deleted: User account deleted
 * 
 * Environment: CLERK_WEBHOOK_SECRET from Clerk dashboard
 */
export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Verify signature
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: { type: string; data: { id?: string; email_addresses?: Array<{ email_address: string }> } };
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as { type: string; data: { id?: string; email_addresses?: Array<{ email_address: string }> } };
  } catch (err) {
    console.error("Failed to verify webhook:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (evt.type === "user.created") {
      const userId = evt.data.id;
      if (!userId) {
        return Response.json({ error: "No user ID in webhook" }, { status: 400 });
      }

      // Check if user already exists (shouldn't happen but just in case)
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        // Create new user with role='user' by default
        await db.insert(users).values({
          id: userId,
          email: evt.data.email_addresses?.[0]?.email_address ?? "",
          role: "user",
        });

        console.log(`✅ New user created: ${userId}`);
      }

      return Response.json({ success: true, message: "User created" }, { status: 200 });
    }

    if (evt.type === "user.deleted") {
      const userId = evt.data.id;
      if (!userId) {
        return Response.json({ error: "No user ID in webhook" }, { status: 400 });
      }

      // Optionally delete user from database
      await db.delete(users).where(eq(users.id, userId));

      console.log(`✅ User deleted: ${userId}`);
      return Response.json({ success: true, message: "User deleted" }, { status: 200 });
    }

    if (evt.type === "user.updated") {
      // Handle user updates if needed (e.g., profile changes)
      // Currently just log it
      console.log(`✅ User updated: ${evt.data.id}`);
      return Response.json({ success: true, message: "User updated" }, { status: 200 });
    }

    return Response.json({ success: true, message: "Event processed" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
