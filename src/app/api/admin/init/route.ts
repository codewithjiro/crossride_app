import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * POST /api/admin/init
 * Initialize an admin user (first setup only)
 * 
 * This endpoint creates or promotes a user to admin role.
 * Use this to set up your first admin account.
 * 
 * Body: { userId: 'user_xxx' } or leave empty to use current user
 * 
 * Security: This is unrestricted for first admin setup.
 * In production, you should:
 * 1. Protect this behind an environment variable
 * 2. Rate limit the endpoint
 * 3. Log all admin creations
 * 4. Restrict to specific email domains
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: bodyUserId } = (await request.json()) as { userId?: string };

    // Get current authenticated user from Clerk
    const { userId: clerkUserId } = await auth();

    if (!bodyUserId && !clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized: No user ID provided or not authenticated" },
        { status: 401 }
      );
    }

    const userId = bodyUserId ?? clerkUserId;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Check if user exists in database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      // Create new user as admin
      await db.insert(users).values({
        id: userId,
        email: "", // Will be synced from Clerk later
        role: "admin",
      });

      return NextResponse.json(
        {
          success: true,
          message: "Admin user created successfully",
          userId,
          role: "admin",
        },
        { status: 201 }
      );
    }

    // Update existing user to admin
    if (existingUser.role === "admin") {
      return NextResponse.json(
        {
          success: true,
          message: "User is already an admin",
          userId,
          role: "admin",
        },
        { status: 200 }
      );
    }

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId));

    return NextResponse.json(
      {
        success: true,
        message: "User promoted to admin successfully",
        userId,
        role: "admin",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize admin user" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/init
 * Check admin setup status - returns count of admin users
 */
export async function GET() {
  try {
    const adminUsers = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.role, "admin"),
    });

    return NextResponse.json({
      adminCount: adminUsers.length,
      admins: adminUsers.map((u) => ({ userId: u.id, role: u.role })),
      isSetup: adminUsers.length > 0,
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}
