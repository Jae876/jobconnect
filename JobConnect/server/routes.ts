import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import {
  jobSeekerRegistrationSchema,
  employerRegistrationSchema,
  loginSchema,
  jobPostingSchema,
  insertApplicationSchema,
  scheduleInterviewSchema,
  companyReviewSchema,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Configure session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "fallback-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(sessionMiddleware);

  // Auth routes
  app.post("/api/auth/register/job-seeker", async (req, res) => {
    try {
      const validatedData = jobSeekerRegistrationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        passwordHash,
        role: "job_seeker",
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        bio: validatedData.bio,
      });

      // Create job seeker profile
      await storage.createJobSeeker({
        userId: user.id,
        professionalTitle: validatedData.professionalTitle,
        yearsExperience: validatedData.yearsExperience,
        skills: validatedData.skills,
        location: validatedData.location,
        expectedSalaryMin: validatedData.expectedSalaryMin,
        expectedSalaryMax: validatedData.expectedSalaryMax,
        salaryType: validatedData.salaryType,
        workPreference: validatedData.workPreference,
        availability: validatedData.availability,
        openToRelocate: validatedData.openToRelocate,
      });

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).userRole = user.role;

      res.json({ success: true, role: user.role });
    } catch (error: any) {
      console.error("Job seeker registration error:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/register/employer", async (req, res) => {
    try {
      const validatedData = employerRegistrationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        passwordHash,
        role: "employer",
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        bio: validatedData.bio,
      });

      // Create employer profile
      await storage.createEmployer({
        userId: user.id,
        jobTitle: validatedData.jobTitle,
        companyName: validatedData.companyName,
        companySize: validatedData.companySize,
        industry: validatedData.industry,
        companyLocation: validatedData.companyLocation,
        companyDescription: validatedData.companyDescription,
        website: validatedData.website,
        foundedYear: validatedData.foundedYear,
        remotePolicy: validatedData.remotePolicy,
      });

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).userRole = user.role;

      res.json({ success: true, role: user.role });
    } catch (error: any) {
      console.error("Employer registration error:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login timestamp (commented out - lastLogin not in schema)
      // await storage.updateUser(user.id, { lastLogin: new Date() });

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).userRole = user.role;

      res.json({ success: true, role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const userRole = (req.session as any).userRole;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let profile = null;
      if (userRole === "job_seeker") {
        profile = await storage.getJobSeeker(userId);
      } else if (userRole === "employer") {
        profile = await storage.getEmployer(userId);
      }

      res.json({ user, profile });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Dashboard data endpoints
  app.get("/api/dashboard/job-seeker", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const dashboardData = await storage.getJobSeekerDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Job seeker dashboard error:", error);
      res.status(500).json({ message: "Failed to get dashboard data" });
    }
  });

  app.get("/api/dashboard/employer", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const dashboardData = await storage.getEmployerDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Employer dashboard error:", error);
      res.status(500).json({ message: "Failed to get dashboard data" });
    }
  });

  // Job routes with search functionality
  app.get("/api/jobs", async (req, res) => {
    try {
      const { search, location, employmentType } = req.query;
      const jobs = await storage.getJobs(
        search as string,
        location as string,
        employmentType as string
      );
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to get jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Get job error:", error);
      res.status(500).json({ message: "Failed to get job" });
    }
  });

  app.get("/api/jobs/employer/my-jobs", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const employer = await storage.getEmployer(userId);
      
      if (!employer) {
        return res.status(404).json({ message: "Employer profile not found" });
      }

      const jobs = await storage.getJobsByEmployer(employer.id);
      res.json(jobs);
    } catch (error) {
      console.error("Get employer jobs error:", error);
      res.status(500).json({ message: "Failed to get jobs" });
    }
  });

  app.post("/api/jobs", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const employer = await storage.getEmployer(userId);
      
      if (!employer) {
        return res.status(404).json({ message: "Employer profile not found" });
      }

      const validatedData = jobPostingSchema.parse(req.body);

      const job = await storage.createJob({
        ...validatedData,
        employerId: employer.id,
        status: "active",
      });
      res.json(job);
    } catch (error: any) {
      console.error("Create job error:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const employer = await storage.getEmployer(userId);
      
      if (!employer) {
        return res.status(404).json({ message: "Employer profile not found" });
      }

      const job = await storage.getJob(req.params.id);
      if (!job || job.employerId !== employer.id) {
        return res.status(404).json({ message: "Job not found or unauthorized" });
      }

      const validatedData = jobPostingSchema.parse(req.body);
      const updatedJob = await storage.updateJob(req.params.id, validatedData);
      res.json(updatedJob);
    } catch (error: any) {
      console.error("Update job error:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const employer = await storage.getEmployer(userId);
      
      if (!employer) {
        return res.status(404).json({ message: "Employer profile not found" });
      }

      const job = await storage.getJob(req.params.id);
      if (!job || job.employerId !== employer.id) {
        return res.status(404).json({ message: "Job not found or unauthorized" });
      }

      await storage.deleteJob(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete job error:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Application routes
  app.get("/api/applications/job-seeker", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const jobSeeker = await storage.getJobSeeker(userId);
      
      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      const applications = await storage.getApplicationsByJobSeeker(jobSeeker.id);
      res.json(applications);
    } catch (error) {
      console.error("Get job seeker applications error:", error);
      res.status(500).json({ message: "Failed to get applications" });
    }
  });

  app.get("/api/applications/employer", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const employer = await storage.getEmployer(userId);
      
      if (!employer) {
        return res.status(404).json({ message: "Employer profile not found" });
      }

      const applications = await storage.getApplicationsByEmployer(employer.id);
      res.json(applications);
    } catch (error) {
      console.error("Get employer applications error:", error);
      res.status(500).json({ message: "Failed to get applications" });
    }
  });

  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const jobSeeker = await storage.getJobSeeker(userId);
      
      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        jobSeekerId: jobSeeker.id,
        status: "pending",
      });

      const application = await storage.createApplication(validatedData);
      res.json(application);
    } catch (error: any) {
      console.error("Create application error:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.put("/api/applications/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const application = await storage.updateApplicationStatus(req.params.id, status);
      res.json(application);
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Interview routes
  app.get("/api/interviews/job-seeker", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const jobSeeker = await storage.getJobSeeker(userId);
      
      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      const interviews = await storage.getInterviewsByJobSeeker(jobSeeker.id);
      res.json(interviews);
    } catch (error) {
      console.error("Get job seeker interviews error:", error);
      res.status(500).json({ message: "Failed to get interviews" });
    }
  });

  app.get("/api/interviews/employer", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const employer = await storage.getEmployer(userId);
      
      if (!employer) {
        return res.status(404).json({ message: "Employer profile not found" });
      }

      const interviews = await storage.getInterviewsByEmployer(employer.id);
      res.json(interviews);
    } catch (error) {
      console.error("Get employer interviews error:", error);
      res.status(500).json({ message: "Failed to get interviews" });
    }
  });

  app.post("/api/interviews", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      // Get employer and application info for the interview
      const employer = await storage.getEmployer(userId);
      if (!employer) {
        return res.status(404).json({ message: "Employer profile not found" });
      }

      const application = await storage.getApplication(req.body.applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Convert scheduledAt string to Date object before validation
      const requestData = {
        ...req.body,
        scheduledAt: new Date(req.body.scheduledAt),
      };

      const validatedData = scheduleInterviewSchema.parse(requestData);

      const interview = await storage.createInterview({
        ...validatedData,
        employerId: employer.id,
        jobSeekerId: application.jobSeekerId,
        status: "scheduled",
      });
      res.json(interview);
    } catch (error: any) {
      console.error("Create interview error:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to schedule interview" });
    }
  });

  // Update interview status
  app.put("/api/interviews/:id", requireAuth, async (req, res) => {
    try {
      const interviewId = req.params.id;
      const { status, feedback } = req.body;
      
      // Validate status
      const validStatuses = ["scheduled", "completed", "cancelled", "rescheduled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const interview = await storage.updateInterview(interviewId, { 
        status, 
        feedback: feedback || null 
      });
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      res.json(interview);
    } catch (error: any) {
      console.error("Update interview error:", error);
      res.status(500).json({ message: "Failed to update interview" });
    }
  });

  // Messaging routes
  app.get("/api/messages/conversations", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Failed to get conversations" });
    }
  });

  app.get("/api/messages/:receiverId", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const messages = await storage.getMessages(userId, req.params.receiverId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { receiverId, content, applicationId } = req.body;

      const message = await storage.createMessage({
        senderId: userId,
        receiverId,
        content,
        applicationId,
      });
      res.json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Company review routes
  app.get("/api/reviews/:employerId", async (req, res) => {
    try {
      const reviews = await storage.getCompanyReviews(req.params.employerId);
      res.json(reviews);
    } catch (error) {
      console.error("Get company reviews error:", error);
      res.status(500).json({ message: "Failed to get reviews" });
    }
  });

  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const jobSeeker = await storage.getJobSeeker(userId);
      
      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      const validatedData = companyReviewSchema.parse(req.body);

      const review = await storage.createCompanyReview({
        ...validatedData,
        jobSeekerId: jobSeeker.id,
      });
      res.json(review);
    } catch (error: any) {
      console.error("Create review error:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Saved jobs routes
  app.post("/api/saved-jobs", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const jobSeeker = await storage.getJobSeeker(userId);
      
      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      const { jobId } = req.body;
      await storage.saveJob(jobSeeker.id, jobId);
      res.json({ success: true });
    } catch (error) {
      console.error("Save job error:", error);
      res.status(500).json({ message: "Failed to save job" });
    }
  });

  app.delete("/api/saved-jobs/:jobId", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const jobSeeker = await storage.getJobSeeker(userId);
      
      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      await storage.unsaveJob(jobSeeker.id, req.params.jobId);
      res.json({ success: true });
    } catch (error) {
      console.error("Unsave job error:", error);
      res.status(500).json({ message: "Failed to unsave job" });
    }
  });

  app.get("/api/saved-jobs", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const jobSeeker = await storage.getJobSeeker(userId);
      
      if (!jobSeeker) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }

      const savedJobs = await storage.getSavedJobs(jobSeeker.id);
      res.json(savedJobs);
    } catch (error) {
      console.error("Get saved jobs error:", error);
      res.status(500).json({ message: "Failed to get saved jobs" });
    }
  });

  // Skills routes
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      console.error("Get skills error:", error);
      res.status(500).json({ message: "Failed to get skills" });
    }
  });

  app.get("/api/skills/user", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Get user skills error:", error);
      res.status(500).json({ message: "Failed to get user skills" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}