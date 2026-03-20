# CrossRide 🚗

A modern transportation management platform built with Next.js, featuring separate admin and user dashboards with real-time booking management and trip scheduling.

## Features

### 👨‍💼 Admin Dashboard

- **Van Management**: Add, edit, delete vehicles with capacity tracking
- **Driver Management**: Manage driver information and availability
- **Trip Scheduling**: Create and schedule routes with conflict detection
- **Booking Approval**: Review and approve/reject passenger bookings
- **Activity Logs**: Complete audit trail of all admin actions
- **Settings**: Configure system parameters

### 👤 User Dashboard

- **Browse Trips**: View available transportation options with real-time seat availability
- **Book Trips**: Easy booking interface with instant confirmation
- **Manage Bookings**: View, track, and cancel your bookings
- **Trip History**: View past completed trips
- **Profile Management**: Update personal information

### 🔐 Security & Authentication

- **Clerk Authentication**: Secure user authentication and role-based access
- **Role-Based Access Control**: Separate admin and user access levels
- **Admin Initialization**: Secure endpoint for creating admin users
- **Webhook Integration**: Automatic user syncing with Clerk

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Deployment**: Vercel
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-username/cross_ride.git
cd cross_ride
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your:

- PostgreSQL connection string (local development)
- Clerk publishable key
- Clerk secret key

### 4. Initialize Database

```bash
pnpm db:push
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## Deployment

### 🚀 Deploy to Vercel

**See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for complete deployment guide.**

Quick steps:

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables (Vercel dashboard)
5. Click Deploy

Database options for Vercel:

- **Vercel Postgres** (integrated)
- **Neon** (neon.tech)
- **Supabase** (supabase.com)
- **Railway** (railway.app)
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
