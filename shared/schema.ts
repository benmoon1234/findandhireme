import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password"),
  name: text("name"),
  role: text("role").notNull().default("JOB_SEEKER"), 
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
});

export const jobSeekerProfiles = pgTable("job_seeker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  skills: text("skills").array(),
  preferredLocations: text("preferred_locations").array(),
  preferredCountries: text("preferred_countries").array(),
  preferredEmployment: text("preferred_employment").array(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  cvUrl: text("cv_url"),
  cvFileName: text("cv_file_name"),
  parsedCvData: json("parsed_cv_data"),
  alertFrequency: text("alert_frequency").default("DAILY"), 
  alertChannels: text("alert_channels").array(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const employers = pgTable("employers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  companyName: text("company_name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  description: text("description"),
  industry: text("industry"),
  website: text("website"),
  location: text("location"),
  country: text("country"),
  verified: boolean("verified").default(false),
  verifiedAt: timestamp("verified_at"),
  subscriptionTier: text("subscription_tier").default("FREE"), 
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aggregatorPartners = pgTable("aggregator_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  apiType: text("api_type").default("REST"), 
  feedUrl: text("feed_url"),
  apiKey: text("api_key"),
  ppcRate: doublePrecision("ppc_rate").default(0.10),
  totalClicks: integer("total_clicks").default(0),
  totalBilled: doublePrecision("total_billed").default(0.0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  location: text("location").notNull(),
  city: text("city"),
  state: text("state"),
  country: text("country").default("GLOBAL"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency").default("USD"),
  employmentType: text("employment_type").default("FULL_TIME"), 
  experienceLevel: text("experience_level").default("MID"), 
  industry: text("industry"),
  skills: text("skills").array(),
  isRemote: boolean("is_remote").default(false),
  isFeatured: boolean("is_featured").default(false),
  featuredUntil: timestamp("featured_until"),
  status: text("status").default("ACTIVE"), 
  source: text("source").default("INTERNAL"), 
  externalUrl: text("external_url"),
  trackingUrl: text("tracking_url"),
  employerId: integer("employer_id").references(() => employers.id),
  aggregatorId: integer("aggregator_id").references(() => aggregatorPartners.id),
  postedAt: timestamp("posted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  viewCount: integer("view_count").default(0),
  clickCount: integer("click_count").default(0),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobListings.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  cvUrl: text("cv_url"),
  coverLetter: text("cover_letter"),
  status: text("status").default("NEW"), 
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  jobId: integer("job_id").references(() => jobListings.id).notNull(),
  matchScore: doublePrecision("match_score").notNull(),
  channel: text("channel").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  openedAt: timestamp("opened_at"),
});

export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  jobId: integer("job_id").references(() => jobListings.id).notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  aggregatorId: integer("aggregator_id").references(() => aggregatorPartners.id).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalClicks: integer("total_clicks").notNull(),
  ppcRate: doublePrecision("ppc_rate").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").default("PENDING"), 
  stripeInvoiceId: text("stripe_invoice_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: text("category"),
  authorId: integer("author_id").references(() => users.id).notNull(),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  targetEntity: text("target_entity").notNull(),
  targetId: integer("target_id").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clickEvents = pgTable("click_events", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobListings.id).notNull(),
  aggregatorId: integer("aggregator_id").references(() => aggregatorPartners.id),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isBillable: boolean("is_billable").default(true),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, emailVerified: true, lastLoginAt: true });
export const insertJobListingSchema = createInsertSchema(jobListings).omit({ id: true, postedAt: true, viewCount: true, clickCount: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true, updatedAt: true });
export const insertEmployerSchema = createInsertSchema(employers).omit({ id: true, createdAt: true, verifiedAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type JobListing = typeof jobListings.$inferSelect;
export type InsertJobListing = z.infer<typeof insertJobListingSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Employer = typeof employers.$inferSelect;
export type InsertEmployer = z.infer<typeof insertEmployerSchema>;
