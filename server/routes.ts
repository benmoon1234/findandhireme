import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  await seedDatabase();

  function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    next();
  }

  async function requireRole(req: Request, res: Response, next: NextFunction, roles: string[]) {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(req.session.userId);
    if (!user || !roles.includes(user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  }

  // ----- Auth Routes -----
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashed = await bcrypt.hash(input.hashedPassword || "password123", 10);
      const user = await storage.createUser({ ...input, hashedPassword: hashed });
      req.session.userId = user.id;
      const { hashedPassword, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || !user.hashedPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const valid = await bcrypt.compare(password, user.hashedPassword);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      const { hashedPassword, ...safeUser } = user;
      res.status(200).json(safeUser);
    } catch (err) {
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { hashedPassword, ...safeUser } = user;
    res.json(safeUser);
  });

  // ----- Jobs Routes -----
  app.get(api.jobs.list.path, async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  });

  app.post(api.jobs.create.path, async (req, res, next) => {
    await requireRole(req, res, next, ["EMPLOYER", "SUPER_ADMIN"]);
  }, async (req, res) => {
    try {
      const input = api.jobs.create.input.parse(req.body);
      const job = await storage.createJob(input);
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.jobs.update.path, async (req, res, next) => {
    await requireRole(req, res, next, ["EMPLOYER", "SUPER_ADMIN"]);
  }, async (req, res) => {
    try {
      const input = api.jobs.update.input.parse(req.body);
      const updated = await storage.updateJob(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "Job not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.jobs.delete.path, async (req, res, next) => {
    await requireRole(req, res, next, ["EMPLOYER", "SUPER_ADMIN"]);
  }, async (req, res) => {
    await storage.deleteJob(Number(req.params.id));
    res.status(204).end();
  });

  // ----- Employers Routes -----
  app.get(api.employers.list.path, async (req, res) => {
    const list = await storage.getEmployers();
    res.json(list);
  });

  app.get(api.employers.get.path, async (req, res) => {
    const employer = await storage.getEmployerBySlug(req.params.slug);
    if (!employer) return res.status(404).json({ message: "Employer not found" });
    res.json(employer);
  });

  app.post(api.employers.create.path, async (req, res) => {
    try {
      const input = api.employers.create.input.parse(req.body);
      const employer = await storage.createEmployer(input);
      res.status(201).json(employer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // ----- Applications Routes -----
  app.get(api.applications.list.path, async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const apps = await storage.getApplications(req.session.userId);
    res.json(apps);
  });

  app.post(api.applications.create.path, async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.applications.create.input.parse(req.body);
      const application = await storage.createApplication({ ...input, userId: req.session.userId });
      res.status(201).json(application);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // ----- Saved Jobs Routes -----
  app.get(api.savedJobs.list.path, async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const saved = await storage.getSavedJobs(req.session.userId);
    res.json(saved);
  });

  app.post(api.savedJobs.save.path, async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const { jobId } = api.savedJobs.save.input.parse(req.body);
      const saved = await storage.saveJob(req.session.userId, jobId);
      res.status(201).json(saved);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.savedJobs.unsave.path, async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    await storage.unsaveJob(req.session.userId, Number(req.params.jobId));
    res.status(204).end();
  });

  // ----- Employer-specific Routes -----
  app.get("/api/employer/profile", requireAuth, async (req, res) => {
    const employer = await storage.getEmployerByUserId(req.session.userId!);
    if (!employer) return res.status(404).json({ message: "Employer profile not found" });
    res.json(employer);
  });

  app.get("/api/employer/jobs", requireAuth, async (req, res) => {
    const employer = await storage.getEmployerByUserId(req.session.userId!);
    if (!employer) return res.status(404).json({ message: "Employer profile not found" });
    const allJobs = await storage.getJobs();
    const myJobs = allJobs.filter(j => j.employerId === employer.id);
    res.json(myJobs);
  });

  app.get("/api/employer/applications", requireAuth, async (req, res) => {
    const employer = await storage.getEmployerByUserId(req.session.userId!);
    if (!employer) return res.status(404).json({ message: "Employer profile not found" });
    const allJobs = await storage.getJobs();
    const myJobIds = allJobs.filter(j => j.employerId === employer.id).map(j => j.id);
    const apps = await storage.getApplicationsByJobIds(myJobIds);
    res.json(apps);
  });

  // ----- Admin Routes -----
  app.get("/api/admin/stats", async (req, res, next) => {
    await requireRole(req, res, next, ["SUPER_ADMIN"]);
  }, async (req, res) => {
    const userCount = await storage.getUserCount();
    const allJobs = await storage.getJobs();
    const activeJobs = allJobs.filter(j => j.status === "ACTIVE").length;
    const allApps = await storage.getApplications();
    res.json({ totalUsers: userCount, activeJobs, totalJobs: allJobs.length, totalApplications: allApps.length });
  });

  app.get("/api/admin/users", async (req, res, next) => {
    await requireRole(req, res, next, ["SUPER_ADMIN"]);
  }, async (req, res) => {
    const allUsers = await storage.getAllUsers();
    const safeUsers = allUsers.map(({ hashedPassword, ...u }) => u);
    res.json(safeUsers);
  });

  app.patch("/api/employers/:id/verify", async (req, res, next) => {
    await requireRole(req, res, next, ["SUPER_ADMIN"]);
  }, async (req, res) => {
    const { verified } = req.body;
    const updated = await storage.updateEmployer(Number(req.params.id), {
      verified: verified === true,
    } as any);
    if (!updated) return res.status(404).json({ message: "Employer not found" });
    res.json(updated);
  });

  app.patch("/api/applications/:id/status", requireAuth, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ["NEW", "REVIEWING", "INTERVIEW", "REJECTED", "OFFERED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await storage.getUser(req.session.userId!);
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    if (user.role === "SUPER_ADMIN") {
      const updated = await storage.updateApplicationStatus(Number(req.params.id), status);
      if (!updated) return res.status(404).json({ message: "Application not found" });
      return res.json(updated);
    }

    if (user.role === "EMPLOYER") {
      const employer = await storage.getEmployerByUserId(user.id);
      if (!employer) return res.status(403).json({ message: "Forbidden" });
      const allJobs = await storage.getJobs();
      const myJobIds = allJobs.filter(j => j.employerId === employer.id).map(j => j.id);
      const apps = await storage.getApplicationsByJobIds(myJobIds);
      const app = apps.find(a => a.id === Number(req.params.id));
      if (!app) return res.status(403).json({ message: "Forbidden" });
      const updated = await storage.updateApplicationStatus(Number(req.params.id), status);
      if (!updated) return res.status(404).json({ message: "Application not found" });
      return res.json(updated);
    }

    return res.status(403).json({ message: "Forbidden" });
  });

  // ----- Seeker Profile Routes -----
  app.get("/api/profile", requireAuth, async (req, res) => {
    const profile = await storage.getSeekerProfile(req.session.userId!);
    res.json(profile || null);
  });

  app.patch("/api/profile", requireAuth, async (req, res) => {
    const profile = await storage.upsertSeekerProfile(req.session.userId!, req.body);
    res.json(profile);
  });

  app.post("/api/profile/cv", requireAuth, async (req, res) => {
    if (!req.files || !req.files.cv) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const file = req.files.cv as any;

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const ext = (file.name as string).toLowerCase().slice(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(ext) || !allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({ message: "Only PDF, DOC, and DOCX files are allowed" });
    }

    const safeName = `cv_${req.session.userId}_${Date.now()}${ext}`;
    const uploadPath = `uploads/${safeName}`;

    const fs = await import("fs");
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads", { recursive: true });
    }

    await file.mv(uploadPath);
    const profile = await storage.upsertSeekerProfile(req.session.userId!, {
      cvUrl: `/${uploadPath}`,
      cvFileName: file.name.replace(/[/\\]/g, "_"),
    });
    res.json(profile);
  });

  // ----- Blog Posts Routes -----
  app.get(api.blogPosts.list.path, async (req, res) => {
    const posts = await storage.getBlogPosts();
    res.json(posts);
  });

  app.get(api.blogPosts.get.path, async (req, res) => {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: "Blog post not found" });
    res.json(post);
  });

  return httpServer;
}

async function seedDatabase() {
  const existingEmployers = await storage.getEmployers();
  if (existingEmployers.length > 0) return;

  const hashPw = async (pw: string) => bcrypt.hash(pw, 10);

  const admin = await storage.createUser({ email: "admin@findandhire.me", name: "Platform Admin", role: "SUPER_ADMIN", hashedPassword: await hashPw("admin123") });
  const emp1User = await storage.createUser({ email: "hr@techcorp.com", name: "Sarah Chen", role: "EMPLOYER", hashedPassword: await hashPw("password123") });
  const emp2User = await storage.createUser({ email: "talent@globalpay.com", name: "James Okonkwo", role: "EMPLOYER", hashedPassword: await hashPw("password123") });
  const emp3User = await storage.createUser({ email: "people@greenleaf.io", name: "Emily Watson", role: "EMPLOYER", hashedPassword: await hashPw("password123") });
  const emp4User = await storage.createUser({ email: "hr@finova.co.uk", name: "David Rahman", role: "EMPLOYER", hashedPassword: await hashPw("password123") });
  const emp5User = await storage.createUser({ email: "careers@mediasphere.com", name: "Priya Patel", role: "EMPLOYER", hashedPassword: await hashPw("password123") });

  const seeker = await storage.createUser({ email: "seeker@example.com", name: "Alex Johnson", role: "JOB_SEEKER", hashedPassword: await hashPw("password123") });

  // Create employers
  const techcorp = await storage.createEmployer({ userId: emp1User.id, companyName: "TechCorp Global", slug: "techcorp-global", industry: "Technology", location: "San Francisco, CA", country: "US", verified: true, description: "Leading enterprise software company building next-generation cloud infrastructure solutions for Fortune 500 companies worldwide.", website: "https://techcorp.example.com" });
  const globalpay = await storage.createEmployer({ userId: emp2User.id, companyName: "GlobalPay Solutions", slug: "globalpay-solutions", industry: "Fintech", location: "Lagos, Nigeria", country: "NG", verified: true, description: "Africa's fastest-growing digital payments platform, processing over $2B in transactions annually across 15 countries.", website: "https://globalpay.example.com" });
  const greenleaf = await storage.createEmployer({ userId: emp3User.id, companyName: "GreenLeaf Analytics", slug: "greenleaf-analytics", industry: "Data & AI", location: "Remote", country: "GLOBAL", verified: true, description: "A fully remote AI and data analytics company helping businesses make smarter decisions with machine learning.", website: "https://greenleaf.example.com" });
  const finova = await storage.createEmployer({ userId: emp4User.id, companyName: "Finova Capital", slug: "finova-capital", industry: "Finance", location: "London, UK", country: "UK", verified: true, description: "An award-winning investment management firm with $50B in assets under management, known for innovative financial products.", website: "https://finova.example.com" });
  const mediasphere = await storage.createEmployer({ userId: emp5User.id, companyName: "MediaSphere", slug: "mediasphere", industry: "Media & Entertainment", location: "New York, NY", country: "US", verified: true, description: "Digital media and entertainment conglomerate reaching 100M+ monthly active users through streaming, gaming, and content platforms.", website: "https://mediasphere.example.com" });

  // Create diverse job listings
  const jobData = [
    { title: "Senior Full Stack Engineer", description: "We are looking for an experienced full stack engineer to join our core platform team. You will architect and build scalable microservices using Node.js and React, mentor junior engineers, and drive technical decisions. Our stack includes Next.js, PostgreSQL, Redis, and Kubernetes.\n\nResponsibilities:\n- Design and implement new features across our full stack\n- Write clean, maintainable, and well-tested code\n- Participate in code reviews and architectural discussions\n- Mentor and guide junior team members", shortDescription: "Join our core team as a Senior Full Stack Engineer.", location: "San Francisco, CA", city: "San Francisco", state: "CA", country: "US", salaryMin: 150000, salaryMax: 200000, salaryCurrency: "USD", employmentType: "FULL_TIME", experienceLevel: "SENIOR", industry: "Technology", skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Kubernetes"], isRemote: true, isFeatured: true, employerId: techcorp.id },
    { title: "Frontend Developer", description: "Build beautiful and responsive user interfaces with React and Tailwind CSS. Join a fast-paced product team working on our flagship SaaS platform used by millions of users.\n\nRequirements:\n- 3+ years of React experience\n- Strong CSS/Tailwind skills\n- Experience with state management (Zustand, Redux)\n- Familiarity with design systems", shortDescription: "Build beautiful user interfaces for our SaaS platform.", location: "London, UK", city: "London", country: "UK", salaryMin: 55000, salaryMax: 80000, salaryCurrency: "GBP", employmentType: "FULL_TIME", experienceLevel: "MID", industry: "Technology", skills: ["React", "Tailwind CSS", "JavaScript", "TypeScript"], isRemote: false, isFeatured: true, employerId: finova.id },
    { title: "DevOps Engineer", description: "Manage our cloud infrastructure and deployment pipelines on AWS and GCP. You'll work closely with development teams to improve CI/CD, monitoring, and reliability.\n\nWhat you'll do:\n- Manage Kubernetes clusters and container orchestration\n- Build and maintain CI/CD pipelines\n- Implement infrastructure as code with Terraform\n- Monitor system health and optimize performance", shortDescription: "Manage cloud infrastructure on AWS and GCP.", location: "Lagos, Nigeria", city: "Lagos", country: "NG", salaryMin: 15000000, salaryMax: 28000000, salaryCurrency: "NGN", employmentType: "FULL_TIME", experienceLevel: "SENIOR", industry: "Technology", skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"], isRemote: true, isFeatured: false, employerId: globalpay.id },
    { title: "Product Manager", description: "Lead product strategy and execution for our B2B payments platform. Work closely with engineering, design, and sales to deliver features that drive growth.\n\nResponsibilities:\n- Define product roadmap and prioritize features\n- Conduct user research and analyze market trends\n- Write detailed PRDs and user stories\n- Measure product metrics and iterate based on data", shortDescription: "Lead product strategy for our payments platform.", location: "Lagos, Nigeria", city: "Lagos", country: "NG", salaryMin: 12000000, salaryMax: 20000000, salaryCurrency: "NGN", employmentType: "FULL_TIME", experienceLevel: "SENIOR", industry: "Fintech", skills: ["Product Strategy", "User Research", "Agile", "Analytics"], isRemote: false, isFeatured: true, employerId: globalpay.id },
    { title: "Machine Learning Engineer", description: "Design and deploy production ML models for our recommendation and forecasting systems. You'll work with large datasets and cutting-edge NLP/CV techniques.\n\nRequirements:\n- MS/PhD in CS, Statistics, or related field\n- 3+ years building production ML systems\n- Proficiency in Python, PyTorch/TensorFlow\n- Experience with MLOps tools (MLflow, Kubeflow)", shortDescription: "Build production ML models for recommendations.", location: "Remote", country: "GLOBAL", salaryMin: 140000, salaryMax: 190000, salaryCurrency: "USD", employmentType: "FULL_TIME", experienceLevel: "SENIOR", industry: "Data & AI", skills: ["Python", "PyTorch", "TensorFlow", "MLOps", "NLP"], isRemote: true, isFeatured: true, employerId: greenleaf.id },
    { title: "UX Designer", description: "Create intuitive and delightful user experiences for our financial products. You'll conduct user research, create wireframes and prototypes, and collaborate closely with engineers.\n\nWhat we're looking for:\n- 4+ years of product design experience\n- Strong portfolio showcasing complex UX problem-solving\n- Proficiency in Figma\n- Experience with design systems", shortDescription: "Design intuitive experiences for financial products.", location: "London, UK", city: "London", country: "UK", salaryMin: 50000, salaryMax: 70000, salaryCurrency: "GBP", employmentType: "FULL_TIME", experienceLevel: "MID", industry: "Finance", skills: ["Figma", "User Research", "Prototyping", "Design Systems"], isRemote: false, isFeatured: false, employerId: finova.id },
    { title: "Content Marketing Manager", description: "Drive our content strategy across blog, social media, and email channels. You'll create compelling stories about technology, careers, and industry trends.\n\nResponsibilities:\n- Develop and execute content calendar\n- Write and edit long-form articles, case studies\n- Manage social media presence\n- Analyze content performance and optimize", shortDescription: "Drive content strategy across all channels.", location: "New York, NY", city: "New York", state: "NY", country: "US", salaryMin: 85000, salaryMax: 120000, salaryCurrency: "USD", employmentType: "FULL_TIME", experienceLevel: "MID", industry: "Media & Entertainment", skills: ["Content Strategy", "SEO", "Copywriting", "Analytics"], isRemote: true, isFeatured: false, employerId: mediasphere.id },
    { title: "Data Analyst", description: "Analyze large datasets to uncover insights that drive business decisions. You'll build dashboards, create reports, and work with stakeholders across the organization.\n\nRequirements:\n- Strong SQL and Python skills\n- Experience with BI tools (Tableau, Looker, or Power BI)\n- Statistical analysis background\n- Excellent communication skills", shortDescription: "Uncover insights from data to drive decisions.", location: "Remote", country: "GLOBAL", salaryMin: 70000, salaryMax: 100000, salaryCurrency: "USD", employmentType: "FULL_TIME", experienceLevel: "MID", industry: "Data & AI", skills: ["SQL", "Python", "Tableau", "Statistics"], isRemote: true, isFeatured: false, employerId: greenleaf.id },
    { title: "iOS Developer", description: "Build and maintain our iOS mobile banking application used by 5M+ customers. You'll implement new features, improve performance, and ensure a smooth user experience.\n\nRequirements:\n- 3+ years of iOS development (Swift)\n- Experience with SwiftUI and UIKit\n- Knowledge of RESTful APIs and GraphQL\n- App Store submission experience", shortDescription: "Build iOS mobile banking app for millions.", location: "Lagos, Nigeria", city: "Lagos", country: "NG", salaryMin: 10000000, salaryMax: 18000000, salaryCurrency: "NGN", employmentType: "FULL_TIME", experienceLevel: "MID", industry: "Fintech", skills: ["Swift", "SwiftUI", "iOS", "GraphQL"], isRemote: false, isFeatured: false, employerId: globalpay.id },
    { title: "VP of Engineering", description: "Lead our engineering organization of 50+ engineers across multiple teams. You'll set technical direction, drive engineering culture, and scale our platform.\n\nResponsibilities:\n- Lead and grow engineering teams\n- Set technical strategy and architecture direction\n- Partner with product and business leadership\n- Drive engineering best practices and culture", shortDescription: "Lead engineering organization of 50+ engineers.", location: "San Francisco, CA", city: "San Francisco", state: "CA", country: "US", salaryMin: 250000, salaryMax: 350000, salaryCurrency: "USD", employmentType: "FULL_TIME", experienceLevel: "EXECUTIVE", industry: "Technology", skills: ["Engineering Leadership", "System Architecture", "Team Building", "Strategy"], isRemote: false, isFeatured: true, employerId: techcorp.id },
    { title: "Junior Backend Developer", description: "Great opportunity for a junior developer to grow their skills working on our Node.js backend services. You'll learn from senior engineers and contribute to real production systems.\n\nIdeal candidate:\n- CS degree or bootcamp graduate\n- Basic knowledge of JavaScript/TypeScript\n- Eagerness to learn and grow\n- Good problem-solving skills", shortDescription: "Grow your career as a backend developer.", location: "London, UK", city: "London", country: "UK", salaryMin: 30000, salaryMax: 40000, salaryCurrency: "GBP", employmentType: "FULL_TIME", experienceLevel: "ENTRY", industry: "Finance", skills: ["JavaScript", "Node.js", "SQL", "Git"], isRemote: false, isFeatured: false, employerId: finova.id },
    { title: "Video Production Specialist", description: "Create engaging video content for our streaming platform and social channels. You'll handle everything from concept to final edit.\n\nRequirements:\n- 2+ years video production experience\n- Proficiency in Adobe Premiere Pro, After Effects\n- Strong storytelling abilities\n- Experience with YouTube/TikTok content", shortDescription: "Create engaging video content for streaming.", location: "New York, NY", city: "New York", state: "NY", country: "US", salaryMin: 60000, salaryMax: 85000, salaryCurrency: "USD", employmentType: "CONTRACT", experienceLevel: "MID", industry: "Media & Entertainment", skills: ["Adobe Premiere", "After Effects", "Video Editing", "Storytelling"], isRemote: true, isFeatured: false, employerId: mediasphere.id },
  ];

  for (const job of jobData) {
    await storage.createJob(job as any);
  }

  // Create blog posts
  const blogData = [
    { title: "10 Tips to Ace Your Next Tech Interview", slug: "ace-tech-interview", content: "Landing a tech interview is just the first step. Here's how to make the most of it and walk away with an offer.\n\n1. **Research the company** thoroughly - understand their products, culture, and recent news.\n\n2. **Practice coding problems** on platforms like LeetCode, but focus on understanding patterns rather than memorizing solutions.\n\n3. **Prepare behavioral examples** using the STAR method (Situation, Task, Action, Result).\n\n4. **Ask thoughtful questions** that show genuine interest in the role and team.\n\n5. **Review system design fundamentals** if interviewing for senior roles.\n\n6. **Practice explaining your thought process** out loud while solving problems.\n\n7. **Dress appropriately** for the company culture.\n\n8. **Follow up** with a thank-you note within 24 hours.\n\n9. **Be honest** about what you don't know - interviewers value intellectual honesty.\n\n10. **Negotiate confidently** when you receive an offer.", excerpt: "Practical advice to help you prepare for and succeed in your next tech interview, from coding challenges to behavioral questions.", category: "Interview Tips", authorId: admin.id, isPublished: true, publishedAt: new Date() },
    { title: "Remote Work in 2026: The Complete Guide", slug: "remote-work-guide-2026", content: "Remote work has evolved significantly. Here's everything you need to know about working remotely in 2026.\n\n## Setting Up Your Home Office\n\nInvest in a quality desk, ergonomic chair, and good lighting. Your physical setup directly impacts your productivity and health.\n\n## Communication Best Practices\n\nOver-communicate rather than under-communicate. Use async communication tools effectively, and be mindful of time zones when scheduling meetings.\n\n## Maintaining Work-Life Balance\n\nSet clear boundaries between work and personal time. Create a dedicated workspace and establish a routine.\n\n## Tools of the Trade\n\nFamiliarize yourself with collaboration tools like Slack, Notion, Figma, and video conferencing platforms.\n\n## Career Growth\n\nDon't let remote work stall your career. Actively seek feedback, mentor others, and volunteer for visible projects.", excerpt: "Everything you need to know about thriving in remote work, from home office setup to career growth strategies.", category: "Career Advice", authorId: admin.id, isPublished: true, publishedAt: new Date() },
    { title: "How to Write a CV That Gets Noticed in Nigeria", slug: "cv-writing-nigeria", content: "The Nigerian job market is competitive. Here's how to craft a CV that stands out to recruiters and hiring managers.\n\n## Format and Structure\n\nKeep your CV to 2 pages maximum. Use a clean, professional format with clear sections: Contact Info, Professional Summary, Experience, Education, Skills.\n\n## Tailor for Each Application\n\nCustomize your CV for each job you apply to. Mirror the language used in the job description and highlight relevant experience.\n\n## Quantify Your Achievements\n\nInstead of 'managed a team,' write 'led a team of 8 engineers, delivering 3 major product launches on time.'\n\n## Include Relevant Certifications\n\nNigerian employers value professional certifications. Include any relevant ones prominently.\n\n## Digital Presence\n\nInclude your LinkedIn profile URL and any relevant portfolio links.", excerpt: "Expert tips for crafting a standout CV tailored to the Nigerian job market.", category: "CV Writing", authorId: admin.id, isPublished: true, publishedAt: new Date() },
    { title: "Top In-Demand Skills for UK Tech Jobs in 2026", slug: "uk-tech-skills-2026", content: "The UK tech sector continues to grow rapidly. Here are the most sought-after skills by employers.\n\n## Cloud Computing\n\nAWS, Azure, and GCP skills remain the most requested. Multi-cloud expertise is increasingly valued.\n\n## AI and Machine Learning\n\nPractical AI skills - not just theory. Employers want engineers who can build and deploy ML models in production.\n\n## Cybersecurity\n\nWith increasing data regulations, security expertise is critical. CISSP and CEH certifications are particularly valued.\n\n## Full Stack Development\n\nTypeScript, React, Node.js, and PostgreSQL remain the dominant full stack combination.\n\n## Data Engineering\n\nBuilding data pipelines and infrastructure is increasingly important as companies become more data-driven.\n\n## DevOps and Platform Engineering\n\nKubernetes, Docker, and infrastructure-as-code skills are essential for modern engineering teams.", excerpt: "Stay ahead of the curve with the most in-demand technical skills in the UK job market.", category: "Industry Trends", authorId: admin.id, isPublished: true, publishedAt: new Date() },
    { title: "Salary Negotiation: Get What You're Worth", slug: "salary-negotiation-guide", content: "Many professionals leave money on the table by not negotiating. Here's how to negotiate effectively.\n\n## Do Your Research\n\nUse salary comparison tools and industry reports to understand your market value. Factor in location, experience, and company size.\n\n## Time It Right\n\nNegotiate after receiving an offer, not during interviews. This is when you have the most leverage.\n\n## Consider the Full Package\n\nSalary is just one component. Consider equity, bonuses, remote work flexibility, professional development budget, and other benefits.\n\n## Practice Your Pitch\n\nPrepare specific examples of your value and impact. Use data and metrics wherever possible.\n\n## Be Professional\n\nNegotiation should be collaborative, not adversarial. Express enthusiasm for the role while advocating for fair compensation.", excerpt: "Learn proven strategies to negotiate your salary confidently and secure the compensation you deserve.", category: "Career Advice", authorId: admin.id, isPublished: true, publishedAt: new Date() },
  ];

  for (const post of blogData) {
    await storage.createBlogPost(post);
  }
}
