# CrossRide - Deployment Checklist ✅

Quick reference for deploying to Vercel. See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.

## Pre-Deployment (Local)

### 1. Code Preparation
- [ ] Clone/pull latest code
- [ ] Run `pnpm install`
- [ ] Run `pnpm check` (verify no errors)
- [ ] Test locally: `pnpm dev`
- [ ] Commit changes to Git

### 2. Clerk Setup
- [ ] Create Clerk account at https://dashboard.clerk.com
- [ ] Create new application
- [ ] Copy **Publishable Key** (pk_...)
- [ ] Copy **Secret Key** (sk_...)
- [ ] Create Webhook endpoint
  - [ ] URL: `https://your-app.vercel.app/api/webhooks/clerk`
  - [ ] Subscribe to: `user.created`, `user.updated`, `user.deleted`
  - [ ] Copy **Signing Secret** (whsec_...)

### 3. Database Setup
Choose ONE:
- [ ] **Vercel Postgres** (recommended)
  - Go to Vercel Dashboard → Storage → Create Database
  - Get `DATABASE_URL`
- [ ] **Neon** (https://neon.tech)
- [ ] **Supabase** (https://supabase.com)
- [ ] **Railway** (https://railway.app)
- [ ] **Render** (https://render.com)

## Deployment to Vercel

### Step 1: GitHub Push
```bash
git init (if new repo)
git add .
git commit -m "Ready for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/cross_ride.git
git push -u origin main
```

- [ ] Code pushed to GitHub
- [ ] GitHub repo created: https://github.com/YOUR_USERNAME/cross_ride

### Step 2: Create Vercel Project
- [ ] Go to https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Select your `cross_ride` repository
- [ ] Vercel auto-detects Next.js project

### Step 3: Add Environment Variables
In Vercel → Settings → Environment Variables, add:

**Production** (`PRODUCTION`):
```
DATABASE_URL = postgresql://...  (from step 3 above)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_... (or pk_test_...)
CLERK_SECRET_KEY = sk_live_... (or sk_test_...)
CLERK_WEBHOOK_SECRET = whsec_...
NODE_ENV = production
```

- [ ] All 5 environment variables added
- [ ] Marked for "Production" environment

### Step 4: Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Check deployment URL: `https://cross-ride.vercel.app`

### Step 5: Clerk Configuration
Update Clerk Dashboard → **Allowed URLs**:
- [ ] `https://your-app.vercel.app` (production)
- [ ] `https://your-app-*.vercel.app` (previews)
- [ ] `http://localhost:3000` (local dev)

## Post-Deployment

### Step 1: Verify Deployment
- [ ] Visit `https://your-app.vercel.app` in browser
- [ ] Landing page loads correctly
- [ ] Sign up button works
- [ ] No console errors

### Step 2: Create Admin User
Sign up your first account, then:

```bash
# Get your Clerk user ID (from Vercel logs or Clerk dashboard)
# Format: user_xxx...

curl -X POST https://your-app.vercel.app/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_xxxxxxxxx"}'

# Expected response:
# {
#   "success": true,
#   "message": "User promoted to admin successfully",
#   "userId": "user_xxxxxxxxx",
#   "role": "admin"
# }
```

- [ ] Admin creation API response successful
- [ ] Sign out and back in
- [ ] Admin dashboard accessible: `https://your-app.vercel.app/admin/dashboard`

### Step 3: Test User Flow
- [ ] Create new user account
- [ ] Verify landing page
- [ ] Access user dashboard
- [ ] Browse available trips
- [ ] Check "My Bookings" page
- [ ] Check profile page

### Step 4: Test Admin Flow
- [ ] Login as admin
- [ ] Vans page loads
- [ ] Drivers page loads
- [ ] Trips page loads
- [ ] Bookings page loads
- [ ] Logs page shows webhook events
- [ ] Settings page loads

## Production Security

### Security Checklist
- [ ] Only production values in Vercel (never test/dev keys)
- [ ] Webhook secret properly configured
- [ ] Database backups enabled (Vercel Postgres)
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Rate limiting on sensitive endpoints
- [ ] Error tracking configured

### Admin Endpoint Security
The `/api/admin/init` endpoint is currently unrestricted. Options:

**Option A: Disable after first admin** (Recommended)
- Modify endpoint to reject if admin already exists

**Option B: Add environment variable check**
- Require `ADMIN_INIT_SECRET` header

**Option C: Whitelist emails**
- Only allow specific email domains

See [VERCEL_DEPLOYMENT.md#production-checklist](VERCEL_DEPLOYMENT.md#production-checklist) for implementation.

- [ ] Admin endpoint secured for production

## Monitoring & Maintenance

### Ongoing Tasks
- [ ] Check Vercel Analytics: `https://vercel.com/dashboard`
- [ ] Monitor database usage
- [ ] Review Clerk dashboard for user signups
- [ ] Check error logs regularly
- [ ] Keep dependencies updated: `pnpm update`

### Useful URLs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Database Studio** (if using Vercel Postgres): Dashboard → Storage
- **Deployed App**: https://your-app.vercel.app
- **GitHub Repo**: https://github.com/YOUR_USERNAME/cross_ride

## Troubleshooting

**Build Failed?**
- [ ] Check Vercel Build Logs (Deployments tab)
- [ ] Run `pnpm check` locally
- [ ] Verify all env vars set
- [ ] Check for TypeScript errors

**Users Not Syncing?**
- [ ] Verify `CLERK_WEBHOOK_SECRET` matches
- [ ] Check Clerk webhook status in dashboard
- [ ] Try signing up again

**Admin Endpoint 401?**
- [ ] Sign up first (create user)
- [ ] Get your Clerk user ID
- [ ] Verify userId in request
- [ ] Check `CLERK_SECRET_KEY` set

**Database Connection Error?**
- [ ] Verify `DATABASE_URL` format
- [ ] Check database is running
- [ ] Test connection locally first
- [ ] Check IP whitelist if applicable

## Quick Links

| Task | Link |
|------|------|
| Deploy to Vercel | https://vercel.com/new |
| Clerk Dashboard | https://dashboard.clerk.com |
| Add Clerk Webhook | https://dashboard.clerk.com → Webhooks |
| Vercel Postgres Setup | Vercel → Storage → Postgres |
| Full Guide | [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) |
| Setup Help | [SETUP_COMPLETE.md](SETUP_COMPLETE.md) |

---

## Before & After Summary

### ✅ What You Get After Deployment

- Production app running on Vercel
- PostgreSQL database connected
- Clerk authentication working
- Admin user created
- Users can sign up automatically
- All dashboards functional
- Webhooks syncing user data

### 🚀 You're Live!

Your app is now live at: **https://your-app.vercel.app** 🎉

---

Need help? Check [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.
