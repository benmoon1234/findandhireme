import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users,
  jobListings,
  employers,
  applications,
  type User,
  type InsertUser,
  type JobListing,
  type InsertJobListing,
  type Employer,
  type InsertEmployer,
  type Application,
  type InsertApplication,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Jobs
  getJobs(): Promise<JobListing[]>;
  getJob(id: number): Promise<JobListing | undefined>;
  createJob(job: InsertJobListing): Promise<JobListing>;
  updateJob(id: number, updates: Partial<InsertJobListing>): Promise<JobListing | undefined>;
  deleteJob(id: number): Promise<void>;

  // Employers
  getEmployers(): Promise<Employer[]>;
  getEmployerBySlug(slug: string): Promise<Employer | undefined>;
  createEmployer(employer: InsertEmployer): Promise<Employer>;

  // Applications
  getApplications(userId?: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Jobs
  async getJobs(): Promise<JobListing[]> {
    return await db.select().from(jobListings);
  }

  async getJob(id: number): Promise<JobListing | undefined> {
    const [job] = await db.select().from(jobListings).where(eq(jobListings.id, id));
    return job;
  }

  async createJob(job: InsertJobListing): Promise<JobListing> {
    const [created] = await db.insert(jobListings).values(job).returning();
    return created;
  }

  async updateJob(id: number, updates: Partial<InsertJobListing>): Promise<JobListing | undefined> {
    const [updated] = await db
      .update(jobListings)
      .set(updates)
      .where(eq(jobListings.id, id))
      .returning();
    return updated;
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobListings).where(eq(jobListings.id, id));
  }

  // Employers
  async getEmployers(): Promise<Employer[]> {
    return await db.select().from(employers);
  }

  async getEmployerBySlug(slug: string): Promise<Employer | undefined> {
    const [employer] = await db.select().from(employers).where(eq(employers.slug, slug));
    return employer;
  }

  async createEmployer(employer: InsertEmployer): Promise<Employer> {
    const [created] = await db.insert(employers).values(employer).returning();
    return created;
  }

  // Applications
  async getApplications(userId?: number): Promise<Application[]> {
    if (userId) {
      return await db.select().from(applications).where(eq(applications.userId, userId));
    }
    return await db.select().from(applications);
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [created] = await db.insert(applications).values(application).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
