import { db } from "~/server/db";
import { notifications, bookings, trips } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export type NotificationType =
  | "driver_conflict"
  | "van_conflict"
  | "both_conflict";

interface CreateNotificationParams {
  userId: string;
  bookingId: number;
  tripId: number;
  type: NotificationType;
  message: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    console.log("🔔 Creating notification:", {
      userId: params.userId,
      bookingId: params.bookingId,
      tripId: params.tripId,
      type: params.type,
      message: params.message.substring(0, 50) + "...",
    });

    const title = getTitleForNotificationType(params.type);

    const result = await db
      .insert(notifications)
      .values({
        userId: params.userId,
        bookingId: params.bookingId,
        tripId: params.tripId,
        type: params.type,
        title,
        message: params.message,
        isRead: false,
      })
      .returning();

    console.log("✅ Notification created successfully:", result[0]?.id);
    return { success: true, message: "Notification created", data: result[0] };
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    throw error;
  }
}

/**
 * Get title for notification type
 */
function getTitleForNotificationType(type: NotificationType): string {
  switch (type) {
    case "driver_conflict":
      return "⚠️ Driver Scheduling Conflict";
    case "van_conflict":
      return "⚠️ Van Scheduling Conflict";
    case "both_conflict":
      return "⚠️ Driver & Van Scheduling Conflict";
    default:
      return "⚠️ Scheduling Conflict";
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: string) {
  try {
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });

    return userNotifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    const result = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
    });

    return result.filter((n) => !n.isRead).length;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  try {
    const result = await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read");
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(eq(notifications.userId, userId));

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error("Failed to mark notifications as read");
  }
}
