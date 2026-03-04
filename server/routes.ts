import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed Database 
  await seedDatabase();

  // ----- Auth Routes -----
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(email);
      // Placeholder for proper auth logic
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.status(200).json(user);
    } catch (err) {
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
  });

  // ----- Jobs Routes -----
  app.get(api.jobs.list.path, async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  });

  app.post(api.jobs.create.path, async (req, res) => {
    try {
      const input = api.jobs.create.input.parse(req.body);
      const job = await storage.createJob(input);
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.jobs.update.path, async (req, res) => {
    try {
      const input = api.jobs.update.input.parse(req.body);
      const updated = await storage.updateJob(Number(req.params.id), input);
      if (!updated) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(updated);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.jobs.delete.path, async (req, res) => {
    await storage.deleteJob(Number(req.params.id));
    res.status(204).end();
  });

  // ----- Employers Routes -----
  app.get(api.employers.list.path, async (req, res) => {
    const employers = await storage.getEmployers();
    res.json(employers);
  });

  app.get(api.employers.get.path, async (req, res) => {
    const employer = await storage.getEmployerBySlug(req.params.slug);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }
    res.json(employer);
  });

  app.post(api.employers.create.path, async (req, res) => {
    try {
      const input = api.employers.create.input.parse(req.body);
      const employer = await storage.createEmployer(input);
      res.status(201).json(employer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ----- Applications Routes -----
  app.get(api.applications.list.path, async (req, res) => {
    // In a real app we'd filter by the logged in user
    const applications = await storage.getApplications();
    res.json(applications);
  });

  app.post(api.applications.create.path, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      const app = await storage.createApplication(input);
      res.status(201).json(app);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });


  return httpServer;
}

async function seedDatabase() {
  const employers = await storage.getEmployers();
  if (employers.length === 0) {
    const adminUser = await storage.createUser({
      email: "admin@findandhire.me",
      name: "Admin User",
      role: "SUPER_ADMIN",
      hashedPassword: "password123", // Using placeholder for now
    });
    
    const employerUser = await storage.createUser({
      email: "hr@techcorp.com",
      name: "TechCorp HR",
      role: "EMPLOYER",
      hashedPassword: "password123"
    });

    const company = await storage.createEmployer({
      userId: employerUser.id,
      companyName: "TechCorp Global",
      slug: "techcorp-global",
      industry: "Technology",
      location: "San Francisco, CA",
      country: "US",
      verified: true
    });

    const jobs = await storage.getJobs();
    if (jobs.length === 0) {
      await storage.createJob({
        title: "Senior Full Stack Engineer",
        description: "We are looking for an experienced full stack engineer to join our core team. You will work with Next.js, Node.js, and PostgreSQL.",
        shortDescription: "Join our core team as a Senior Full Stack Engineer.",
        location: "San Francisco, CA",
        country: "US",
        salaryMin: 130000,
        salaryMax: 180000,
        salaryCurrency: "USD",
        employmentType: "FULL_TIME",
        experienceLevel: "SENIOR",
        industry: "Technology",
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
        isRemote: true,
        isFeatured: true,
        employerId: company.id
      });

      await storage.createJob({
        title: "Frontend Developer",
        description: "Build beautiful and responsive user interfaces with React and Tailwind CSS. Join a fast-paced product team.",
        shortDescription: "Build beautiful and responsive user interfaces.",
        location: "London",
        country: "UK",
        salaryMin: 60000,
        salaryMax: 85000,
        salaryCurrency: "GBP",
        employmentType: "FULL_TIME",
        experienceLevel: "MID",
        industry: "Technology",
        skills: ["React", "Tailwind CSS", "JavaScript"],
        isRemote: false,
        employerId: company.id
      });
      
      await storage.createJob({
        title: "DevOps Engineer",
        description: "Manage our cloud infrastructure and deployment pipelines on AWS.",
        shortDescription: "Manage our cloud infrastructure on AWS.",
        location: "Lagos",
        country: "NG",
        salaryMin: 15000000,
        salaryMax: 25000000,
        salaryCurrency: "NGN",
        employmentType: "FULL_TIME",
        experienceLevel: "SENIOR",
        industry: "Technology",
        skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        isRemote: true,
        employerId: company.id
      });
    }
  }
}