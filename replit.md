# Find and Hire Me — Job Search & Recruitment Platform

## Overview
Full-stack job search and recruitment platform with multi-role support (Job Seekers, Employers, Super Admin), covering US, UK, Nigeria, and remote global jobs.

## Tech Stack
- **Frontend**: Vite + React, wouter routing, TanStack Query v5, Tailwind CSS, Lucide icons
- **Backend**: Express.js, Drizzle ORM, PostgreSQL, express-session + connect-pg-simple
- **File Upload**: express-fileupload (10MB limit, PDF/DOC/DOCX for CVs)
- **Fonts**: Plus Jakarta Sans (display), Inter (body)
- **Theme**: Indigo primary (243 75% 59%), Cyan accent (199 89% 48%)

## Architecture
- `shared/schema.ts` — Drizzle ORM tables & Zod insert schemas
- `shared/routes.ts` — API route contracts with Zod types
- `server/routes.ts` — Express API routes + seed database function
- `server/storage.ts` — IStorage interface + DatabaseStorage implementation
- `server/index.ts` — Express app setup with session, file upload middleware
- `server/db.ts` — PostgreSQL pool + Drizzle connection
- `client/src/App.tsx` — Main router with ProtectedRoute component (uses wouter Redirect)
- `client/src/hooks/use-auth.ts` — Auth hook (login, register, logout, user state)
- `client/src/hooks/use-jobs.ts` — Jobs data hooks (useJobs, useJob, useCreateJob)

## Database Tables
users, job_seeker_profiles, employers, aggregator_partners, job_listings, applications, alerts, saved_jobs, invoices, blog_posts, audit_logs, click_events, user_sessions

## Roles
- JOB_SEEKER, EMPLOYER, SUPER_ADMIN

## Key Pages
- `/` — Home (hero, featured jobs, how-it-works, CTA)
- `/jobs` — Job search with filters (keyword, location, country, type, experience, remote, sort)
- `/jobs/:id` — Job detail with apply modal, save/bookmark toggle
- `/jobs/us`, `/jobs/uk`, `/jobs/nigeria` — Country-specific job pages
- `/auth` — Login/Register
- `/employers` — Employer directory
- `/employers/:slug` — Employer profile with open positions
- `/resources` — Career resources/blog
- `/resources/:slug` — Blog post detail
- `/dashboard` — Job seeker dashboard (applications, saved jobs, CV upload)
- `/employer/dashboard` — Employer dashboard (real stats, job listings, applicant management)
- `/employer/post-job` — Post new job form
- `/admin` — Super admin panel (real stats, employer verification, user list, job table)

## API Routes
### Auth
- POST /api/register, POST /api/login, POST /api/logout, GET /api/me

### Jobs
- GET /api/jobs, GET /api/jobs/:id, POST /api/jobs, PUT /api/jobs/:id, DELETE /api/jobs/:id

### Employers
- GET /api/employers, GET /api/employers/:slug, POST /api/employers
- GET /api/employer/profile, GET /api/employer/jobs, GET /api/employer/applications

### Applications
- GET /api/applications, POST /api/applications, PATCH /api/applications/:id/status

### Saved Jobs
- GET /api/saved-jobs, POST /api/saved-jobs, DELETE /api/saved-jobs/:jobId

### Seeker Profile
- GET /api/profile, PATCH /api/profile, POST /api/profile/cv (file upload)

### Admin
- GET /api/admin/stats, GET /api/admin/users, PATCH /api/employers/:id/verify

### Blog
- GET /api/blog-posts, GET /api/blog-posts/:slug

## Authentication
- Session-based with express-session + connect-pg-simple
- Session stored in PostgreSQL `user_sessions` table
- Passwords hashed with bcrypt
- SESSION_SECRET env var
- Role-based access control on protected routes

## Seed Data
- 7 users (1 admin, 5 employers, 1 seeker) — bcrypt hashed passwords
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

## Feature Status
- Job search/filter: Complete
- Job detail with apply: Complete
- Employer Dashboard (real data, post jobs, manage listings, view applicants): Complete
- Saved Jobs (toggle on cards/detail, list in dashboard): Complete
- Admin Dashboard (real stats, employer verification, user list): Complete
- CV Upload (file upload, auto-attach to applications): Complete
- Job Alerts: Schema only (not implemented)
