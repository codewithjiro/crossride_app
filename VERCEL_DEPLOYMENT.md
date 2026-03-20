# CrossRide - Vercel Deployment Guide 🚀

Complete guide for deploying CrossRide to Vercel with production-ready database and configuration.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup (Vercel Postgres)](#database-setup-vercel-postgres)
3. [Clerk Configuration](#clerk-configuration)
4. [Environment Variables](#environment-variables)
5. [Deploy to Vercel](#deploy-to-vercel)
6. [Post-Deployment Setup](#post-deployment-setup)
7. [Production Checklist](#production-checklist)

---

## Prerequisites

- **GitHub Account** (for Vercel integration)
- **Vercel Account** (free tier available)
- **PostgreSQL Database** (Vercel Postgres recommended)
- **Clerk Account** (for authentication)
- **Git** (to push code to GitHub)

---

## Database Setup (Vercel Postgres)

### Option 1: Vercel Postgres (Recommended for Vercel)

**Simple and integrated with Vercel:**

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Create a new project or select existing
3. Go to **Storage** tab → **Create Database** → **Postgres**
4. Click **Continue**
5. Choose region (closest to your users)
6. Vercel will generate `DATABASE_URL` automatically

### Option 2: Other PostgreSQL Providers

Alternative managed PostgreSQL services:
- **Neon**: https://neon.tech (free tier available)
- **Supabase**: https://supabase.com (PostgreSQL + extras)
- **Railway**: https://railway.app (simple deployment)
- **Render**: https://render.com (good free tier)

---

## Clerk Configuration

### 1. Create Clerk Application

1. Go to https://dashboard.clerk.com
2. Create new application
3. Choose "Email & Password" or "Google" auth method
4. Get your keys:
   - **Publishable Key** (`pk_...`)
   - **Secret Key** (`sk_...`)

### 2. Add Production URLs to Clerk

In Clerk Dashboard → **Allowed URLs**:

```
https://your-app.vercel.app (production)
https://your-app-staging.vercel.app (preview)
http://localhost:3000 (development)
```

### 3. Configure Webhook in Clerk

1. **Webhooks** → **Add Endpoint**
2. URL: `https://your-app.vercel.app/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the **Signing Secret** (`whsec_...`)

---

## Environment Variables

### In Vercel Dashboard

Go to your project → **Settings** → **Environment Variables**

Add these variables for **Production**:

```
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Environment
NODE_ENV=production
```

### For Preview/Staging

Create an `.env.local` file locally for development:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cross_ride
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
NODE_ENV=development
```

**Never commit `.env.local` to Git!**

---

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit - CrossRide deployment"
git remote add origin https://github.com/your-username/cross_ride.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. **Import Git Repository**
3. Select your GitHub repo (`cross_ride`)
4. Vercel auto-detects Next.js project ✓

### Step 3: Configure Environment Variables

In Vercel project setup:
- Add all variables from [Environment Variables](#environment-variables) section
- Make sure `DATABASE_URL` is set

### Step 4: Deploy

Click **Deploy** button

Vercel will:
- Build the project
- Run `pnpm check` (type checking)
- Deploy to `your-app.vercel.app`

---

## Post-Deployment Setup

### 1. Initialize Admin User

After deployment:

```bash
# Check admin setup status
curl https://your-app.vercel.app/api/admin/init

# Promote first user to admin
curl -X POST https://your-app.vercel.app/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_xxx"}'
```

Or use the Vercel Postgres dashboard:

```sql
-- View all users
SELECT * FROM users;

-- Set first user as admin
UPDATE users SET role = 'admin' WHERE user_id = 'user_xxx' LIMIT 1;
```

### 2. Run Database Migrations

In Vercel terminal:

```bash
# Push schema to production database
pnpm db:push --skip-generate
```

Or in your local terminal connected to production DB:

```bash
DATABASE_URL=postgresql://... pnpm db:push
```

### 3. Test Deployment

Visit: `https://your-app.vercel.app`

- [ ] Landing page loads
- [ ] Sign up works (@Clerk)
- [ ] User dashboard accessible
- [ ] Admin can access admin dashboard
- [ ] Webhook syncs users correctly

---

## Production Checklist

### Security
- [ ] All environment variables set in Vercel (not in code)
- [ ] `CLERK_SECRET_KEY` is production key (starts with `sk_live_`)
- [ ] `DATABASE_URL` points to production database
- [ ] Admin endpoints rate-limited (see note below)
- [ ] CORS configured correctly

### Database
- [ ] Vercel Postgres database created
- [ ] Schema migrated (`pnpm db:push`)
- [ ] Regular backups enabled
- [ ] All tables created successfully

### Clerk
- [ ] Production keys from Clerk (not test keys)
- [ ] Webhook configured and verified
- [ ] Production URLs added to Allowed URLs
- [ ] Email templates configured (optional)

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking set up
- [ ] Log monitoring configured
- [ ] Database performance monitored

### Admin Security (Important!)

**The init endpoint is currently unrestricted!**

Before production, implement one of these:

**Option 1: Environment Variable Protection**
```typescript
// src/app/api/admin/init/route.ts
const ADMIN_SECRET = process.env.ADMIN_INIT_SECRET;

if (request.headers.get('x-admin-secret') !== ADMIN_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Option 2: Disable After First Admin**

```typescript
// Check if admin already exists
const adminCount = await db.query.users.findMany({
  where: eq(users.role, 'admin'),
});

if (adminCount.length > 0) {
  return NextResponse.json({ error: 'Admin already exists' }, { status: 403 });
}
```

**Option 3: Email Domain Whitelist**

```typescript
// Only allow specific email domains
const allowedDomains = ['company.com', 'admin.company.com'];
const email = user.emailAddresses[0]?.emailAddress || '';
const domain = email.split('@')[1];

if (!allowedDomains.includes(domain)) {
  return NextResponse.json({ error: 'Unauthorized domain' }, { status: 403 });
}
```

---

## Commands Reference

```bash
# Local Development
pnpm dev              # Start dev server on localhost:3000
pnpm check            # Type check & lint
pnpm format:write     # Format code

# Database (Local)
pnpm db:studio        # Open Drizzle Studio (local DB only)

# Building & Previewing
pnpm build            # Build for production
pnpm preview          # Preview production build locally
```

---

## Vercel Environment URLs

After deployment:

- **Production**: `https://cross-ride.vercel.app`
- **Preview Deploys**: `https://cross-ride-[branch].vercel.app`
- **Local Dev**: `http://localhost:3000`

Update Clerk dashboard **Allowed URLs** with all of these.

---

## Troubleshooting

### Build Fails on Vercel

**Check Logs:**
1. Go to Vercel dashboard → Deployments
2. Click failing deployment
3. View **Build Logs** tab

**Common Issues:**
- Missing environment variables → Add to Vercel dashboard
- Type errors → Run `pnpm check` locally to catch first
- Missing `svix` package → Should install automatically

### Database Connection Error

```
Error: P1000 Unknown database error
```

Solutions:
1. Verify `DATABASE_URL` is correct in Vercel
2. Check database is running (Vercel Postgres status)
3. Try connecting locally with same URL
4. Check firewall/IP whitelist settings

### Webhook Not Triggering

1. Verify webhook URL in Clerk: `https://your-app.vercel.app/api/webhooks/clerk`
2. Check `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
3. Test manually: Try signing up on deployed site
4. Check server logs in Vercel → Functions

### Admin Endpoint Returns 401

Solutions:
1. Make sure you're logged in (signed up first)
2. Check your Clerk user ID: `user_xxx`
3. Verify userId is passed correctly
4. Check `CLERK_SECRET_KEY` is set in Vercel

---

## Next Steps

1. ✅ Deploy to Vercel (this guide)
2. Set up admin user
3. Configure production security (see checklist)
4. Add custom domain (optional)
5. Set up monitoring/analytics
6. Plan feature development

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Drizzle Docs**: https://orm.drizzle.team
- **Next.js Docs**: https://nextjs.org/docs

---

**You're ready to deploy! 🚀**

Questions? Check the troubleshooting section or refer to official documentation links above.
