# CrossRide - Complete Setup Guide 🚀

This guide walks you through setting up the CrossRide application with database and user management.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Admin User Creation](#admin-user-creation)
5. [User Registration (Automatic)](#user-registration-automatic)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js**: v18+ (check with `node --version`)
- **pnpm**: v8+ (install with `npm install -g pnpm`)
- **PostgreSQL**: v14+ or Docker
- **Clerk Account**: Free tier at https://clerk.com
- **Git**: For version control

---

## Environment Setup

### 1. Create `.env.local` file

```bash
cp .env.example .env.local
```

### 2. Fill in environment variables

#### 🗄️ Database Connection
```
DATABASE_URL=postgresql://user:password@localhost:5432/cross_ride
```

**For Docker** (recommended):
```bash
# Start PostgreSQL container
docker run --name cross_ride_db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=cross_ride \
  -p 5432:5432 \
  -d postgres:latest

# Connection string:
DATABASE_URL=postgresql://postgres:password@localhost:5432/cross_ride
```

**For Local PostgreSQL**:
```bash
# Create database
createdb cross_ride

# Connection string (adjust user/password):
DATABASE_URL=postgresql://postgres:password@localhost:5432/cross_ride
```

#### 🔐 Clerk Authentication Keys

1. Go to https://clerk.com and create a free account
2. Create a new application
3. Get your keys from the Clerk dashboard:
   - **Publishable Key** (`pk_...`)
   - **Secret Key** (`sk_...`)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
```

##### Install Webhook Package
```bash
# Install svix for webhook verification
pnpm add svix
```

#### Webhook Setup (Important!)
1. In Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-app.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** to `CLERK_WEBHOOK_SECRET`

**Local Testing**: Use Clerk's development mode or ngrok to expose local server

---

## Database Setup

### Option 1: Using `pnpm db:push` (Recommended for Development)

```bash
# Push schema directly to database
pnpm db:push
```

This creates all tables automatically.

### Option 2: Using Migrations

```bash
# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate
```

### Verify Database Setup

```bash
# Open Drizzle Studio to view database
pnpm db:studio
```

Access at: http://localhost:5555

---

## Admin User Creation

### Method 1: Using API Endpoint (Recommended)

#### Step 1: Sign up on the app
1. Start the development server: `pnpm dev`
2. Go to http://localhost:3000/sign-up
3. Sign up with your email
4. Copy your Clerk User ID (visible in profile or console)

#### Step 2: Make promotion request
```bash
# Get admin status
curl http://localhost:3000/api/admin/init

# Response:
# {
#   "adminCount": 0,
#   "isSetup": false
# }
```

#### Step 3: Promote yourself to admin
```bash
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_xxx"}'

# Response:
# {
#   "success": true,
#   "message": "User promoted to admin successfully",
#   "userId": "user_xxx",
#   "role": "admin"
# }
```

### Method 2: Direct Database Access

Using Drizzle Studio or any PostgreSQL client:

```sql
-- View all users
SELECT * FROM users;

-- Update user to admin
UPDATE users 
SET role = 'admin' 
WHERE user_id = 'user_xxx';

-- Verify
SELECT user_id, role FROM users WHERE user_id = 'user_xxx';
```

---

## User Registration (Automatic)

Users are **automatically created** when they sign up through Clerk.

### Flow:
1. User visits app and clicks "Sign Up"
2. User enters email and password
3. Clerk creates account in Clerk system
4. Clerk webhook fires `user.created` event
5. Our webhook handler creates user in database with `role = 'user'`
6. User can immediately access the user dashboard

### Webhook Handler Location
```
src/app/api/webhooks/clerk/route.ts
```

---

## Testing

### Start the Application

```bash
pnpm dev
```

Visit: http://localhost:3000

### Test Flows

#### 1. Test User Registration
- [ ] Go to http://localhost:3000/sign-up
- [ ] Create account with email
- [ ] Verify redirect to user dashboard
- [ ] Check Drizzle Studio: User should appear in `users` table with `role='user'`

#### 2. Test Admin Dashboard
- [ ] Promote your user to admin (see [Admin User Creation](#admin-user-creation))
- [ ] Sign out
- [ ] Sign back in
- [ ] Should redirect to http://localhost:3000/admin/dashboard
- [ ] Verify all navigation links work: Dashboard → Vans → Drivers → Trips → Bookings → Logs → Settings

#### 3. Test Protected Routes
- [ ] Sign out
- [ ] Try accessing http://localhost:3000/admin/dashboard
- [ ] Should redirect to sign-in
- [ ] Try accessing http://localhost:3000/dashboard
- [ ] Should redirect to sign-in

#### 4. Test Admin Init Endpoint
```bash
# Check current status
curl http://localhost:3000/api/admin/init

# Create/promote admin
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_xxx"}'
```

---

## Database Schema

### Tables Created

1. **users**
   - `user_id` (Clerk ID, primary key)
   - `role` (enum: 'user' | 'admin')

2. **vans**
   - Fleet management

3. **drivers**
   - Driver information

4. **trips**
   - Routes and schedules

5. **bookings**
   - Passenger bookings

6. **adminLogs**
   - Audit trail

See [schema.ts](src/server/db/schema.ts) for full details.

---

## Environment Variables Reference

```env
# Database (required)
DATABASE_URL=postgresql://user:password@localhost:5432/cross_ride

# Clerk (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Node environment (optional)
NODE_ENV=development
```

---

## Troubleshooting

### "Cannot find module 'postgres'"
```bash
pnpm install
```

### "DATABASE_URL is invalid"
- Check PostgreSQL is running
- Verify connection string format
- Test with: `pnpm db:studio`

### "User not created after signup"
- Check CLERK_WEBHOOK_SECRET is set correctly
- Verify webhook is added in Clerk Dashboard
- Check server logs for webhook errors
- Restart the dev server: `pnpm dev`

### "Admin endpoint returns 401"
- Make sure you're signed in
- Use GET to check status: `curl http://localhost:3000/api/admin/init`
- Verify Clerk keys are correct

### "Can't access admin dashboard"
- Verify user role is 'admin' in database
- Check Clerk says authenticated in browser console
- Try signing out and back in
- Clear browser cache

### "Webhook not triggering"
- Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
- Check that webhook endpoint is publicly accessible
- In development, use Clerk's local testing or ngrok
- Check server logs when signing up

---

## Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm check            # Type check & lint
pnpm format:write     # Format code

# Database
pnpm db:push          # Sync schema to database
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio

# Building
pnpm build            # Build for production
pnpm start            # Start production server
```

---

## Next Steps

1. ✅ Database setup complete
2. ✅ Admin user created
3. 📱 Start building custom features:
   - Modal forms for creating vans, drivers, trips
   - Real-time updates
   - Advanced filtering
   - Email notifications
   - Payment integration

---

## Support

For issues:
1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review [API Documentation](./src/app/api/README.md)
3. Check server logs: `pnpm dev` console output
4. Review Clerk docs: https://clerk.com/docs

---

**Happy coding! 🚀**
