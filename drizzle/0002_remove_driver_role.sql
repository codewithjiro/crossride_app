-- Migration: Remove role field from driver table
-- This migration removes the role column that is no longer needed

-- Drop the role column
ALTER TABLE cross_ride_driver DROP COLUMN "role";
