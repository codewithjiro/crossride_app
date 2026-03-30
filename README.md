# CrossRide 🚗

A comprehensive, enterprise-grade transportation management platform designed for reliable and efficient shuttle service operations. Built with cutting-edge technologies, CrossRide provides seamless coordination between administrators and passengers with real-time booking capabilities, intelligent trip scheduling, and complete audit trails.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [System Architecture](#system-architecture)
- [Available Scripts](#available-scripts)
- [Environment Configuration](#environment-configuration)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Overview

CrossRide is a modern transportation management system that simplifies the complex processes of fleet management, driver coordination, and passenger booking. With separate role-based portals for administrators and users, along with advanced features like trip conflict detection, cascade cancellations, and real-time status synchronization, CrossRide ensures operational efficiency and user satisfaction.

**Key Highlights:**

- ✅ Enterprise-grade security with role-based access control
- ✅ Real-time bidirectional status synchronization
- ✅ Intelligent conflict detection and management
- ✅ Professional UI/UX with intuitive navigation
- ✅ Complete audit trail for all administrative actions
- ✅ Responsive design optimized for all devices

---

## Key Features

### 🏢 Admin Dashboard Features

**Fleet & Driver Management**
- Comprehensive vehicle inventory management with capacity specifications
- Driver profile management with contact information and assignments
- Real-time vehicle and driver status tracking
- Assign drivers to specific vehicles with schedule coordination
- Track vehicle maintenance history and driver performance metrics

**Advanced Trip Management**
- Create and schedule routes with intelligent conflict detection
- Real-time trip status monitoring (Pending → Scheduled → In Progress → Completed)
- Trip cancellation with cascade to related bookings
- Detailed cancellation reasons for audit compliance
- Historical data and analytics dashboard
- Advanced search and filtering capabilities

**Booking Administration**
- Review pending booking requests with passenger details
- Approve or reject bookings with audit tracking
- Monitor bookings across all phases (Pending, Approved, Completed, Cancelled)
- Sort and filter bookings efficiently
- Interactive dashboard metrics and KPIs
- Booking status visibility with color-coded indicators

**System Monitoring**
- Real-time dashboard with key performance indicators
- Complete activity logs with timestamp and user tracking
- Quick access to critical metrics (total bookings, scheduled trips, seats booked)
- System health status and alerts

### 👥 User Portal Features

**Trip Discovery & Booking**
- Browse available trips with real-time seat availability
- Advanced search and filter by date, time, and route
- Instant booking confirmation with email notifications
- Secure reservation management

**My Bookings Management**
- Organized bookings view with status categories:
  - **Pending**: Awaiting admin approval (yellow badge)
  - **Approved**: Confirmed by administrator (green badge)
  - **Completed**: Successfully completed (blue badge)
  - **Cancelled**: Trip cancelled (red badge)
- Advanced filtering system across all categories
- One-click cancellation for pending bookings
- View cancellation reasons with detailed explanations

**Trip History & Statistics**
- Complete historical record of past trips
- Filter options: All, Completed, Cancelled
- Dynamic trip timeline with visual categorization
- Personal dashboard with quick statistics:
  - Total bookings
  - Approved trips
  - Total seats booked
- Next 3 upcoming bookings preview
- Quick actions for requesting new trips

**Account Management**
- Profile information updates
- Contact details management
- Preference settings and notification controls

### 🔐 Security & Authentication

- **Clerk Authentication**: Industry-standard secure authentication system
- **Role-Based Access Control**: Enforced authorization on admin and user routes
- **Session Management**: Secure cookie-based sessions with automatic expiration
- **Protected Endpoints**: All sensitive operations require authentication
- **Webhook Integration**: Real-time user synchronization with Clerk
- **Logout Confirmation**: Modal confirmation before signing out

---

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (with Turbopack for faster builds)
- **Language**: TypeScript (strict mode for type safety)
- **UI Library**: React 19
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui base components
- **Icons**: Lucide React
- **Maps**: Leaflet + React Leaflet for route visualization

### Backend & Database

- **API**: Next.js Server Actions & Route Handlers
- **Database**: PostgreSQL (Neon for cloud)
- **ORM**: Drizzle ORM with full TypeScript support
- **Validation**: Client and server-side request validation with Zod
- **File Upload**: UploadThing for image management
- **Password**: bcryptjs for secure password hashing
- **Sessions**: iron-session for session management

### Authentication

- **Service**: Clerk (clerk.com)
- **Methods**: Email/Password, OAuth, Social Login
- **Integration**: Webhook-based automatic syncing

### Development Tools

- **Package Manager**: pnpm (fast, efficient package management)
- **Code Quality**: ESLint with TypeScript support
- **Formatting**: Prettier with custom configuration
- **Build Tool**: Turbopack (Next.js native, much faster than Webpack)
- **Version Control**: Git
- **Task Runner**: pnpm scripts

### Deployment

- **Platform**: Vercel (recommended)
- **Alternative Platforms**: Railway, Render, self-hosted with Node.js

---

## Quick Start

### Prerequisites

- **Node.js**: v18.17 or later
- **pnpm**: v8.0 or later (Install with `npm install -g pnpm`)
- **PostgreSQL**: v14 or later (local) or Neon account (free)
- **Clerk Account**: Free tier available at https://clerk.com

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/cross_ride.git
cd cross_ride
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Configure Environment Variables

Create `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"
CLERK_WEBHOOK_SECRET="whsec_xxx"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 4. Setup Database

```bash
# Apply schema migrations
pnpm db:push

# (Optional) Open Drizzle Studio to view/manage database
pnpm db:studio
```

#### 5. Start Development Server

```bash
pnpm dev
```

Visit **http://localhost:3000** in your browser.

#### 6. Create Admin User

1. Sign up at http://localhost:3000/sign-up
2. Make API call to promote user to admin:
   ```bash
   curl -X POST http://localhost:3000/api/admin/init \
     -H "Content-Type: application/json" \
     -d '{"userId":"user_xxx"}'
   ```
   Or update database directly:
   ```sql
   UPDATE users SET role = 'admin' WHERE user_id = 'user_xxx' LIMIT 1;
   ```

---

## Project Structure

```
cross_ride/
├── src/
│   ├── app/                              # Next.js 15 App Router
│   │   ├── (admin)/                      # Admin portal routes (protected)
│   │   │   ├── admin/
│   │   │   │   ├── bookings/             # Booking management page
│   │   │   │   ├── dashboard/            # Admin overview & KPIs
│   │   │   │   ├── drivers/              # Driver CRUD & management
│   │   │   │   ├── trips/                # Trip scheduling & conflicts
│   │   │   │   ├── vans/                 # Vehicle management
│   │   │   │   ├── logs/                 # Activity logs & audit trail
│   │   │   │   └── settings/             # System settings
│   │   │   └── layout.tsx                # Admin layout wrapper
│   │   ├── (user)/                       # User portal routes (protected)
│   │   │   ├── dashboard/                # User home & statistics
│   │   │   ├── my-bookings/              # Booking management
│   │   │   ├── trip-history/             # Past trips & history
│   │   │   ├── available-trips/          # Trip discovery & search
│   │   │   ├── request-trip/             # Custom trip request form
│   │   │   ├── profile/                  # User profile & settings
│   │   │   └── layout.tsx                # User layout wrapper
│   │   ├── (public)/                     # Public pages
│   │   │   └── page.tsx                  # Landing page & marketing
│   │   ├── sign-in/                      # Clerk sign in page
│   │   ├── sign-up/                      # Clerk sign up page
│   │   ├── api/                          # Backend API routes
│   │   │   ├── admin/                    # Admin endpoints
│   │   │   │   ├── vans/
│   │   │   │   ├── drivers/
│   │   │   │   ├── trips/
│   │   │   │   ├── bookings/
│   │   │   │   ├── logs/
│   │   │   │   └── init/                 # Admin initialization
│   │   │   ├── auth/                     # Authentication endpoints
│   │   │   ├── bookings/                 # Booking operations
│   │   │   ├── trips/                    # Trip queries
│   │   │   ├── drivers/                  # Driver queries
│   │   │   ├── vans/                     # Van queries
│   │   │   ├── route/                    # Route calculation
│   │   │   ├── geocode/                  # Geocoding service
│   │   │   ├── webhooks/                 # Clerk webhooks
│   │   │   ├── uploadthing/              # File upload endpoints
│   │   │   ├── debug/                    # Debug endpoints
│   │   │   └── psgc/                     # Location data
│   │   ├── middleware.ts                 # Auth middleware
│   │   └── layout.tsx                    # Root layout wrapper
│   ├── components/
│   │   ├── admin/                        # Admin-specific components
│   │   │   ├── add-driver-modal.tsx
│   │   │   ├── add-van-modal.tsx
│   │   │   ├── driver-table-row.tsx
│   │   │   ├── edit-driver-modal.tsx
│   │   │   ├── trips-table.tsx
│   │   │   └── ...more admin components
│   │   ├── user/                         # User-specific components
│   │   │   ├── booking-card.tsx
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── profile-picture-upload.tsx
│   │   │   └── sidebar.tsx
│   │   ├── maps/                         # Map components
│   │   │   └── route-map.tsx
│   │   ├── marketing/                    # Landing page components
│   │   │   ├── hero.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── navbar.tsx
│   │   │   └── ...more marketing components
│   │   └── ui/                           # Shared UI components (shadcn/ui)
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...more UI components
│   ├── lib/
│   │   ├── auth.ts                       # Authentication utilities
│   │   ├── api-middleware.ts             # API protection middleware
│   │   ├── conflicts.ts                  # Trip conflict detection
│   │   ├── cron.ts                       # Scheduled tasks
│   │   ├── data.ts                       # Data fetching utilities
│   │   ├── uploadthing.ts                # File upload setup
│   │   └── utils.ts                      # General helper functions
│   ├── server/
│   │   └── db/
│   │       ├── index.ts                  # Database client initialization
│   │       └── schema.ts                 # Drizzle ORM schema
│   ├── hooks/
│   │   └── use-session-manager.tsx       # Session management hook
│   ├── styles/
│   │   └── globals.css                   # Global Tailwind styles
│   ├── middleware.ts                     # Next.js authentication middleware
│   └── env.js                            # Environment variable validation
├── public/
│   ├── drivers/                          # Driver images
│   ├── images/                           # Static images
│   ├── profile/                          # Profile pictures
│   └── ...other static assets
├── drizzle/
│   ├── 0000_*.sql                        # Migration files
│   ├── 0001_*.sql
│   └── meta/
│       ├── _journal.json                 # Migration journal
│       └── *_snapshot.json               # Schema snapshots
├── scripts/
│   ├── add-vans.mjs                      # Seed van data
│   └── restore-drivers.mjs               # Seed driver data
├── package.json
├── tsconfig.json                         # TypeScript configuration
├── next.config.js                        # Next.js configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── postcss.config.js                     # PostCSS configuration
├── prettier.config.js                    # Code formatting rules
├── eslint.config.js                      # Linting rules
├── drizzle.config.ts                     # Drizzle ORM configuration
├── .env.example                          # Environment variables template
└── README.md
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                       │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Admin Portal    │  │ User Portal  │  │  Auth Pages    │ │
│  │  Dashboard       │  │ Trip Booking │  │  Sign In/Up    │ │
│  │  Fleet Mgmt      │  │  My Bookings │  │  Landing Page  │ │
│  └──────────────────┘  └──────────────┘  └────────────────┘ │
└────────────────────────┬──────────────────────────────────────┘
                         │ TypeScript API Calls (fetch)
┌────────────────────────▼──────────────────────────────────────┐
│          Next.js API Routes & Server Actions                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Admin APIs     │ User APIs     │ Auth       │ Webhooks   │ │
│  │ /api/admin/*   │ /api/booking* │ /api/auth  │ /webhooks  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Middleware Layer:                                            │
│  - Authorization & RBAC                                       │
│  - Request validation (Zod)                                   │
│  - Rate limiting                                              │
│  - Audit logging                                              │
└────────────────────────┬──────────────────────────────────────┘
                         │ Database Queries (Drizzle ORM)
┌────────────────────────▼──────────────────────────────────────┐
│       PostgreSQL Database (Neon Cloud)                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ users        │  │ trips        │  │ bookings     │       │
│  │ - userId     │  │ - tripId     │  │ - bookingId  │       │
│  │ - role       │  │ - status     │  │ - status     │       │
│  │ - email      │  │ - startLoc   │  │ - tripId     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ drivers      │  │ vans         │  │ logs         │       │
│  │ - driverId   │  │ - vanId      │  │ - action     │       │
│  │ - name       │  │ - capacity   │  │ - userId     │       │
│  │ - phone      │  │ - status     │  │ - timestamp  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘

External Services:
├── Clerk (Authentication & User Management)
├── Leaflet Maps (Route Visualization)
├── UploadThing (Image Upload & Storage)
└── Neon (PostgreSQL Database Hosting)
```

---

## Available Scripts

### Development Commands

```bash
# Start development server with Turbopack (fast refresh)
pnpm dev

# Run TypeScript type checking
pnpm check

# Run ESLint to check for code issues
pnpm lint

# Fix ESLint issues automatically
pnpm lint:fix

# Format code with Prettier
pnpm format:write

# Check code formatting without making changes
pnpm format:check
```

### Database Commands

```bash
# Apply pending migrations to database
pnpm db:push

# Generate new migration files from schema changes
pnpm db:generate

# Run migrations manually
pnpm db:migrate

# Open Drizzle Studio (local database viewer/editor)
pnpm db:studio
```

### Production Commands

```bash
# Build application for production
pnpm build

# Start production server
pnpm start

# Build and start locally (preview production)
pnpm preview
```

---

## Environment Configuration

### Required Variables

```env
# PostgreSQL Connection String (Neon recommended for cloud)
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# Clerk API Keys (get from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx..."
CLERK_SECRET_KEY="sk_test_xxx..."
CLERK_WEBHOOK_SECRET="whsec_xxx..."
```

### Optional Variables

```env
# Application URL (for redirects and emails)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# UploadThing Keys (for image uploads)
UPLOADTHING_SECRET="sk_xxx..."
NEXT_PUBLIC_UPLOADTHING_APP_ID="xxx..."
```

### Environment Setup Guide

1. **Clerk Setup**:
   - Sign up at https://clerk.com
   - Create new application
   - Copy API keys to `.env.local`
   - Add redirect URLs in Clerk dashboard

2. **Neon Database**:
   - Sign up at https://console.neon.tech
   - Create new PostgreSQL database
   - Copy connection string to `DATABASE_URL`

3. **UploadThing** (Optional):
   - Sign up at https://uploadthing.com
   - Create new app
   - Copy API keys

---

## Database

### Schema Overview

**Core Tables:**

- **users**: User accounts with authentication and role information
  - userId, email, name, role (admin/user), createdAt, updatedAt

- **vans**: Vehicle fleet inventory
  - vanId, licensePlate, capacity, status, imageUrl, createdAt

- **drivers**: Driver profiles and information
  - driverId, firstName, lastName, phone, email, imageUrl, status

- **trips**: Scheduled routes with conflict detection
  - tripId, startLocation, endLocation, startTime, endTime, vanId, driverId, capacity, status, cancellationReason

- **bookings**: Passenger reservations
  - bookingId, userId, tripId, passengersCount, status, createdAt, approvedAt, cancellationReason

- **adminLogs**: Complete audit trail
  - logId, userId, action, resource, resourceId, changes, timestamp

### Key Relationships

```
users (admin)
  ↓
  └─→ Create/manage trips, drivers, vans, bookings
  
users (passenger)
  ↓
  └─→ bookings → trips
  
drivers → trips ← vans
           ↓
         bookings
         
AdminLogs (audit trail for all changes)
```

### Database Diagram

```
[users] (1)←──────→(many) [bookings]
                             ├──→ [trips]
                             │      ├──→ [drivers]
                             │      └──→ [vans]
                             
[adminLogs] ← Audit trail for all operations
```

### Running Migrations

```bash
# View current database schema
pnpm db:studio

# Generate migration from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:push

# Create seed data
pnpm scripts/add-vans.mjs
pnpm scripts/restore-drivers.mjs
```

---

## API Endpoints

### Admin API Routes

**Driver Management**
- `POST /api/admin/drivers` - Create new driver
- `GET /api/admin/drivers` - List all drivers
- `GET /api/admin/drivers/[id]` - Get driver details
- `PATCH /api/admin/drivers/[id]` - Update driver
- `DELETE /api/admin/drivers/[id]` - Delete driver

**Van Management**
- `POST /api/admin/vans` - Create new van
- `GET /api/admin/vans` - List all vans
- `GET /api/admin/vans/[id]` - Get van details
- `PATCH /api/admin/vans/[id]` - Update van
- `DELETE /api/admin/vans/[id]` - Delete van

**Trip Management**
- `POST /api/admin/trips` - Create trip with conflict detection
- `GET /api/admin/trips` - List all trips
- `GET /api/admin/trips/[id]` - Get trip details
- `PATCH /api/admin/trips/[id]` - Update trip status or cancel
- `DELETE /api/admin/trips/[id]` - Delete trip

**Booking Management**
- `GET /api/admin/bookings` - List all bookings
- `PATCH /api/admin/bookings/[id]` - Approve/reject booking
- `GET /api/admin/logs` - View activity logs

**System**
- `GET /api/admin/init` - Check if admin exists
- `POST /api/admin/init` - Create/promote admin user

### User API Routes

**Booking Operations**
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/[id]` - Cancel pending booking

**Trip Discovery**
- `GET /api/trips` - List available trips
- `GET /api/trips/[id]` - Get trip details

**User Info**
- `GET /api/auth/check` - Check authentication status

### Webhook Routes

- `POST /api/webhooks/clerk` - Clerk user sync webhook

### Utility Routes

- `POST /api/route` - Calculate route details
- `GET /api/geocode` - Geocode address
- `POST /api/uploadthing` - Handle file uploads

---

## Deployment

### 🚀 Deployment on Vercel (Recommended)

**Benefits:**
- Automatic deployments on push
- Built-in environment variable management
- Free SSL/HTTPS
- Serverless functions
- Edge network for fast load times

**Setup Steps:**

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/cross_ride.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import GitHub repository
   - Select "cross_ride"

3. **Configure Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `DATABASE_URL` (Neon PostgreSQL)
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `CLERK_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_APP_URL` (your Vercel domain)

4. **Configure Database**
   - Use Neon PostgreSQL (free tier available)
   - Connection string in `DATABASE_URL`

5. **Deploy**
   - Vercel automatically deploys on push
   - View deployment logs in dashboard

### Alternative Deployment Options

**Railway** (railway.app)
- Excellent for PostgreSQL + Node.js
- Simple GitHub integration
- Similar setup to Vercel

**Render** (render.com)
- Good for Next.js applications
- Built-in PostgreSQL option
- Web services and cron jobs

**Self-Hosted**
- Install Node.js 18+
- Run `pnpm build`
- Start with `pnpm start`
- Use Nginx as reverse proxy for SSL
- Configure PostgreSQL separately

### Database Hosting Options

- ✅ **Neon PostgreSQL** (Easiest for Vercel, free tier)
- ✅ **Vercel Postgres** (Integrated with Vercel)
- ✅ **Supabase** (PostgreSQL + extra features)
- ✅ **Railway Postgres** (Good for Railway deployment)
- ✅ **Amazon RDS** (Production-grade option)

---

## Development

### Code Quality Standards

- **TypeScript**: Strict mode enabled for type safety
- **Formatting**: Prettier (run `pnpm format:write`)
- **Linting**: ESLint with TypeScript support (run `pnpm lint:fix`)
- **Naming Conventions**:
  - Variables/Functions: camelCase
  - Components: PascalCase
  - Constants: UPPER_SNAKE_CASE
- **File Structure**: Organized by feature/domain

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/amazing-feature

# 2. Install dependencies and setup
pnpm install

# 3. Create .env.local with development keys
cp .env.example .env.local

# 4. Start development server
pnpm dev

# 5. Make changes and test locally

# 6. Run code quality checks
pnpm lint:fix
pnpm format:write
pnpm check

# 7. Commit changes
git add .
git commit -m "feat: add amazing feature"

# 8. Push and create Pull Request
git push origin feature/amazing-feature
```

### Commit Message Convention

Follow the conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Code formatting (no logic changes)
- `perf:` - Performance improvements
- `test:` - Adding/updating tests
- `chore:` - Dependency updates, etc.

**Examples:**
```
feat: add trip conflict detection
fix: resolve booking approval bug
refactor: simplify driver management code
docs: update README installation guide
```

### Testing

Framework recommendations (not yet implemented):

- **Unit Tests**: Jest + Testing Library
  ```bash
  pnpm add -D jest @testing-library/react
  ```

- **E2E Tests**: Playwright or Cypress
  ```bash
  pnpm add -D playwright @playwright/test
  ```

---

## Contributing

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/cross_ride.git
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes and test**
   ```bash
   pnpm dev
   # Test your changes locally
   ```

4. **Run quality checks**
   ```bash
   pnpm lint:fix
   pnpm format:write
   pnpm check
   ```

5. **Commit with conventional message**
   ```bash
   git commit -m "feat: describe your feature"
   ```

6. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature
   ```

### Reporting Issues

Please include in issue reports:

- Step-by-step reproduction of the problem
- Expected behavior vs actual behavior
- Screenshots or screen recordings if applicable
- Browser and OS information
- Console errors (if applicable)

---

## Troubleshooting

### Common Issues & Solutions

**Database Connection Error**
- ✓ Check `DATABASE_URL` is correct in `.env.local`
- ✓ Verify database is running/accessible
- ✓ For Neon: Check IP whitelist if needed
- ✓ Run `pnpm db:studio` to test connection

**Build Fails on Vercel**
- ✓ Check all environment variables are set in Vercel dashboard
- ✓ Verify `NODE_ENV=production` is not set in env vars
- ✓ Check Vercel build logs for specific errors
- ✓ Ensure `package.json` correct and `pnpm-lock.yaml` committed

**Users Not Syncing from Clerk**
- ✓ Verify webhook secret in `.env.local`
- ✓ Check Clerk dashboard → Webhooks → verify URL is correct
- ✓ Check webhook logs in Clerk dashboard for errors
- ✓ Ensure webhook endpoint is publicly accessible

**Admin Endpoints Return 401**
- ✓ Ensure user is logged in first
- ✓ Verify user role is "admin" in database
- ✓ Check session/authentication middleware

**Type Errors**
- ✓ Run `pnpm check` to see TypeScript errors
- ✓ Ensure all types are properly imported
- ✓ Check `.env.local` has all required variables

**Build Size Too Large**
- ✓ Run `pnpm build` and check `.next` directory
- ✓ Check for large dependencies with `npm ls`
- ✓ Consider code splitting and dynamic imports

### Debug Commands

```bash
# Type check entire project
pnpm check

# Run linter and show all issues
pnpm lint

# Format all files
pnpm format:write

# Open database viewer
pnpm db:studio

# View development server logs
pnpm dev  # All console output appears here

# Build and preview production version
pnpm build
pnpm start
```

### Testing Routes Locally

```
Public site:         http://localhost:3000
Sign up:             http://localhost:3000/sign-up
Sign in:             http://localhost:3000/sign-in
User dashboard:      http://localhost:3000/dashboard (login required)
Admin dashboard:     http://localhost:3000/admin/dashboard (admin login required)
Database viewer:     pnpm db:studio (shows all database tables)
```

---

## Support

### Getting Help

- **📧 Email**: support@crossride.local
- **💬 GitHub Discussions**: For questions and discussions
- **🐛 GitHub Issues**: For bug reports
- **📚 Documentation**: Check VERCEL_DEPLOYMENT.md for deployment help

### Related Documentation

- **Deployment Guide**: See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- **Setup Guide**: See [SETUP_COMPLETE.md](SETUP_COMPLETE.md)
- **Clerk Docs**: https://clerk.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **Tailwind CSS**: https://tailwindcss.com/docs

### External Resources

- **Next.js 15**: https://nextjs.org
- **React 19**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **PostgreSQL**: https://www.postgresql.org/docs
- **Clerk Authentication**: https://clerk.com

---

## License

This project is proprietary and confidential.

---

## Acknowledgments

Built with modern, production-ready technologies:

- **Vercel** - Hosting, deployment, and edge computing
- **Clerk** - Secure authentication and user management
- **PostgreSQL/Neon** - Reliable data persistence
- **shadcn/ui** - Professional UI component foundation
- **Tailwind CSS** - Utility-first styling
- **Drizzle ORM** - Type-safe database operations
- **Leaflet** - Interactive maps
- **UploadThing** - File upload and storage

---

## Project Status

- **Version**: 1.0.0
- **Last Updated**: March 30, 2026
- **Status**: Production Ready ✅
- **Maintained**: Yes

---

**Ready to get started?** 🚀

1. Follow the [Quick Start](#quick-start) guide
2. Set up environment variables
3. Run `pnpm dev`
4. Check deployment options in [Deployment](#deployment)

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
