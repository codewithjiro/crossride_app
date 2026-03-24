# CrossRide 🚗

A comprehensive, enterprise-grade transportation management platform designed for reliable and efficient shuttle service operations. Built with cutting-edge technologies, CrossRide provides seamless coordination between administrators and passengers with real-time booking capabilities, intelligent trip scheduling, and complete audit trails.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Environment Configuration](#environment-configuration)
- [Database](#database)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)

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

### 🏢 Admin Dashboard

**Fleet Management**
- Add, edit, and manage vehicle inventory with capacity specifications
- Track vehicle status and maintenance history
- Assign drivers to vehicles with schedule management

**Driver Portal**
- Maintain comprehensive driver profiles and contact information
- Monitor driver assignments and trip schedules
- Track driver performance metrics

**Trip Management**
- Create and schedule routes with advanced conflict detection
- Monitor trip status in real-time (Pending → Scheduled → In Progress → Completed)
- Cancel trips with automatic cascade to related bookings
- Add detailed cancellation reasons for audit trails
- View historical data and analytics

**Booking Administration**
- Review pending booking requests with detailed passenger information
- Approve or reject bookings with audit tracking
- Monitor booking status across all phases
- Sort bookings by creation date (newest first)
- Responsive dashboard showing booking metrics

**System Monitoring**
- Real-time dashboard with key performance indicators
- Activity logs with complete timestamp and user tracking
- Quick access to critical metrics (total bookings, scheduled trips, total seats booked)

### 👥 User Portal

**Trip Discovery & Booking**
- Browse available trips with real-time seat availability
- Filter and search trips by date, time, and route
- Instant booking confirmation with email notifications
- Secure reservation management

**Booking Management**
- Organized bookings view with status categories:
  - **Pending**: Awaiting admin approval (yellow)
  - **Approved**: Confirmed by administrator (green)
  - **Completed**: Successfully completed (blue)
- Advanced filtering system (All, Pending, Approved, Completed)
- One-click cancellation for pending bookings
- View cancellation reasons with detailed explanations

**Trip History**
- Complete historical record of past trips
- Filter options: All, Completed, Cancelled
- Dynamic trip timeline with visual categorization
- Cancellation reason visibility

**Personal Dashboard**
- Quick statistics: Total bookings, approved trips, total seats booked
- Visual dashboard cards with status icons
- Next 3 upcoming bookings preview
- Quick actions for requesting new trips

**Account Management**
- Profile information updates
- Contact details management
- Preference settings

### 🔐 Security & Authentication

- **Clerk Authentication**: Industry-standard secure authentication system
- **Role-Based Access Control**: Enforced authorization on admin and user routes
- **Session Management**: Secure cookie-based sessions with automatic expiration
- **Logout Confirmation**: Modal confirmation before signing out
- **Protected Endpoints**: All sensitive operations require authentication
- **Webhook Integration**: Real-time user synchronization with Clerk

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (with Turbopack)
- **Language**: TypeScript (strict mode)
- **UI Library**: React 19
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui base components
- **Icons**: Lucide React

### Backend & Database
- **API**: Next.js Server Actions & Route Handlers
- **Database**: PostgreSQL (Neon for cloud)
- **ORM**: Drizzle ORM with full TypeScript support
- **Validation**: Client and server-side request validation

### Authentication
- **Service**: Clerk (clerk.com)
- **Methods**: Email/Password, OAuth, Social Login
- **Integration**: Webhook-based automatic syncing

### Development Tools
- **Package Manager**: pnpm
- **Code Quality**: ESLint with TypeScript
- **Formatting**: Prettier
- **Build Tool**: Turbopack (Next.js native)
- **Version Control**: Git

### Deployment
- **Platform**: Vercel (recommended)
- **Alternative Platforms**: Docker, self-hosted with Node.js

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                  │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Admin Portal   │  │ User Portal  │  │ Auth Pages │  │
│  └────────────────┘  └──────────────┘  └────────────┘  │
└────────────────────────┬──────────────────────────────┘
                         │ API Calls
┌────────────────────────▼──────────────────────────────┐
│         Next.js API Routes & Server Actions           │
│  ┌──────────────────────────────────────────────────┐ │
│  │ /api/admin/*  │ /api/bookings/* │ /api/auth/*   │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────┬──────────────────────────────┘
                         │ Database Queries
┌────────────────────────▼──────────────────────────────┐
│        PostgreSQL Database (via Drizzle ORM)          │
│  Tables: users, vans, drivers, trips, bookings, logs  │
└─────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.17 or later
- **pnpm**: v8.0 or later
- **PostgreSQL**: v14 or later (local) or Neon account
- **Clerk Account**: Free tier available at clerk.com

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/cross_ride.git
cd cross_ride
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Configure Environment Variables

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_publishable_key"
CLERK_SECRET_KEY="your_secret_key"
CLERK_WEBHOOK_SECRET="your_webhook_secret"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 4: Setup Database

```bash
# Apply schema migrations
pnpm db:push

# (Optional) Seed initial data
pnpm db:seed
```

### Step 5: Start Development Server

```bash
pnpm dev
```

Visit **http://localhost:3000** in your browser.

### Default Test Credentials

After initialization, create admin and user accounts through the UI:

| Role  | Email | Password |
|-------|-------|----------|
| Admin | Your email | Your password |
| User  | Another email | Password |

---

## Project Structure

```
cross_ride/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (admin)/                  # Admin portal routes
│   │   │   ├── admin/
│   │   │   │   ├── bookings/         # Booking management
│   │   │   │   ├── dashboard/        # Admin overview
│   │   │   │   ├── drivers/          # Driver management
│   │   │   │   ├── trips/            # Trip scheduling
│   │   │   │   ├── vans/             # Vehicle management
│   │   │   │   └── settings/         # System settings
│   │   │   └── layout.tsx            # Admin layout wrapper
│   │   ├── (user)/                   # User portal routes
│   │   │   ├── dashboard/            # User Home
│   │   │   ├── my-bookings/          # Booking management
│   │   │   ├── trip-history/         # Past trips
│   │   │   ├── available-trips/      # Trip discovery
│   │   │   ├── profile/              # User settings
│   │   │   ├── request-trip/         # Custom trip request
│   │   │   └── layout.tsx            # User layout wrapper
│   │   ├── (public)/                 # Landing pages
│   │   │   └── page.tsx              # Homepage
│   │   ├── sign-in/                  # Authentication
│   │   ├── sign-up/
│   │   ├── api/                      # Backend API routes
│   │   │   ├── admin/                # Admin endpoints
│   │   │   ├── auth/                 # Authentication
│   │   │   ├── bookings/             # Booking operations
│   │   │   └── webhooks/             # Clerk webhooks
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── admin/                    # Admin components
│   │   ├── user/                     # User components
│   │   ├── ui/                       # Base UI components
│   │   └── marketing/                # Landing components
│   ├── lib/
│   │   ├── auth.ts                   # Authentication utilities
│   │   ├── utils.ts                  # Helper functions
│   │   └── conflicts.ts              # Trip conflict detection
│   ├── server/
│   │   └── db/
│   │       ├── index.ts              # Database client
│   │       └── schema.ts             # Drizzle schema definitions
│   ├── styles/
│   │   └── globals.css               # Global styles
│   ├── middleware.ts                 # Authentication middleware
│   └── env.js                        # Environment validation
├── public/
│   └── images/                       # Static assets
├── drizzle/                          # Database migrations
├── package.json
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind configuration
├── next.config.js                    # Next.js configuration
└── README.md
```

---

## Core Features

### Trip Cancellation System
- Admin can cancel trips with detailed reason tracking
- Automatic cascade cancellation to all related bookings
- Reasons visible to passengers on booking cards and trip history
- Complete audit trail for compliance

### Status Synchronization
- **Bidirectional Sync**: When user completes booking, trip status updates automatically
- **Cascade Updates**: Group cancellations automatically sync across related records
- **Real-time Notification**: Users see status changes instantly

### Advanced Filtering & Search
- **My Bookings**: Filter by status (All, Pending, Approved, Completed)
- **Trip History**: Timeline view with filtered categorization
- **Bookings Table**: Sort by creation date (newest first)
- Dynamic badge counting on filter buttons

### Professional UI/UX
- **Status Indicators**: Color-coded badges (Yellow→Pending, Green→Approved, Blue→Completed, Red→Cancelled)
- **Icon Integration**: Lucide React icons for visual clarity
- **Modal Confirmations**: Critical actions require user confirmation
- **Time Formatting**: 12-hour format with AM/PM indicators
- **Responsive Design**: Works seamlessly on desktop, tablet, mobile

---

## Environment Configuration

### Required Variables

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://...

# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### Optional Variables

```env
# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

See `.env.example` for complete reference.

---

## Database

### Schema Overview

**Tables:**
- `users` - User accounts with role designation
- `vans` - Vehicle inventory with capacity and status
- `drivers` - Driver profiles with contact information
- `trips` - Scheduled routes with conflict detection
- `bookings` - Passenger reservations with status tracking
- `logs` - Complete audit trail of all system actions

### Key Relationships

```
users ──→ bookings ──→ trips
          ↓
        vans (assigned to trips)
drivers → trips
```

### Migrations

Migrations are stored in `drizzle/` directory and applied via:

```bash
pnpm db:push      # Apply all pending migrations
pnpm db:generate  # Generate new migration files
```

---

## Deployment

### 🚀 Vercel (Recommended)

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for complete guide.

**Quick Steps:**
1. Push code to GitHub
2. Create new project on vercel.com
3. Import repository and connect
4. Add environment variables in Vercel dashboard
5. Deploy automatically on push

### Database Options
- ✅ **Neon PostgreSQL** (easiest for Vercel)
- ✅ **Vercel Postgres** (integrated service)
- ✅ **Supabase** (open-source alternative)
- ✅ **Railway** (Docker-friendly)

### Self-Hosted
- Install Node.js 18+
- Run `pnpm build`
- Start with `pnpm start`
- Use reverse proxy (Nginx) for SSL

---

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server

# Database
pnpm db:push          # Apply migrations
pnpm db:generate      # Generate new migration
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript checking
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier configuration in `.prettierrc`
- **Linting**: ESLint with TypeScript support
- **Naming**: camelCase for variables/functions, PascalCase for components
- **File Structure**: Organize by feature/domain

### Testing

Recommended testing tools:
- **Unit Tests**: Jest + Testing Library (not yet implemented)
- **E2E Tests**: Playwright or Cypress (not yet implemented)

To add testing:
```bash
pnpm add -D jest @testing-library/react
```

---

## Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes following code standards
3. Test thoroughly: `pnpm dev` and manual testing
4. Commit with clear messages: `git commit -m "feat: add amazing feature"`
5. Push and create Pull Request

### Commit Convention

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `style:` - Code style (formatting)
- `perf:` - Performance improvement
- `test:` - Adding tests

### Reporting Issues

Please include:
- Step-by-step reproduction
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information

---

## License

This project is proprietary and confidential.

---

## Support

For issues or questions:
- 📧 Email: support@crossride.local
- 💬 Discussions: GitHub Discussions
- 🐛 Bugs: GitHub Issues

---

## Acknowledgments

Built with modern technologies:
- Vercel for hosting and deployment
- Clerk for authentication
- PostreSQL/Neon for data persistence
- shadcn/ui for component foundation
- Tailwind CSS for styling

---

**Last Updated**: March 24, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
- **Render** (render.com)

## Project Structure

```
src/
├── app/
│   ├── (admin)/          # Protected admin routes
│   │   ├── admin/        # Admin pages
│   │   └── layout.tsx    # Admin auth layout
│   ├── (user)/           # Protected user routes
│   │   ├── dashboard/    # User pages
│   │   └── layout.tsx    # User auth layout
│   ├── api/              # API routes
│   │   ├── admin/        # Admin endpoints
│   │   ├── bookings/     # Booking endpoints
│   │   ├── webhooks/     # Webhook handlers
│   │   └── auth/         # Auth endpoints
│   ├── public            # Public landing page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── admin/            # Admin components
│   ├── user/             # User components
│   ├── marketing/        # Public components
│   └── ui/               # Shared UI components
├── server/
│   ├── db/
│   │   ├── schema.ts     # Database schema
│   │   └── index.ts      # Database setup
│   └── auth/             # Auth utilities
├── lib/
│   ├── auth.ts           # Auth helpers
│   ├── api-middleware.ts # API protection
│   └── conflicts.ts      # Scheduling logic
└── env.js                # Environment validation
```

## Database Schema

### Tables

- **users**: User accounts with roles
- **vans**: Vehicle fleet information
- **drivers**: Driver information and status
- **trips**: Routes and schedules with capacity
- **bookings**: Passenger bookings with status
- **adminLogs**: Audit trail of admin actions

## API Endpoints

### Admin APIs

- `POST /api/admin/vans` - Create van
- `GET/PATCH/DELETE /api/admin/vans/[id]` - Van management
- `POST /api/admin/drivers` - Create driver
- `GET/PATCH/DELETE /api/admin/drivers/[id]` - Driver management
- `POST /api/admin/trips` - Create trip with conflict detection
- `GET/PATCH/DELETE /api/admin/trips/[id]` - Trip management
- `GET /api/admin/bookings` - View all bookings
- `PATCH /api/admin/bookings/[id]` - Approve/reject bookings
- `GET /api/admin/logs` - View activity logs

### User APIs

- `GET /api/bookings` - User's bookings
- `POST /api/bookings` - Create booking
- `GET /api/auth/check` - Check authentication status

### Admin Setup

- `GET /api/admin/init` - Check admin status
- `POST /api/admin/init` - Create/promote admin user

## Authentication Setup

### Clerk Configuration

1. Sign up at https://clerk.com (free tier)
2. Create new application
3. Get your API keys
4. Add production URLs to **Allowed URLs**
5. Configure webhook for automatic user syncing

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md#clerk-configuration) for detailed Clerk setup.

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm check            # Type check & lint
pnpm format:write     # Format code

# Database
pnpm db:push          # Sync schema to database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio (local only)

# Production
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Preview production build locally
```

## Admin User Creation

### Method 1: API Endpoint

```bash
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_xxx"}'
```

### Method 2: Database (Vercel Postgres)

```sql
UPDATE users SET role = 'admin' WHERE user_id = 'user_xxx' LIMIT 1;
```

## Development Tips

### Local Development Workflow

1. Create `.env.local` with test Clerk keys
2. Connect to local PostgreSQL database
3. Run `pnpm dev`
4. Make changes and test locally
5. Push to GitHub when ready
6. Vercel auto-deploys on push

### Debugging

- Check server logs: `pnpm dev` console output
- View database: `pnpm db:studio`
- Inspect Clerk logs: Clerk dashboard
- Check Vercel logs: Vercel dashboard → Deployments

### Testing Routes

- Public: http://localhost:3000
- User dashboard: http://localhost:3000/dashboard (requires login)
- Admin dashboard: http://localhost:3000/admin/dashboard (requires admin role)
- Sign up: http://localhost:3000/sign-up

## Production Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel
- [ ] Database migrations run (`pnpm db:push`)
- [ ] Admin user created
- [ ] Clerk webhook configured
- [ ] Production URLs added to Clerk
- [ ] Security reviewed (see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md#production-checklist))
- [ ] Error monitoring set up
- [ ] Database backups configured

## Troubleshooting

### Issues?

1. **Check [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md#troubleshooting)** for deployment issues
2. **Review [SETUP_COMPLETE.md](SETUP_COMPLETE.md)** for setup questions
3. **View server logs** with `pnpm dev`
4. **Check database** with `pnpm db:studio`

### Common Issues

- **Build fails on Vercel**: Check environment variables in Vercel dashboard
- **Users not syncing**: Verify webhook secret in `.env`
- **Admin endpoint 401**: Make sure you're logged in first
- **Database connection error**: Verify `DATABASE_URL` is correct

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test locally
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/feature-name`
5. Create Pull Request

## License

MIT

## Support

- **Deployment Help**: See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- **Setup Help**: See [SETUP_COMPLETE.md](SETUP_COMPLETE.md)
- **Clerk Docs**: https://clerk.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Ready to deploy? Check [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** 🚀
