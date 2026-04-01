"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface Notification {
  id: number;
  userId: string;
  bookingId: number | null;
  tripId: number | null;
  type: "driver_conflict" | "van_conflict" | "both_conflict";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markedAsReadIds, setMarkedAsReadIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      const response = await fetch(`/api/notifications/${notification.id}`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to mark as read");

      setMarkedAsReadIds((prev) => new Set(prev).add(notification.id));
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });

      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "driver_conflict":
      case "van_conflict":
      case "both_conflict":
        return <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />;
      default:
        return <Bell className="h-5 w-5 flex-shrink-0 text-blue-400" />;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "driver_conflict":
        return "Driver Conflict";
      case "van_conflict":
        return "Van Conflict";
      case "both_conflict":
        return "Driver & Van Conflict";
      default:
        return "Notification";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a2540] p-6 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-center py-32">
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a2540] p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Bell className="h-6 w-6 text-[#f1c44f]" />
                <h1 className="text-4xl font-bold text-white">Notifications</h1>
              </div>
              <p className="text-sm text-gray-400">
                {notifications.length} message
                {notifications.length !== 1 ? "s" : ""}
                {unreadCount > 0 && ` • ${unreadCount} unread`}
              </p>
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                className="gap-2 bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90"
              >
                <Eye size={16} />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="rounded-lg border border-gray-700/50 bg-gray-900/20 p-16 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-gray-600" />
            <h2 className="mb-2 text-lg font-semibold text-gray-300">
              No Notifications
            </h2>
            <p className="text-sm text-gray-400">
              You're all set. Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group rounded-lg border p-4 transition-all duration-200 ${
                  notification.isRead
                    ? "border-gray-700/30 bg-gray-900/40 hover:bg-gray-900/60"
                    : "border-gray-600/40 bg-gray-800/40 hover:bg-gray-800/60"
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-800/60 text-base">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs font-normal">
                        {getTypeLabel(notification.type)}
                      </Badge>
                    </div>

                    <p className="mb-2 line-clamp-2 text-sm text-gray-300">
                      {notification.message}
                    </p>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </span>

                      <div className="flex gap-2">
                        {notification.bookingId && (
                          <Link href={`/my-bookings/${notification.bookingId}`}>
                            <Button
                              size="sm"
                              className="h-8 gap-1.5 bg-[#f1c44f] text-xs font-medium text-[#071d3a] hover:bg-[#f1c44f]/90"
                            >
                              <ExternalLink size={12} />
                              Booking
                            </Button>
                          </Link>
                        )}

                        {!notification.isRead && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsRead(notification)}
                            className="h-8 gap-1.5 bg-gray-800 text-xs font-medium text-gray-300 hover:bg-gray-700"
                          >
                            <Eye size={12} />
                            Read
                          </Button>
                        )}

                        {notification.isRead && (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <CheckCircle2 size={12} />
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
