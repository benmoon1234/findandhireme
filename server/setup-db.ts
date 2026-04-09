import { pool } from "./db";

const CREATE_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS "aggregator_partners" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "api_type" text DEFAULT 'REST',
    "feed_url" text,
    "api_key" text,
    "ppc_rate" double precision DEFAULT 0.1,
    "total_clicks" integer DEFAULT 0,
    "total_billed" double precision DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "aggregator_partners_slug_unique" UNIQUE("slug")
  )`,
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "hashed_password" text,
    "name" text,
    "role" text DEFAULT 'JOB_SEEKER' NOT NULL,
    "email_verified" timestamp,
    "image" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    "last_login_at" timestamp,
    "is_active" boolean DEFAULT true,
    "two_factor_secret" text,
    "two_factor_enabled" boolean DEFAULT false,
    CONSTRAINT "users_email_unique" UNIQUE("email")
  )`,
  `CREATE TABLE IF NOT EXISTS "employers" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "company_name" text NOT NULL,
    "slug" text NOT NULL,
    "logo_url" text,
    "banner_url" text,
    "description" text,
    "industry" text,
    "website" text,
    "location" text,
    "country" text,
    "verified" boolean DEFAULT false,
    "verified_at" timestamp,
    "subscription_tier" text DEFAULT 'FREE',
    "stripe_customer_id" text,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "employers_user_id_unique" UNIQUE("user_id"),
    CONSTRAINT "employers_slug_unique" UNIQUE("slug")
  )`,
  `CREATE TABLE IF NOT EXISTS "job_listings" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "short_description" text,
    "location" text NOT NULL,
    "city" text,
    "state" text,
    "country" text DEFAULT 'GLOBAL',
    "lat" double precision,
    "lng" double precision,
    "salary_min" integer,
    "salary_max" integer,
    "salary_currency" text DEFAULT 'USD',
    "employment_type" text DEFAULT 'FULL_TIME',
    "experience_level" text DEFAULT 'MID',
    "industry" text,
    "skills" text[],
    "is_remote" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "featured_until" timestamp,
    "status" text DEFAULT 'ACTIVE',
    "source" text DEFAULT 'INTERNAL',
    "external_url" text,
    "tracking_url" text,
    "employer_id" integer,
    "aggregator_id" integer,
    "posted_at" timestamp DEFAULT now(),
    "expires_at" timestamp,
    "view_count" integer DEFAULT 0,
    "click_count" integer DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS "alerts" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "job_id" integer NOT NULL,
    "match_score" double precision NOT NULL,
    "channel" text NOT NULL,
    "sent_at" timestamp DEFAULT now(),
    "opened_at" timestamp
  )`,
  `CREATE TABLE IF NOT EXISTS "applications" (
    "id" serial PRIMARY KEY NOT NULL,
    "job_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "cv_url" text,
    "cover_letter" text,
    "status" text DEFAULT 'NEW',
    "applied_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" serial PRIMARY KEY NOT NULL,
    "actor_id" integer NOT NULL,
    "action" text NOT NULL,
    "target_entity" text NOT NULL,
    "target_id" integer NOT NULL,
    "metadata" json,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "blog_posts" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" text NOT NULL,
    "slug" text NOT NULL,
    "content" text NOT NULL,
    "excerpt" text,
    "category" text,
    "author_id" integer NOT NULL,
    "is_published" boolean DEFAULT false,
    "published_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
  )`,
  `CREATE TABLE IF NOT EXISTS "click_events" (
    "id" serial PRIMARY KEY NOT NULL,
    "job_id" integer NOT NULL,
    "aggregator_id" integer,
    "user_id" integer,
    "session_id" text,
    "ip_address" text,
    "user_agent" text,
    "is_billable" boolean DEFAULT true,
    "timestamp" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "invoices" (
    "id" serial PRIMARY KEY NOT NULL,
    "aggregator_id" integer NOT NULL,
    "period_start" timestamp NOT NULL,
    "period_end" timestamp NOT NULL,
    "total_clicks" integer NOT NULL,
    "ppc_rate" double precision NOT NULL,
    "total_amount" double precision NOT NULL,
    "status" text DEFAULT 'PENDING',
    "stripe_invoice_id" text,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "job_seeker_profiles" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "skills" text[],
    "preferred_locations" text[],
    "preferred_countries" text[],
    "preferred_employment" text[],
    "salary_min" integer,
    "salary_max" integer,
    "cv_url" text,
    "cv_file_name" text,
    "parsed_cv_data" json,
    "alert_frequency" text DEFAULT 'DAILY',
    "alert_channels" text[],
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "job_seeker_profiles_user_id_unique" UNIQUE("user_id")
  )`,
  `CREATE TABLE IF NOT EXISTS "notifications" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text NOT NULL,
    "related_id" integer,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "saved_jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "job_id" integer NOT NULL,
    "saved_at" timestamp DEFAULT now()
  )`,
];

const ADD_FOREIGN_KEYS_SQL = [
  `ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "alerts" ADD CONSTRAINT "alerts_job_id_job_listings_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_job_listings_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "click_events" ADD CONSTRAINT "click_events_job_id_job_listings_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "click_events" ADD CONSTRAINT "click_events_aggregator_id_aggregator_partners_id_fk" FOREIGN KEY ("aggregator_id") REFERENCES "public"."aggregator_partners"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "click_events" ADD CONSTRAINT "click_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "employers" ADD CONSTRAINT "employers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "invoices" ADD CONSTRAINT "invoices_aggregator_id_aggregator_partners_id_fk" FOREIGN KEY ("aggregator_id") REFERENCES "public"."aggregator_partners"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_aggregator_id_aggregator_partners_id_fk" FOREIGN KEY ("aggregator_id") REFERENCES "public"."aggregator_partners"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "job_seeker_profiles" ADD CONSTRAINT "job_seeker_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_job_listings_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE no action ON UPDATE no action`,
];

export async function setupDatabase(): Promise<void> {
  for (const sql of CREATE_TABLES_SQL) {
    await pool.query(sql);
  }

  for (const sql of ADD_FOREIGN_KEYS_SQL) {
    try {
      await pool.query(sql);
    } catch (err: any) {
      if (err.code !== "42710" && err.code !== "42P07") {
        throw err;
      }
    }
  }
}
