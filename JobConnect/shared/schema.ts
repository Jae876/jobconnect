import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - Enhanced with more fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'job_seeker' or 'employer'
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  profileImage: varchar("profile_image", { length: 500 }),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Job Seekers profile
export const jobSeekers = pgTable("job_seekers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  professionalTitle: varchar("professional_title", { length: 200 }),
  yearsExperience: varchar("years_experience", { length: 20 }),
  skills: text("skills").array(),
  location: varchar("location", { length: 200 }),
  resumeUrl: varchar("resume_url", { length: 500 }),
  portfolioUrl: varchar("portfolio_url", { length: 500 }),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  githubUrl: varchar("github_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  expectedSalaryMin: integer("expected_salary_min"),
  expectedSalaryMax: integer("expected_salary_max"),
  salaryType: varchar("salary_type", { length: 20 }).default("monthly"), // hourly, monthly, yearly
  workPreference: varchar("work_preference", { length: 50 }), // remote, onsite, hybrid
  availability: varchar("availability", { length: 100 }),
  noticePeriod: varchar("notice_period", { length: 50 }),
  education: jsonb("education"), // Array of education objects
  experience: jsonb("experience"), // Array of experience objects
  certifications: jsonb("certifications"), // Array of certification objects
  languages: text("languages").array(),
  openToRelocate: boolean("open_to_relocate").default(false),
  jobAlerts: boolean("job_alerts").default(true),
  profileVisibility: varchar("profile_visibility", { length: 20 }).default("public"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Employers profile
export const employers = pgTable("employers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  jobTitle: varchar("job_title", { length: 200 }),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  companySize: varchar("company_size", { length: 20 }),
  industry: varchar("industry", { length: 100 }),
  companyLocation: varchar("company_location", { length: 200 }),
  companyDescription: text("company_description"),
  companyLogo: varchar("company_logo", { length: 500 }),
  website: varchar("website", { length: 500 }),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  foundedYear: integer("founded_year"),
  employeeCount: integer("employee_count"),
  headquarters: varchar("headquarters", { length: 200 }),
  benefits: text("benefits").array(),
  companyValues: text("company_values").array(),
  workCulture: text("work_culture"),
  remotePolicy: varchar("remote_policy", { length: 50 }), // remote, onsite, hybrid, flexible
  isVerified: boolean("is_verified").default(false),
  isHiring: boolean("is_hiring").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employerId: varchar("employer_id").references(() => employers.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  department: varchar("department", { length: 100 }),
  employmentType: varchar("employment_type", { length: 50 }).notNull(), // full-time, part-time, contract, internship
  experienceLevel: varchar("experience_level", { length: 50 }), // entry, mid, senior, executive
  workLocation: varchar("work_location", { length: 50 }).default("office"), // remote, onsite, hybrid
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryType: varchar("salary_type", { length: 20 }).default("monthly"), // hourly, monthly, yearly
  currency: varchar("currency", { length: 3 }).default("USD"),
  requiredSkills: text("required_skills").array(),
  preferredSkills: text("preferred_skills").array(),
  responsibilities: text("responsibilities").array(),
  requirements: text("requirements").array(),
  benefits: text("benefits").array(),
  location: varchar("location", { length: 200 }),
  applicationDeadline: timestamp("application_deadline"),
  startDate: timestamp("start_date"),
  isUrgent: boolean("is_urgent").default(false),
  isFeatured: boolean("is_featured").default(false),
  views: integer("views").default(0),
  applicationsCount: integer("applications_count").default(0),
  status: varchar("status", { length: 20 }).default("active"), // active, paused, closed, filled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job Applications
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  jobSeekerId: varchar("job_seeker_id").references(() => jobSeekers.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, reviewed, shortlisted, interview, accepted, rejected
  coverLetter: text("cover_letter"),
  customResume: varchar("custom_resume", { length: 500 }),
  expectedSalary: integer("expected_salary"),
  availability: varchar("availability", { length: 100 }),
  notes: text("notes"), // Internal notes from employer
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interview Scheduling System
export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => applications.id, { onDelete: "cascade" }).notNull(),
  employerId: varchar("employer_id").references(() => employers.id, { onDelete: "cascade" }).notNull(),
  jobSeekerId: varchar("job_seeker_id").references(() => jobSeekers.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // minutes
  type: varchar("type", { length: 50 }).notNull(), // phone, video, in-person
  location: varchar("location", { length: 255 }), // Physical address or meeting link
  status: varchar("status", { length: 50 }).default("scheduled"), // scheduled, completed, cancelled, rescheduled
  interviewerNotes: text("interviewer_notes"),
  candidateNotes: text("candidate_notes"),
  rating: integer("rating"), // 1-5 scale
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company Reviews (like Glassdoor)
export const companyReviews = pgTable("company_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employerId: varchar("employer_id").references(() => employers.id, { onDelete: "cascade" }).notNull(),
  jobSeekerId: varchar("job_seeker_id").references(() => jobSeekers.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(), // 1-5 scale
  title: varchar("title", { length: 255 }).notNull(),
  pros: text("pros"),
  cons: text("cons"),
  advice: text("advice"),
  workLifeBalance: integer("work_life_balance"), // 1-5 scale
  compensation: integer("compensation"), // 1-5 scale
  culture: integer("culture"), // 1-5 scale
  management: integer("management"), // 1-5 scale
  isCurrentEmployee: boolean("is_current_employee").default(false),
  jobTitle: varchar("job_title", { length: 255 }),
  department: varchar("department", { length: 255 }),
  isAnonymous: boolean("is_anonymous").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved Jobs (Job Seeker bookmarks)
export const savedJobs = pgTable("saved_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobSeekerId: varchar("job_seeker_id").references(() => jobSeekers.id, { onDelete: "cascade" }).notNull(),
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job Recommendations/Matches
export const jobMatches = pgTable("job_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobSeekerId: varchar("job_seeker_id").references(() => jobSeekers.id, { onDelete: "cascade" }).notNull(),
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  matchScore: decimal("match_score", { precision: 3, scale: 2 }), // 0.00 to 1.00
  matchReasons: text("match_reasons").array(),
  isViewed: boolean("is_viewed").default(false),
  isDismissed: boolean("is_dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages/Chat between employers and job seekers
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  applicationId: varchar("application_id").references(() => applications.id, { onDelete: "set null" }),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Skills Database for better matching
export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }), // 'technical', 'soft', 'language', etc.
  description: text("description"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Skills Junction Table
export const userSkills = pgTable("user_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  skillId: varchar("skill_id").references(() => skills.id, { onDelete: "cascade" }).notNull(),
  proficiencyLevel: varchar("proficiency_level", { length: 20 }), // beginner, intermediate, advanced, expert
  yearsExperience: integer("years_experience"),
  isEndorsed: boolean("is_endorsed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comprehensive Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  jobSeeker: one(jobSeekers, {
    fields: [users.id],
    references: [jobSeekers.userId],
  }),
  employer: one(employers, {
    fields: [users.id],
    references: [employers.userId],
  }),
  userSkills: many(userSkills),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const jobSeekersRelations = relations(jobSeekers, ({ one, many }) => ({
  user: one(users, {
    fields: [jobSeekers.userId],
    references: [users.id],
  }),
  applications: many(applications),
  savedJobs: many(savedJobs),
  jobMatches: many(jobMatches),
  interviews: many(interviews),
  companyReviews: many(companyReviews),
}));

export const employersRelations = relations(employers, ({ one, many }) => ({
  user: one(users, {
    fields: [employers.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
  interviews: many(interviews),
  companyReviews: many(companyReviews),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  employer: one(employers, {
    fields: [jobs.employerId],
    references: [employers.id],
  }),
  applications: many(applications),
  savedJobs: many(savedJobs),
  jobMatches: many(jobMatches),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  jobSeeker: one(jobSeekers, {
    fields: [applications.jobSeekerId],
    references: [jobSeekers.id],
  }),
  interviews: many(interviews),
  messages: many(messages),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
  employer: one(employers, {
    fields: [interviews.employerId],
    references: [employers.id],
  }),
  jobSeeker: one(jobSeekers, {
    fields: [interviews.jobSeekerId],
    references: [jobSeekers.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  application: one(applications, {
    fields: [messages.applicationId],
    references: [applications.id],
  }),
}));

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  jobSeeker: one(jobSeekers, {
    fields: [savedJobs.jobSeekerId],
    references: [jobSeekers.id],
  }),
  job: one(jobs, {
    fields: [savedJobs.jobId],
    references: [jobs.id],
  }),
}));

export const jobMatchesRelations = relations(jobMatches, ({ one }) => ({
  jobSeeker: one(jobSeekers, {
    fields: [jobMatches.jobSeekerId],
    references: [jobSeekers.id],
  }),
  job: one(jobs, {
    fields: [jobMatches.jobId],
    references: [jobs.id],
  }),
}));

export const companyReviewsRelations = relations(companyReviews, ({ one }) => ({
  employer: one(employers, {
    fields: [companyReviews.employerId],
    references: [employers.id],
  }),
  jobSeeker: one(jobSeekers, {
    fields: [companyReviews.jobSeekerId],
    references: [jobSeekers.id],
  }),
}));

// Comprehensive Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  emailVerifiedAt: true,
});

export const insertJobSeekerSchema = createInsertSchema(jobSeekers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployerSchema = createInsertSchema(employers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  applicationsCount: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyReviewSchema = createInsertSchema(companyReviews).omit({
  id: true,
  createdAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertUserSkillSchema = createInsertSchema(userSkills).omit({
  id: true,
  createdAt: true,
});

// Enhanced Registration schemas with proper validation
export const jobSeekerRegistrationSchema = z.object({
  // User fields
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().optional(),
  bio: z.string().optional(),
  // Job seeker specific fields
  professionalTitle: z.string().min(1, "Professional title is required"),
  yearsExperience: z.string().min(1, "Years of experience is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  location: z.string().min(1, "Location is required"),
  expectedSalaryMin: z.number().optional(),
  expectedSalaryMax: z.number().optional(),
  salaryType: z.enum(["hourly", "monthly", "yearly"]).default("monthly"),
  workPreference: z.enum(["remote", "onsite", "hybrid"]).optional(),
  availability: z.string().optional(),
  openToRelocate: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const employerRegistrationSchema = z.object({
  // User fields
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().optional(),
  bio: z.string().optional(),
  // Employer specific fields
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  companySize: z.string().min(1, "Company size is required"),
  industry: z.string().min(1, "Industry is required"),
  companyLocation: z.string().min(1, "Company location is required"),
  companyDescription: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  foundedYear: z.number().optional(),
  remotePolicy: z.enum(["remote", "onsite", "hybrid", "flexible"]).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Job posting schema
export const jobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  department: z.string().optional(),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  workLocation: z.enum(["remote", "onsite", "hybrid"]).default("onsite"),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryType: z.enum(["hourly", "monthly", "yearly"]).default("monthly"),
  currency: z.string().length(3).default("USD"),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  location: z.string().min(1, "Location is required"),
  applicationDeadline: z.date().optional(),
  startDate: z.date().optional(),
  isUrgent: z.boolean().default(false),
});

// Interview scheduling schema
export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  title: z.string().min(1, "Interview title is required"),
  description: z.string().optional(),
  scheduledAt: z.date(),
  duration: z.number().min(15).max(480).default(60), // 15 minutes to 8 hours
  type: z.enum(["phone", "video", "in-person"]),
  location: z.string().min(1, "Location/meeting link is required"),
});

// Company review schema
export const companyReviewSchema = z.object({
  employerId: z.string().min(1, "Company is required"),
  rating: z.number().min(1).max(5),
  title: z.string().min(1, "Review title is required"),
  pros: z.string().optional(),
  cons: z.string().optional(),
  advice: z.string().optional(),
  workLifeBalance: z.number().min(1).max(5).optional(),
  compensation: z.number().min(1).max(5).optional(),
  culture: z.number().min(1).max(5).optional(),
  management: z.number().min(1).max(5).optional(),
  isCurrentEmployee: z.boolean().default(false),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  isAnonymous: z.boolean().default(true),
});

// All Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type JobSeeker = typeof jobSeekers.$inferSelect;
export type InsertJobSeeker = z.infer<typeof insertJobSeekerSchema>;
export type Employer = typeof employers.$inferSelect;
export type InsertEmployer = z.infer<typeof insertEmployerSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type CompanyReview = typeof companyReviews.$inferSelect;
export type InsertCompanyReview = z.infer<typeof insertCompanyReviewSchema>;
export type SavedJob = typeof savedJobs.$inferSelect;
export type JobMatch = typeof jobMatches.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

// Schema types for forms
export type JobSeekerRegistration = z.infer<typeof jobSeekerRegistrationSchema>;
export type EmployerRegistration = z.infer<typeof employerRegistrationSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type JobPostingForm = z.infer<typeof jobPostingSchema>;
export type ScheduleInterviewForm = z.infer<typeof scheduleInterviewSchema>;
export type CompanyReviewForm = z.infer<typeof companyReviewSchema>;

// Combined types for dashboard data with relations
export type JobSeekerWithUser = JobSeeker & { user: User };
export type EmployerWithUser = Employer & { user: User };
export type JobWithEmployer = Job & { 
  employer: EmployerWithUser;
  applications?: ApplicationWithJobSeeker[];
  _count?: { applications: number };
};
export type ApplicationWithJob = Application & { 
  job: JobWithEmployer;
  jobSeeker: JobSeekerWithUser;
  interviews?: Interview[];
};
export type ApplicationWithJobSeeker = Application & { 
  jobSeeker: JobSeekerWithUser;
};
export type InterviewWithDetails = Interview & {
  application: ApplicationWithJob;
  employer: EmployerWithUser;
  jobSeeker: JobSeekerWithUser;
};
export type MessageWithUsers = Message & {
  sender: User;
  receiver: User;
  application?: Application;
};
export type CompanyReviewWithDetails = CompanyReview & {
  employer: EmployerWithUser;
  jobSeeker: JobSeekerWithUser;
};

// Dashboard Analytics Types
export type JobSeekerDashboardData = {
  profile: JobSeekerWithUser;
  recentApplications: ApplicationWithJob[];
  savedJobs: (SavedJob & { job: JobWithEmployer })[];
  jobMatches: (JobMatch & { job: JobWithEmployer })[];
  upcomingInterviews: InterviewWithDetails[];
  messages: MessageWithUsers[];
  stats: {
    totalApplications: number;
    pendingApplications: number;
    interviewsScheduled: number;
    savedJobsCount: number;
  };
};

export type EmployerDashboardData = {
  profile: EmployerWithUser;
  activeJobs: JobWithEmployer[];
  recentApplications: ApplicationWithJobSeeker[];
  upcomingInterviews: InterviewWithDetails[];
  messages: MessageWithUsers[];
  companyReviews: CompanyReviewWithDetails[];
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    interviewsScheduled: number;
    averageRating: number;
  };
};
