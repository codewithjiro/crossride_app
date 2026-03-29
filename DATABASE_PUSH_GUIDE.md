# Database Push Instructions - Neon PostgreSQL

## Your Database Connection

Your database is hosted on **Neon** (serverless PostgreSQL). Based on your `.env.local`:

```
Host: ep-fragrant-snow-a1bwj324-pooler.ap-southeast-1.aws.neon.tech
Database: neondb
User: neondb_owner
Region: Asia Pacific (Singapore)
Connection String: postgresql://neondb_owner:npg_9yoLDzmTHq5c@ep-fragrant-snow-a1bwj324-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

---

## Method 1: Using Drizzle Kit (RECOMMENDED) ⭐

This is the easiest and most reliable method.

### Step 1: Generate the migration (if not already done)

```bash
cd c:\Users\Jiro\Documents\ReactProjects\crossride_app
pnpm drizzle-kit generate
```

### Step 2: Review the migration

Check the generated file at: `drizzle/0001_split_driver_name.sql`

### Step 3: Push to Neon

```bash
pnpm drizzle-kit push
```

**Expected Output:**

```
✓ Migration pushed successfully!
Migrations applied: 1
```

---

## Method 2: Using Neon Web Console

### Step 1: Go to Neon Console

Visit: https://console.neon.tech

### Step 2: Navigate to SQL Editor

- Login with your Neon account
- Select your project
- Go to "SQL Editor" tab

### Step 3: Execute Migration

- Copy the contents of `drizzle/0001_split_driver_name.sql`
- Paste into the SQL Editor
- Click "Run" button

### Step 4: Confirm Success

You should see a message like: "Query executed successfully"

---

## Method 3: Using psql Command Line

### Step 1: Ensure psql is installed

```bash
psql --version
```

If not installed, download from: https://www.postgresql.org/download/

### Step 2: Run the migration

Replace the connection string with your actual one:

```bash
psql "postgresql://neondb_owner:npg_9yoLDzmTHq5c@ep-fragrant-snow-a1bwj324-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" < drizzle/0001_split_driver_name.sql
```

Or on Windows (PowerShell):

```powershell
(Get-Content drizzle/0001_split_driver_name.sql) | psql "postgresql://neondb_owner:npg_9yoLDzmTHq5c@ep-fragrant-snow-a1bwj324-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

---

## Verify the Migration Worked

After pushing the migration, verify it was successful:

### Option A: Using Neon Console

1. Go to SQL Editor in Neon Console
2. Run this query:

```sql
SELECT * FROM cross_ride_driver LIMIT 1;
```

3. Check that these columns exist:
   - `firstName`
   - `middleName`
   - `surname`

4. Verify the `name` column is gone

### Option B: Using Drizzle Studio

```bash
pnpm drizzle-kit studio
```

This opens a local UI to inspect your database schema.

---

## Sample Verification Query

Run this in Neon Console to check the migration:

```sql
-- Check the table structure
\d cross_ride_driver

-- Check existing driver data was migrated
SELECT id, firstName, middleName, surname FROM cross_ride_driver LIMIT 5;

-- Verify no 'name' column exists (should return zero)
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name='cross_ride_driver' AND column_name='name';
```

---

## Expected Results

After successful migration:

```
 id │ firstName  │ middleName │ surname  │ email            │ ...
────┼────────────┼────────────┼──────────┼──────────────────┼─...
  1 │ Jiro       │            │ Gonzales │ jiro@crossride.c │
  2 │ Jenah      │            │ Ambagan  │ jenah@crossride. │
  3 │ Joyce      │            │ Manaloto │ joyce@crossride. │
  4 │ Venice     │            │ Bumagat  │ venice@crossride │
```

---

## Troubleshooting

### Issue: "Column 'name' does not exist"

**Solution:** This is expected! The migration successfully deleted the old `name` column. This means the migration worked correctly. Now run the application code which uses the new fields.

### Issue: Drizzle Kit push fails with permission error

**Solution:**

- Make sure your DATABASE_URL environment variable is correctly set in `.env.local`
- Check that your Neon password hasn't expired
- Go to Neon console and regenerate the connection string if needed

### Issue: Migration timeout on large database

**Solution:**

- Use the Neon Console web interface instead of Drizzle Kit
- Wait for the migration to complete (can take a few minutes for large databases)

### Issue: "relation 'cross_ride_driver' does not exist"

**Solution:**

- Check that you're connected to the correct database
- Make sure you've created the tables (run initial setup if not done)

---

## Rollback (if needed)

If something goes wrong, you can rollback the migration:

1. **Restore backup** (if you made one)
2. **Or manually recreate the `name` column:**

```sql
-- Add back the old name column
ALTER TABLE cross_ride_driver ADD COLUMN "name" varchar(255);

-- Populate it from the new fields
UPDATE cross_ride_driver SET "name" = firstName || ' ' || COALESCE(middleName || ' ', '') || surname;

-- Drop the new columns
ALTER TABLE cross_ride_driver DROP COLUMN firstName;
ALTER TABLE cross_ride_driver DROP COLUMN middleName;
ALTER TABLE cross_ride_driver DROP COLUMN surname;
```

---

## After Migration: Deploy Code

Once the database migration is successful:

1. **Commit your code changes:**

```bash
git add -A
git commit -m "feat: split driver name into firstName, middleName, surname"
```

2. **Push to remote:**

```bash
git push origin main
```

3. **Redeploy your application:**

- If using Vercel: Auto-deploys on push
- If using other platform: Follow your deployment process

4. **Test the application:**
   - Go to admin/drivers page
   - Try adding a new driver (should see 3 separate name fields)
   - Try editing an existing driver
   - Verify names display correctly

---

## Environment Variables

No changes needed! Your existing `.env.local` is perfect:

```
DATABASE_URL=postgresql://neondb_owner:npg_9yoLDzmTHq5c@ep-fragrant-snow-a1bwj324-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

---

## Next Steps

1. ✅ Review the migration file: `drizzle/0001_split_driver_name.sql`
2. ✅ Push the migration using one of the 3 methods above
3. ✅ Verify the migration using the verification queries
4. ✅ Deploy the code changes
5. ✅ Test the application

---

## Support

- **Neon Documentation:** https://neon.tech/docs
- **Drizzle Documentation:** https://orm.drizzle.team
- **Check migration status:** See the "Migrations" tab in Neon Console
