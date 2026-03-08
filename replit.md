# Find and Hire Me — Job Search & Recruitment Platform

## Overview
Full-stack job search and recruitment platform with multi-role support (Job Seekers, Employers, Super Admin), covering US, UK, Nigeria, and remote global jobs.

## Tech Stack
- **Frontend**: Vite + React, wouter routing, TanStack Query v5, Tailwind CSS, Lucide icons
- **Backend**: Express.js, Drizzle ORM, PostgreSQL, express-session + connect-pg-simple
- **Fonts**: Plus Jakarta Sans (display), Inter (body)
- **Theme**: Indigo primary (243 75% 59%), Cyan accent (199 89% 48%)

## Architecture
- `shared/schema.ts` — Drizzle ORM tables & Zod insert schemas
- `shared/routes.ts` — API route contracts with Zod types
- `server/routes.ts` — Express API routes + seed database function
- `server/storage.ts` — IStorage interface + DatabaseStorage implementation
- `server/index.ts` — Express app setup with session middleware
- `server/db.ts` — PostgreSQL pool + Drizzle connection
- `client/src/App.tsx` — Main router with ProtectedRoute component
- `client/src/hooks/use-auth.ts` — Auth hook (login, register, logout, user state)
- `client/src/hooks/use-jobs.ts` — Jobs data hook

## Database Tables
users, job_seeker_profiles, employers, aggregator_partners, job_listings, applications, alerts, saved_jobs, invoices, blog_posts, audit_logs, click_events, user_sessions

## Roles
- JOB_SEEKER, EMPLOYER, SUPER_ADMIN

## Key Pages
- `/` — Home (hero, featured jobs, how-it-works, CTA)
- `/jobs` — Job search with filters
- `/jobs/:id` — Job detail
- `/jobs/us`, `/jobs/uk`, `/jobs/nigeria` — Country-specific job pages
- `/auth` — Login/Register
- `/employers` — Employer directory
- `/employers/:slug` — Employer profile with open positions
- `/resources` — Career resources/blog
- `/resources/:slug` — Blog post detail
- `/dashboard` — Job seeker dashboard (protected)
- `/employer/dashboard` — Employer dashboard (protected)
- `/admin` — Super admin panel (protected)

## Authentication
- Session-based with express-session + connect-pg-simple
- Session stored in PostgreSQL `user_sessions` table
- Password stored as plain text in demo (hashedPassword field)
- SESSION_SECRET env var

## Seed Data
- 7 users (1 admin, 5 employers, 1 seeker)
- 5 employers (TechCorp, GlobalPay, GreenLeaf, Finova, MediaSphere)
- 12 job listings across US, UK, Nigeria, Remote/Global
- 5 blog posts (career advice, interview tips, etc.)
- Seeds only when no employers exist in DB

## Custom CSS
- `.glass-nav` — Frosted glass navbar
- `.hover-elevate` — Custom hover with translate + shadow (NOT shadcn elevation)
- `.text-gradient` — Primary gradient text
- `.animate-fade-in`, `.animate-slide-up` — Entry animations

## Test Accounts
- Admin: admin@findandhire.me / admin123
- Seeker: seeker@example.com / password123
- Employer: hr@techcorp.com / password123
