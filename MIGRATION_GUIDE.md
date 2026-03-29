# Database Migration Instructions

This guide explains how to apply the database schema changes to your Neon PostgreSQL database.

## Overview of Changes

The driver name field has been split into three separate fields:

- `firstName` (required) - First name
- `middleName` (optional) - Middle name
- `surname` (required) - Surname

This replaces the previous single `name` field.

## Migration Steps

### Option 1: Using Drizzle Kit (Recommended)

1. Install Drizzle Kit if not already installed:

```bash
pnpm install -D drizzle-kit
```

2. Generate migration:

```bash
pnpm drizzle-kit generate
```

3. Push migration to Neon:

```bash
pnpm drizzle-kit push
```

### Option 2: Manual SQL Execution (Via Neon Console)

1. Go to https://console.neon.tech
2. Navigate to your database
3. Open the SQL Editor
4. Paste the contents of the migration file: `drizzle/0001_split_driver_name.sql`
5. Execute the query

### Option 3: Using psql Command

```bash
# Replace with your actual connection string from .env.local
psql "postgresql://neondb_owner:npg_9yoLDzmTHq5c@ep-fragrant-snow-a1bwj324-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" < drizzle/0001_split_driver_name.sql
```

## What the Migration Does

1. **Adds three new columns** to the `cross_ride_driver` table:
   - `firstName` varchar(255) NOT NULL
   - `middleName` varchar(255) NULLABLE
   - `surname` varchar(255) NOT NULL

2. **Migrates existing data** from the `name` field:
   - First word → `firstName`
   - Last word → `surname`
   - Middle words (if any) → `middleName`

3. **Drops the old `name` column** after migration is complete

## Smart Split Logic

The migration uses this logic to split names:

- "Jiro Gonzales" → firstName: "Jiro", surname: "Gonzales"
- "John Paul Smith" → firstName: "John", middleName: "Paul", surname: "Smith"

## Application Changes

The following components have been updated to use the new fields:

### Admin Components

- ✅ `src/components/admin/add-driver-modal.tsx` - Split into 3 input fields
- ✅ `src/components/admin/edit-driver-modal.tsx` - Split into 3 input fields
- ✅ `src/components/admin/drivers-table-wrapper.tsx` - Combined display
- ✅ `src/components/admin/driver-table-row.tsx` - Combined display
- ✅ `src/components/admin/trip-details-modal.tsx` - Combined display

### API Routes

- ✅ `src/app/api/admin/drivers/route.ts` - Updated POST endpoint
- ✅ `src/app/api/admin/drivers/[id]/route.ts` - Updated PATCH endpoint

### User Pages

- ✅ `src/app/(user)/request-trip/page.tsx` - Updated display logic
- ✅ `src/app/(user)/my-bookings/[id]/edit/page.tsx` - References updated

### Database Schema

- ✅ `src/server/db/schema.ts` - Updated driver table schema

## Testing the Migration

After running the migration:

1. Check the database schema:

```sql
\d cross_ride_driver
```

2. Verify data was migrated correctly:

```sql
SELECT id, firstName, middleName, surname FROM cross_ride_driver LIMIT 5;
```

3. Test adding a new driver in the admin panel (should split names properly in 3 fields)

## Rollback (if needed)

If you need to rollback the migration, you can create a reverse migration. Contact your developer for assistance.

## Environment Variables

No changes needed to `.env.local`. Your existing `DATABASE_URL` will work with the new schema.

## Support

If you encounter any issues with the migration:

1. Check the Neon console for error messages
2. Ensure your database connection string is correct
3. Verify all new columns were created successfully
4. Check that existing driver data was migrated correctly
