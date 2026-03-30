# CrossRide Codebase Analysis Report

**Date:** March 30, 2026  
**Scope:** Full codebase audit for bugs, performance issues, security vulnerabilities, code quality, and best practices

---

## Executive Summary

This analysis identified **25+ significant issues** across critical, high, medium, and low severity levels. Key concerns include missing API endpoints, race conditions in booking logic, missing input validation, CSRF vulnerabilities, and memory leak risks.

---

## CRITICAL ISSUES (Must Fix Immediately)

### 1. Missing Required API Endpoints
**Severity:** CRITICAL  
**File:** `src/components/user/booking-card.tsx` (lines 64-68, 77-91)  
**Issue:** The component calls `/api/bookings/{id}/complete` and `/api/bookings/{id}/cancel` endpoints that do not exist.

```typescript
// Lines 64-68, booking-card.tsx - calls non-existent endpoint
const response = await fetch(`/api/bookings/${id}/complete`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
});
```

**Impact:** Booking completion/cancellation functionality completely broken for users.  
**Fix:**
- Create `src/app/api/bookings/[id]/complete/route.ts`
- Create `src/app/api/bookings/[id]/cancel/route.ts`
- Implement state update logic for bookings

---

### 2. Race Condition in Booking Approval
**Severity:** CRITICAL  
**File:** `src/app/api/admin/bookings/[id]/route.ts` (lines 35-90)  
**Issue:** Booking approval has two separate database operations without transaction handling. If a second approval request arrives between conflict check and approval, overbooking can occur.

```typescript
// Race condition: Two separate operations without transaction
const conflictCheck = await checkConflicts(...);
if (conflictCheck.hasConflict) return; // Check

// ... Meanwhile, another request could modify the trip ...

// Then approval happens
await db.update(bookings).set({ status: newStatus })...
```

**Impact:** Multiple bookings could be approved for the same seat, leading to overbooking.  
**Fix:** Use database transactions (Drizzle ORM transactions) to make approval atomic:
```typescript
await db.transaction(async (tx) => {
  // Check conflicts
  // Approve booking
  // Update seats
  // All atomically
});
```

---

### 3. No CSRF Protection
**Severity:** CRITICAL  
**File:** `src/lib/api-middleware.ts`, `src/middleware.ts`  
**Issue:** Authentication relies solely on cookies. No CSRF tokens implemented. Attackers can craft requests that browsers execute automatically.

```typescript
// src/middleware.ts - No CSRF protection
const userId = request.cookies.get("userId")?.value;
if (!userId) {
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
```

**Impact:** Attackers can perform actions on behalf of authenticated users from external sites.  
**Fix:**
- Implement CSRF token validation for state-changing operations
- Add `csrf-protection` library or implement custom middleware
- Verify CSRF token on all POST/PATCH/DELETE requests:

```typescript
export async function withCsrfProtection(handler: NextHandler) {
  return async (req: NextRequest) => {
    if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
      const token = req.headers.get('x-csrf-token');
      const sessionToken = // get from session
      if (token !== sessionToken) {
        return NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 });
      }
    }
    return handler(req);
  };
}
```

---

### 4. Session Timeout Promise Not Awaited
**Severity:** CRITICAL  
**File:** `src/hooks/use-session-manager.tsx` (lines 106-116)  
**Issue:** The `beforeunload` event handler calls `fetch()` but doesn't await it. The browser may close before the request completes.

```typescript
const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
  e.preventDefault();
  e.returnValue = "";
  // Fire-and-forget: won't complete before window closes
  await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {});
};
```

**Impact:** Session doesn't properly close when user closes the tab. Session data remains in database indefinitely.  
**Fix:** Use `navigator.sendBeacon()` which is specifically designed for `beforeunload`:
```typescript
const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
  navigator.sendBeacon("/api/auth/sign-out", JSON.stringify({ _method: 'POST' }));
};
```

---

### 5. Input Validation Missing - No Email/Phone Format Validation
**Severity:** CRITICAL  
**File:** `src/app/api/auth/sign-up/route.ts` (lines 17-27)  
**File:** `src/app/api/admin/drivers/route.ts` (lines 37-51)  
**File:** `src/app/api/admin/vans/route.ts` (lines 12-22)  
**Issue:** No email format validation, no phone format validation. Invalid data gets stored in database.

```typescript
// sign-up/route.ts - no email validation
if (!email || !password) {
  return Response.json({ error: "Email and password are required" }, { status: 400 });
}
// Email could be "invalid", "user@", "user@.com", etc.
```

**Impact:** Database contains invalid emails, breaking email communications. Invalid phone numbers can't be reached.  
**Fix:** Use Zod validation library (already in dependencies):

```typescript
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});

const { email, password, phoneNumber } = signUpSchema.parse(body);
```

---

## HIGH SEVERITY ISSUES

### 6. N+1 Query Problem - Massive Data Fetching
**Severity:** HIGH  
**File:** `src/app/(admin)/admin/trips/page.tsx` (lines 8-16)  
**Issue:** Fetching all trips with all bookings and users. For 1,000 trips, this loads 1,000 trips × N bookings × full user objects = massive query.

```typescript
const trips = await db.query.trips.findMany({
  with: {
    van: true,
    driver: true,
    bookings: {
      with: {
        user: true, // ALL user fields for EACH booking
      },
    },
  },
});
```

**Impact:** Extremely slow page load and high memory usage. Database connection strain.  
**Fix:** Implement pagination and selective field loading:

```typescript
const trips = await db.query.trips.findMany({
  limit: 50,
  with: {
    van: { columns: { id: true, name: true } },
    driver: { columns: { id: true, firstName: true, surname: true } },
    bookings: {
      limit: 10,
      with: {
        user: { columns: { id: true, email: true, firstName: true } },
      },
    },
  },
});
```

---

### 7. No Pagination on Admin Endpoints
**Severity:** HIGH  
**File:** `src/app/api/admin/bookings/route.ts` (lines 1-24)  
**File:** `src/app/api/admin/trips/route.ts` (lines 1-20)  
**File:** `src/app/api/drivers/route.ts` (lines 1-11)  
**Issue:** All GET endpoints return unlimited results. With 10,000+ records, this crashes the server.

```typescript
export async function GET() {
  const allBookings = await db.query.bookings.findMany({
    with: { user: true, trip: { with: { van: true, driver: true } } },
  });
  return NextResponse.json(allBookings); // Hundreds of megabytes in response
}
```

**Impact:** Memory exhaustion, response timeout, browser crashes.  
**Fix:** Add pagination:

```typescript
export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    db.query.bookings.findMany({ limit, offset }),
    db.query.bookings.findMany().then(b => b.length),
  ]);

  return NextResponse.json({ bookings, total, page });
}
```

---

### 8. Race Condition in Booking + Trip Seat Updates
**Severity:** HIGH  
**File:** `src/app/api/admin/bookings/route.ts` (lines 63-75)  
**Issue:** Two separate database updates without transaction. Another API call could modify seats between operations.

```typescript
if (action === "approve") {
  newStatus = "approved";
  if (booking.trip) {
    await db.update(trips).set({
      seatsReserved: (booking.trip.seatsReserved ?? 0) + booking.seatsBooked,
      status: "scheduled",
    }).where(...);
  }
}
const updatedBooking = await db.update(bookings).set({ status: newStatus })...
```

**Impact:** Seat counts become incorrect, overbooking occurs.  
**Fix:** Use database transaction (same as #2).

---

### 9. Type Casting Without Validation
**Severity:** HIGH  
**File:** `src/app/api/bookings/route.ts` (lines 58-59)  
**Issue:** Converting `driverId` from string to number without null checking. If `driverId` is "null" string, it becomes `NaN`.

```typescript
const driverIdInt = parseInt(String(driverId), 10);
// If driverId is "null" or "abc", driverIdInt becomes NaN, causing queries to fail
const trip = await db.query.trips.findFirst({
  where: eq(trips.id, driverIdInt), // NaN in WHERE clause = invalid query
});
```

**Impact:** Silent failures, incorrect query results, potential crashes.  
**Fix:** Validate the conversion:

```typescript
if (driverId && Number.isNaN(parseInt(driverId))) {
  return NextResponse.json({ error: 'Invalid driverId format' }, { status: 400 });
}
const driverIdInt = driverId ? parseInt(driverId) : null;
```

---

### 10. Unsafe Error Message Exposure
**Severity:** HIGH  
**File:** Multiple API routes  
**Issue:** Database/internal error messages exposed to clients. Attackers learn about database structure.

```typescript
catch (error) {
  return NextResponse.json(
    {
      error: error instanceof Error 
        ? error.message  // Exposes: "duplicate key value violates unique constraint users.email"
        : "Failed to create user"
    },
    { status: 500}
  );
}
```

**Impact:** Information disclosure, helps attackers find vulnerabilities.  
**Fix:** Log specific errors server-side, return generic messages to clients:

```typescript
catch (error) {
  console.error('SENSITIVE_ERROR:', error); // Log full error
  return NextResponse.json(
    { error: 'An error occurred processing your request' },
    { status: 500 }
  );
}
```

---

### 11. Memory Leak in useSessionManager Event Listeners
**Severity:** HIGH  
**File:** `src/hooks/use-session-manager.tsx` (lines 83-96)  
**Issue:** Event listeners added with `true` capture flag. If component unmounts and remounts, listeners accumulate without being removed properly.

```typescript
useEffect(() => {
  const handleActivity = () => {
    if (!showWarning) {
      resetTimer();
    }
  };

  const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
  events.forEach((event) => {
    window.addEventListener(event, handleActivity, true); // Capture phase listeners
  });

  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, handleActivity, true); // Reference must be identical
    });
  };
}, [resetTimer, showWarning]); // PROBLEM: resetTimer is a new function each time!
```

**Problem:** `resetTimer` is recreated on every render, so the cleanup function removes a *different* function than what was added. The listener is never actually removed.

**Impact:** Multiple copies of event handlers running, consuming memory, slowing browser.  
**Fix:** Use `useCallback` for the event handler:

```typescript
const handleActivity = useCallback(() => {
  if (!showWarning) {
    resetTimer();
  }
}, [showWarning, resetTimer]);

useEffect(() => {
  const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
  events.forEach((event) => {
    window.addEventListener(event, handleActivity, true);
  });

  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, handleActivity, true);
    });
  };
}, [handleActivity]);
```

---

### 12. No Transaction Handling for Related Updates
**Severity:** HIGH  
**File:** `src/app/api/admin/trips/[id]/route.ts` (lines 75-85)  
**Issue:** When cancelling a trip, bookings are updated separately. If trip update succeeds but booking update fails, data becomes inconsistent.

```typescript
// Update trip
const updatedTrip = await db.update(trips).set(updateData).where(...)returning();

// If trip is being cancelled, also cancel related bookings
if (status === "cancelled") {
  await db.update(bookings).set({ status: "cancelled" }).where(...);
  // If this fails, trip is cancelled but bookings remain approved!
}
```

**Impact:** Data inconsistency, bookings remain approved for cancelled trips.  
**Fix:** Wrap in transaction:

```typescript
await db.transaction(async (tx) => {
  await tx.update(trips).set(updateData).where(...)
  if (status === "cancelled") {
    await tx.update(bookings).set({ status: "cancelled" }).where(...)
  }
});
```

---

### 13. Global setInterval Without Cleanup
**Severity:** HIGH  
**File:** `src/lib/cron.ts` (lines 48-51)  
**Issue:** `setInterval()` never cleared. If scheduler is called multiple times, multiple intervals accumulate.

```typescript
try {
  // ... try node-cron ...
} catch {
  console.log("⚠️  node-cron not found. Using setInterval...");
  setInterval(runAutoComplete, 5 * 60 * 1000); // No way to clear this!
  console.log("✅ Auto-complete scheduler started (every 5 minutes)");
}
```

**Impact:** Multiple duplicate background jobs running, massive performance degradation.  
**Fix:** Return interval ID for cleanup:

```typescript
let intervalId: NodeJS.Timeout | null = null;

export async function initAutoCompleteScheduler() {
  // ... code ...
  intervalId = setInterval(runAutoComplete, 5 * 60 * 1000);
}

export function stopAutoCompleteScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
```

---

## MEDIUM SEVERITY ISSUES

### 14. Unhandled Promise in Booking Card
**Severity:** MEDIUM  
**File:** `src/components/user/booking-card.tsx` (lines 74-75)  
**Issue:** Setting state after `setTimeout` without checking component is still mounted. Memory leak warning.

```typescript
setTimeout(() => {
  console.log("Reloading now...");
  window.location.reload(); // Always completes, but pattern is unclean
}, 2000);
```

**Impact:** Minor memory leak warning in development, but `window.location.reload()` mitigates it.  
**Fix:** Store timeout ID and clear if component unmounts:

```typescript
const timeoutRef = useRef<NodeJS.Timeout>();

useEffect(() => {
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, []);

useEffect(() => {
  timeoutRef.current = setTimeout(() => {
    window.location.reload();
  }, 2000);
}, []);
```

---

### 15. Incomplete Duplicate Trip Check
**Severity:** MEDIUM  
**File:** `src/lib/conflicts.ts` (lines 48-100+, not fully shown in output)  
**Issue:** `checkDuplicateTrip` function is incomplete in the codebase view. Cannot fully verify logic.

**Impact:** Duplicate trip prevention may be incomplete.  
**Fix:** Review complete function in codebase and verify it checks:
- Same van + route + date
- Excludes cancelled/completed trips
- Returns proper conflict details

---

### 16. No Error Boundaries in Components
**Severity:** MEDIUM  
**File:** `src/components/admin/trips-manager.tsx`, `src/components/admin/auto-complete-bookings.tsx`, others  
**Issue:** Components can crash and bring down entire admin page. No error boundaries.

**Impact:** Single component error crashes entire admin dashboard.  
**Fix:** Wrap admin components in error boundary:

```typescript
'use client';
import { ReactNode } from 'react';

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}

// Usage:
<ErrorBoundary>
  <TripsManager {...props} />
</ErrorBoundary>
```

---

### 17. No Request Deduplication for Concurrent Bookings
**Severity:** MEDIUM  
**File:** `src/app/api/bookings/route.ts` (lines 44-60)  
**Issue:** If user clicks "Book" button multiple times rapidly, multiple requests create multiple bookings. No idempotency.

```typescript
// Check if user already booked this trip
const existingBooking = await db.query.bookings.findFirst({
  where: and(
    eq(bookings.userId, user.id),
    eq(bookings.tripId, parseInt(String(tripId), 10)),
  ),
});

if (existingBooking) {
  return NextResponse.json(
    { error: "You already have a booking for this trip" },
    { status: 400 },
  );
}
// RACE CONDITION: Between check and insert, another request creates booking
```

**Impact:** Duplicate bookings created due to race condition.  
**Fix:** Use database constraint + idempotency key:

```typescript
// Add unique constraint in database:
// CREATE UNIQUE INDEX booking_user_trip_idx ON bookings(userId, tripId) WHERE status != 'cancelled';

// Or use idempotency key:
export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get('x-idempotency-key');
  if (!idempotencyKey) {
    return NextResponse.json(
      { error: 'x-idempotency-key header required' },
      { status: 400 }
    );
  }
  // Check cache for existing request with same key...
}
```

---

### 18. Cookie Security Flag Incomplete
**Severity:** MEDIUM  
**File:** `src/app/api/auth/sign-in/route.ts` (lines 39-46)  
**Issue:** Cookie marked secure only if `NODE_ENV === 'production'`, but doesn't check actual HTTPS.

```typescript
cookieStore.set("userId", user.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
});
```

**Problem:** On production if served over HTTP (misconfiguration), cookie is still secure: true, making it unsent by browser.

**Fix:** Check actual protocol:

```typescript
const isSecure = process.env.NODE_ENV === 'production' && 
                 request.headers.get('x-forwarded-proto') === 'https';

cookieStore.set("userId", user.id, {
  httpOnly: true,
  secure: isSecure,
  sameSite: "strict", // Also change to "strict" for better security
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
});
```

---

### 19. Type Definitions Don't Match Database Schema
**Severity:** MEDIUM  
**File:** `src/components/admin/trips-table.tsx` (lines 8-45)  
**Issue:** Manual type definitions don't match actual database schema. Middle column name is "name" in type, but schema has separate firstName/middleName/surname.

```typescript
type DbDriver = {
  id: number;
  name: string; // ❌ Schema has firstName, middleName, surname
  email: string;
};
```

**Impact:** Type mismatch, runtime errors when accessing `driver.name`.  
**Fix:** Use generated types from schema or verify accuracy:

```typescript
import type { typeof drivers } from '~/server/db/schema';
type DbDriver = typeof drivers.$inferSelect;
```

---

### 20. Missing Validation for Trip Times
**Severity:** MEDIUM  
**File:** `src/app/api/admin/trips/route.ts` (lines 77-80)  
**Issue:** Validates `depTime >= arrTime` but doesn't check if times are in the past (no validation for booking past trips).

```typescript
if (depTime >= arrTime) {
  return NextResponse.json(
    { error: "Departure time must be before arrival time" },
    { status: 400 },
  );
}
// Missing: if departure is in the past, reject it
```

**Impact:** Can create trips in the past, which auto-complete logic doesn't handle properly.  
**Fix:** Add validation:

```typescript
const now = new Date();
if (depTime < now) {
  return NextResponse.json(
    { error: "Cannot create trips in the past" },
    { status: 400 },
  );
}
```

---

## LOW SEVERITY ISSUES

### 21. Console Log Statements in Production Code
**Severity:** LOW  
**File:** `src/app/api/trips/by-date/route.ts` (lines 42-56)  
**File:** `src/app/api/bookings/auto-complete/route.ts` (multiple lines)  
**File:** `src/components/user/booking-card.tsx` (lines 74-75)  
**Issue:** Debug console logs left in production code.

```typescript
console.log("=== trips/by-date API ===");
console.log("Query date:", date);
console.log("Total trips in DB:", allTrips.length);
```

**Impact:** Verbose logging slows down production, could expose data structure info.  
**Fix:** Use environment-based logging:

```typescript
const isDev = process.env.NODE_ENV === 'development';
if (isDev) console.log("Debug:", data);

// Or use logging library:
import logger from '~/lib/logger';
logger.debug('trips/by-date API', { date });
```

---

### 22. Data Type Inconsistency
**Severity:** LOW  
**File:** Multiple files  
**Issue:** Dates sometimes stored as `Date` object, sometimes as ISO string. Inconsistent in components.

```typescript
type DbTrip = {
  departureTime: Date | string; // UNION TYPE - unclear which it actually is
};
```

**Impact:** Type confusion, occasional runtime errors, harder to maintain.  
**Fix:** Be consistent:

```typescript
type DbTrip = {
  departureTime: string; // Always ISO string from DB
  // Component converts to Date when needed: new Date(departureTime)
};
```

---

### 23. Missing Loading States
**Severity:** LOW  
**File:** `src/components/admin/bookings/page.tsx` (line 36)  
**Issue:** Some async operations don't have loading spinner UI feedback.

```typescript
const handleReject = async (bookingId: number) => {
  setActionLoading(bookingId);
  try {
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      // User has no visual feedback during request
    });
  }
};
```

**Impact:** Poor UX, user might click multiple times.  
**Fix:** Already partially done - ensure all async operations have loading state.

---

### 24. Missing Uploadthing Configuration Documentation
**Severity:** LOW  
**File:** `src/app/api/uploadthing/core.ts` (referenced but content not shown)  
**Issue:** File upload handling using uploadthing but implementation details not reviewed.

**Impact:** Unable to audit file upload security.  
**Fix:** Review uploadthing configuration for:
- File size limits
- File type restrictions
- Virus scanning
- Secure storage

---

### 25. Deprecated Pattern Matching in Middleware
**Severity:** LOW  
**File:** `src/middleware.ts` (lines 30-41)  
**Issue:** Using old regex pattern matching instead of Next.js matcher patterns.

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|public|images|drivers).*)",
  ],
};
```

**Impact:** Less efficient, harder to maintain.  
**Fix:** Use Next.js 15+ matcher syntax:

```typescript
export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|api|public).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
      ],
    },
  ],
};
```

---

## Summary Table

| Issue | Severity | Category | File | Impact |
|-------|----------|----------|------|--------|
| Missing API endpoints | CRITICAL | Functionality | booking-card.tsx | Feature broken |
| Race condition: booking approval | CRITICAL | Concurrency | admin/bookings/[id] | Overbooking |
| No CSRF protection | CRITICAL | Security | api-middleware.ts | Account takeover |
| Session timeout not awaited | CRITICAL | Security | use-session-manager.tsx | Session leaks |
| No input validation (email/phone) | CRITICAL | Validation | auth/sign-up | Data integrity |
| N+1 query in trips page | HIGH | Performance | admin/trips/page | Slow load |
| No pagination on endpoints | HIGH | Performance | Multiple APIs | Crashes |
| Race condition: trip + booking updates | HIGH | Concurrency | admin/bookings | Inconsistent data |
| Unsafe type casting | HIGH | Type Safety | bookings/route | Silent failures |
| Unsafe error messages | HIGH | Security | All APIs | Info disclosure |
| Memory leak in event listeners | HIGH | Memory | use-session-manager | Browser slowdown |
| No transactions on related updates | HIGH | Data Integrity | admin/trips | Inconsistency |
| Global setInterval leak | HIGH | Memory | cron.ts | Performance |
| Unhandled promises | MEDIUM | Memory | booking-card.tsx | Minor leak |
| Incomplete duplicate check | MEDIUM | Logic | conflicts.ts | Duplicates possible |
| No error boundaries | MEDIUM | Resilience | admin components | Dashboard crashes |
| No request deduplication | MEDIUM | Concurrency | bookings/route | Duplicate bookings |
| Cookie security flag | MEDIUM | Security | auth/sign-in | Incomplete security |
| Type mismatch | MEDIUM | Type Safety | trips-table.tsx | Runtime errors |
| No past trip validation | MEDIUM | Logic | admin/trips | Invalid state |
| Console logs in production | LOW | Code Quality | Multiple | Performance |
| Data type inconsistency | LOW | Code Quality | Multiple | Confusion |
| Missing loading states | LOW | UX | admin pages | Poor UX |
| Uploadthing not reviewed | LOW | Security | uploadthing/* | Unknown risks |
| Deprecated middleware patterns | LOW | Code Quality | middleware.ts | Maintenance |

---

## Recommendations

### Immediate Actions (This Sprint)
1. Create missing booking complete/cancel endpoints
2. Implement database transactions for booking approval
3. Add CSRF token protection
4. Fix session timeout using `navigator.sendBeacon()`
5. Implement Zod validation for all inputs

### High Priority (Next Sprint)
1. Add pagination to all admin endpoints
2. Fix N+1 queries with selective field loading
3. Fix memory leak in event listeners
4. Implement request deduplication for bookings
5. Add error boundaries to admin interface

### Medium Priority (2 Weeks)
1. Implement generic error messages
2. Add comprehensive logging
3. Review and fix all type inconsistencies
4. Add loading states to all async operations
5. Review uploadthing security configuration

### Ongoing
1. Remove console.log statements
2. Keep dependencies updated
3. Run security audits regularly
4. Add E2E tests for booking flow (currently broken)
5. Implement monitoring for database errors

