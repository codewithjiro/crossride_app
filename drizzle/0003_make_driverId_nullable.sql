-- Migration: Make driverId nullable in trips table
-- Allows trips to be created without driver assignment initially
-- Driver will be assigned by admin after trip request approval

-- Drop the NOT NULL constraint on driverId column
ALTER TABLE cross_ride_trip ALTER COLUMN "driverId" DROP NOT NULL;
