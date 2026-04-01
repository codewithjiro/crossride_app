-- Migration: Add notifications table for user notifications
-- Stores conflict notifications and other user-facing alerts

-- Create notification_type enum
CREATE TYPE notification_type AS ENUM ('driver_conflict', 'van_conflict', 'both_conflict');

-- Create notifications table
CREATE TABLE cross_ride_notification (
  id SERIAL PRIMARY KEY,
  "userId" varchar(255) NOT NULL REFERENCES cross_ride_user(id),
  "bookingId" INTEGER REFERENCES cross_ride_booking(id),
  "tripId" INTEGER REFERENCES cross_ride_trip(id),
  type notification_type NOT NULL,
  title varchar(255) NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX notification_user_idx ON cross_ride_notification("userId");
CREATE INDEX notification_booking_idx ON cross_ride_notification("bookingId");
CREATE INDEX notification_type_idx ON cross_ride_notification(type);
CREATE INDEX notification_isRead_idx ON cross_ride_notification("isRead");
CREATE INDEX notification_created_idx ON cross_ride_notification("createdAt");
