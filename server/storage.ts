import { db } from "./db";
import { eq, and, inArray, count } from "drizzle-orm";
import {
  users,
  jobListings,
  employers,
  applications,
  savedJobs,
  blogPosts,
  jobSeekerProfiles,
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
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserCount(): Promise<number>;

  getJobs(): Promise<JobListing[]>;
  getJob(id: number): Promise<JobListing | undefined>;
  createJob(job: InsertJobListing): Promise<JobListing>;
  updateJob(id: number, updates: Partial<InsertJobListing>): Promise<JobListing | undefined>;
  deleteJob(id: number): Promise<void>;

  getEmployers(): Promise<Employer[]>;
  getEmployerBySlug(slug: string): Promise<Employer | undefined>;
  getEmployerByUserId(userId: number): Promise<Employer | undefined>;
  createEmployer(employer: InsertEmployer): Promise<Employer>;
  updateEmployer(id: number, updates: Partial<InsertEmployer>): Promise<Employer | undefined>;

  getApplications(userId?: number): Promise<Application[]>;
  getApplicationsByJobIds(jobIds: number[]): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;

  getSavedJobs(userId: number): Promise<any[]>;
  saveJob(userId: number, jobId: number): Promise<any>;
  unsaveJob(userId: number, jobId: number): Promise<void>;

  getBlogPosts(): Promise<any[]>;
  getBlogPostBySlug(slug: string): Promise<any | undefined>;
  createBlogPost(post: any): Promise<any>;

  getSeekerProfile(userId: number): Promise<any | undefined>;
  upsertSeekerProfile(userId: number, data: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserCount(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(users);
    return result.value;
  }

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
    const [updated] = await db.update(jobListings).set(updates).where(eq(jobListings.id, id)).returning();
    return updated;
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobListings).where(eq(jobListings.id, id));
  }

  async getEmployers(): Promise<Employer[]> {
    return await db.select().from(employers);
  }

  async getEmployerBySlug(slug: string): Promise<Employer | undefined> {
    const [employer] = await db.select().from(employers).where(eq(employers.slug, slug));
    return employer;
  }

  async getEmployerByUserId(userId: number): Promise<Employer | undefined> {
    const [employer] = await db.select().from(employers).where(eq(employers.userId, userId));
    return employer;
  }

  async createEmployer(employer: InsertEmployer): Promise<Employer> {
    const [created] = await db.insert(employers).values(employer).returning();
    return created;
  }

  async updateEmployer(id: number, updates: Partial<InsertEmployer>): Promise<Employer | undefined> {
    const [updated] = await db.update(employers).set(updates).where(eq(employers.id, id)).returning();
    return updated;
  }

  async getApplications(userId?: number): Promise<Application[]> {
    if (userId) {
      return await db.select().from(applications).where(eq(applications.userId, userId));
    }
    return await db.select().from(applications);
  }

  async getApplicationsByJobIds(jobIds: number[]): Promise<Application[]> {
    if (jobIds.length === 0) return [];
    return await db.select().from(applications).where(inArray(applications.jobId, jobIds));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [created] = await db.insert(applications).values(application).returning();
    return created;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [updated] = await db.update(applications).set({ status, updatedAt: new Date() }).where(eq(applications.id, id)).returning();
    return updated;
  }

  async getSavedJobs(userId: number): Promise<any[]> {
    return await db.select().from(savedJobs).where(eq(savedJobs.userId, userId));
  }

  async saveJob(userId: number, jobId: number): Promise<any> {
    const [saved] = await db.insert(savedJobs).values({ userId, jobId }).returning();
    return saved;
  }

  async unsaveJob(userId: number, jobId: number): Promise<void> {
    await db.delete(savedJobs).where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
  }

  async getBlogPosts(): Promise<any[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true));
  }

  async getBlogPostBySlug(slug: string): Promise<any | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: any): Promise<any> {
    const [created] = await db.insert(blogPosts).values(post).returning();
    return created;
  }

  async getSeekerProfile(userId: number): Promise<any | undefined> {
    const [profile] = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, userId));
    return profile;
  }

  async upsertSeekerProfile(userId: number, data: any): Promise<any> {
    const existing = await this.getSeekerProfile(userId);
    if (existing) {
      const [updated] = await db.update(jobSeekerProfiles).set({ ...data, updatedAt: new Date() }).where(eq(jobSeekerProfiles.userId, userId)).returning();
      return updated;
    }
    const [created] = await db.insert(jobSeekerProfiles).values({ userId, ...data }).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
