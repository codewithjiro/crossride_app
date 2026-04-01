import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { users, notifications } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { markNotificationAsRead } from "~/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notificationId = parseInt(params.id);

    if (!notificationId) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 },
      );
    }

    // Verify notification belongs to the user
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedNotification = await markNotificationAsRead(notificationId);

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}
