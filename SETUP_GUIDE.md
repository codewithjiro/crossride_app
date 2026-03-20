#!/bin/bash

# CrossRide - Database & User Setup Guide

echo "==================================="
echo "CrossRide Setup Instructions"
echo "==================================="
echo ""

# Step 1: Environment Setup

echo "STEP 1: Setup Environment Variables"
echo "-----------------------------------"
echo "1. Copy .env.example to .env.local:"
echo " cp .env.example .env.local"
echo ""
echo "2. Fill in your environment variables in .env.local:"
echo " - DATABASE_URL: PostgreSQL connection string"
echo " Format: postgresql://user:password@localhost:5432/cross_ride"
echo " - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: From Clerk dashboard"
echo " - CLERK_SECRET_KEY: From Clerk dashboard"
echo ""

# Step 2: Database Setup

echo "STEP 2: Setup PostgreSQL Database"
echo "-----------------------------------"
echo "Option A: Using Docker"
echo " docker run --name cross_ride_db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=cross_ride -p 5432:5432 -d postgres:latest"
echo ""
echo "Option B: Using Local PostgreSQL"
echo " createdb cross_ride"
echo ""

# Step 3: Run Migrations

echo "STEP 3: Run Database Migrations"
echo "-----------------------------------"
echo "Push schema to database:"
echo " pnpm db:push"
echo ""
echo "Or generate migrations first:"
echo " pnpm db:generate"
echo " pnpm db:migrate"
echo ""

# Step 4: Create Admin User

echo "STEP 4: Create Admin User"
echo "-----------------------------------"
echo "1. Sign up with your email using the app's sign-up page"
echo "2. Copy your Clerk userId (format: user_xxx)"
echo "3. Make request to create admin endpoint:"
echo " POST http://localhost:3000/api/admin/init"
echo " Body: { userId: 'user_xxx' }"
echo ""
echo "Or use direct database access:"
echo " UPDATE users SET role = 'admin' WHERE user_id = 'your_clerk_user_id';"
echo ""

# Step 5: Regular User Registration

echo "STEP 5: Regular User Registration"
echo "-----------------------------------"
echo "Users register automatically via Clerk:"
echo "1. Click 'Sign Up' on the app"
echo "2. Enter email and password"
echo "3. User is created in database with role='user' by default"
echo "4. User can immediately use the user dashboard"
echo ""

# Step 6: Verification

echo "STEP 6: Verify Setup"
echo "-----------------------------------"
echo "1. Check database connection: pnpm db:studio"
echo "2. Login to admin account: http://localhost:3000/sign-in"
echo "3. Verify admin dashboard loads: http://localhost:3000/admin/dashboard"
echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
