import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    // Look up user in database
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      role: user.role,
      userId: user.id,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 200 }
    );
  }
}
