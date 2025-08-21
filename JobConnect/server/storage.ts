import {
  users,
  jobSeekers,
  employers,
  jobs,
  applications,
  interviews,
  messages,
  companyReviews,
  savedJobs,
  jobMatches,
  skills,
  userSkills,
  type User,
  type InsertUser,
  type JobSeeker,
  type InsertJobSeeker,
  type Employer,
  type InsertEmployer,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type Interview,
  type InsertInterview,
  type Message,
  type InsertMessage,
  type CompanyReview,
  type InsertCompanyReview,
  type Skill,
  type InsertSkill,
  type JobSeekerWithUser,
  type EmployerWithUser,
  type JobWithEmployer,
  type ApplicationWithJob,
  type ApplicationWithJobSeeker,
  type InterviewWithDetails,
  type MessageWithUsers,
  type CompanyReviewWithDetails,
  type JobSeekerDashboardData,
  type EmployerDashboardData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, asc, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;

  // Job Seeker operations
  getJobSeeker(userId: string): Promise<JobSeekerWithUser | undefined>;
  getJobSeekerById(id: string): Promise<JobSeekerWithUser | undefined>;
  createJobSeeker(jobSeeker: InsertJobSeeker): Promise<JobSeeker>;
  updateJobSeeker(id: string, updates: Partial<InsertJobSeeker>): Promise<JobSeeker>;
  
  // Employer operations
  getEmployer(userId: string): Promise<EmployerWithUser | undefined>;
  getEmployerById(id: string): Promise<EmployerWithUser | undefined>;
  createEmployer(employer: InsertEmployer): Promise<Employer>;
  updateEmployer(id: string, updates: Partial<InsertEmployer>): Promise<Employer>;
  
  // Job operations
  getJobs(search?: string, location?: string, employmentType?: string): Promise<JobWithEmployer[]>;
  getJob(id: string): Promise<JobWithEmployer | undefined>;
  getJobsByEmployer(employerId: string): Promise<JobWithEmployer[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  
  // Application operations
  getApplicationsByJobSeeker(jobSeekerId: string): Promise<ApplicationWithJob[]>;
  getApplicationsByEmployer(employerId: string): Promise<ApplicationWithJobSeeker[]>;
  getApplication(id: string): Promise<ApplicationWithJob | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application>;
  
  // Interview operations
  getInterviewsByJobSeeker(jobSeekerId: string): Promise<InterviewWithDetails[]>;
  getInterviewsByEmployer(employerId: string): Promise<InterviewWithDetails[]>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, updates: Partial<InsertInterview>): Promise<Interview>;
  
  // Messaging operations
  getConversations(userId: string): Promise<MessageWithUsers[]>;
  getMessages(senderId: string, receiverId: string): Promise<MessageWithUsers[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Company Review operations
  getCompanyReviews(employerId: string): Promise<CompanyReviewWithDetails[]>;
  createCompanyReview(review: InsertCompanyReview): Promise<CompanyReview>;
  
  // Job matching and saved jobs
  saveJob(jobSeekerId: string, jobId: string): Promise<void>;
  unsaveJob(jobSeekerId: string, jobId: string): Promise<void>;
  getSavedJobs(jobSeekerId: string): Promise<JobWithEmployer[]>;
  getJobMatches(jobSeekerId: string): Promise<JobWithEmployer[]>;
  
  // Skills operations
  getSkills(): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  getUserSkills(userId: string): Promise<Skill[]>;
  addUserSkill(userId: string, skillId: string): Promise<void>;
  
  // Dashboard data
  getJobSeekerDashboardData(userId: string): Promise<JobSeekerDashboardData>;
  getEmployerDashboardData(userId: string): Promise<EmployerDashboardData>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Job Seeker operations
  async getJobSeeker(userId: string): Promise<JobSeekerWithUser | undefined> {
    const result = await db
      .select()
      .from(jobSeekers)
      .innerJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(jobSeekers.userId, userId));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].job_seekers,
      user: result[0].users,
    };
  }

  async getJobSeekerById(id: string): Promise<JobSeekerWithUser | undefined> {
    const result = await db
      .select()
      .from(jobSeekers)
      .innerJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(jobSeekers.id, id));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].job_seekers,
      user: result[0].users,
    };
  }

  async createJobSeeker(jobSeekerData: InsertJobSeeker): Promise<JobSeeker> {
    const [jobSeeker] = await db
      .insert(jobSeekers)
      .values(jobSeekerData)
      .returning();
    return jobSeeker;
  }

  async updateJobSeeker(id: string, updates: Partial<InsertJobSeeker>): Promise<JobSeeker> {
    const [jobSeeker] = await db
      .update(jobSeekers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobSeekers.id, id))
      .returning();
    return jobSeeker;
  }

  // Employer operations
  async getEmployer(userId: string): Promise<EmployerWithUser | undefined> {
    const result = await db
      .select()
      .from(employers)
      .innerJoin(users, eq(employers.userId, users.id))
      .where(eq(employers.userId, userId));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].employers,
      user: result[0].users,
    };
  }

  async getEmployerById(id: string): Promise<EmployerWithUser | undefined> {
    const result = await db
      .select()
      .from(employers)
      .innerJoin(users, eq(employers.userId, users.id))
      .where(eq(employers.id, id));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].employers,
      user: result[0].users,
    };
  }

  async createEmployer(employerData: InsertEmployer): Promise<Employer> {
    const [employer] = await db
      .insert(employers)
      .values(employerData)
      .returning();
    return employer;
  }

  async updateEmployer(id: string, updates: Partial<InsertEmployer>): Promise<Employer> {
    const [employer] = await db
      .update(employers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(employers.id, id))
      .returning();
    return employer;
  }

  // Job operations
  async getJobs(search?: string, location?: string, employmentType?: string): Promise<JobWithEmployer[]> {
    let conditions = [eq(jobs.status, "active")];

    if (search) {
      conditions.push(
        or(
          ilike(jobs.title, `%${search}%`),
          ilike(jobs.description, `%${search}%`)
        )
      );
    }

    if (location) {
      conditions.push(ilike(jobs.location, `%${location}%`));
    }

    if (employmentType) {
      conditions.push(eq(jobs.employmentType, employmentType));
    }

    const result = await db
      .select()
      .from(jobs)
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .innerJoin(users, eq(employers.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt));
    
    return result.map(row => ({
      ...row.jobs,
      employer: {
        ...row.employers,
        user: row.users,
      },
    }));
  }

  async getJob(id: string): Promise<JobWithEmployer | undefined> {
    const result = await db
      .select()
      .from(jobs)
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .innerJoin(users, eq(employers.userId, users.id))
      .where(eq(jobs.id, id));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].jobs,
      employer: {
        ...result[0].employers,
        user: result[0].users,
      },
    };
  }

  async getJobsByEmployer(employerId: string): Promise<JobWithEmployer[]> {
    const result = await db
      .select()
      .from(jobs)
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .innerJoin(users, eq(employers.userId, users.id))
      .where(eq(jobs.employerId, employerId))
      .orderBy(desc(jobs.createdAt));
    
    return result.map(row => ({
      ...row.jobs,
      employer: {
        ...row.employers,
        user: row.users,
      },
    }));
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values(jobData)
      .returning();
    return job;
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job> {
    const [job] = await db
      .update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Application operations
  async getApplicationsByJobSeeker(jobSeekerId: string): Promise<ApplicationWithJob[]> {
    const result = await db
      .select({
        application: applications,
        job: jobs,
        employer: employers,
        user: users,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .innerJoin(users, eq(employers.userId, users.id))
      .where(eq(applications.jobSeekerId, jobSeekerId))
      .orderBy(desc(applications.appliedAt));
    
    return result.map(row => ({
      ...row.application,
      job: {
        ...row.job,
        employer: {
          ...row.employer,
          user: row.user,
        },
      },
      jobSeeker: undefined as any, // Simplified for now
    }));
  }

  async getApplicationsByEmployer(employerId: string): Promise<ApplicationWithJobSeeker[]> {
    const result = await db
      .select({
        application: applications,
        job: jobs,
        jobSeeker: jobSeekers,
        user: users,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(jobSeekers, eq(applications.jobSeekerId, jobSeekers.id))
      .innerJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(jobs.employerId, employerId))
      .orderBy(desc(applications.appliedAt));
    
    return result.map(row => ({
      ...row.application,
      jobSeeker: {
        ...row.jobSeeker,
        user: row.user,
      },
    }));
  }

  async getApplication(id: string): Promise<ApplicationWithJob | undefined> {
    const result = await db
      .select()
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .innerJoin(jobSeekers, eq(applications.jobSeekerId, jobSeekers.id))
      .leftJoin(users, eq(employers.userId, users.id))
      .where(eq(applications.id, id));
    
    if (result.length === 0) return undefined;
    
    const row = result[0];
    return {
      ...row.applications,
      job: {
        ...row.jobs,
        employer: {
          ...row.employers,
          user: row.users || {} as any,
        },
      },
      jobSeeker: {
        ...row.job_seekers,
        user: row.users || {} as any,
      },
    };
  }

  async createApplication(applicationData: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(applicationData)
      .returning();
    return application;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  // Interview operations
  async getInterviewsByJobSeeker(jobSeekerId: string): Promise<InterviewWithDetails[]> {
    const result = await db
      .select()
      .from(interviews)
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .innerJoin(jobSeekers, eq(applications.jobSeekerId, jobSeekers.id))
      .leftJoin(users, eq(employers.userId, users.id))
      .where(eq(applications.jobSeekerId, jobSeekerId))
      .orderBy(asc(interviews.scheduledAt));
    
    return result.map(row => ({
      ...row.interviews,
      application: {
        ...row.applications,
        job: {
          ...row.jobs,
          employer: {
            ...row.employers,
            user: row.users || {} as any,
          },
        },
        jobSeeker: {
          ...row.job_seekers,
          user: row.users || {} as any,
        },
      },
      employer: {
        ...row.employers,
        user: row.users || {} as any,
      },
      jobSeeker: {
        ...row.job_seekers,
        user: row.users || {} as any,
      },
    }));
  }

  async getInterviewsByEmployer(employerId: string): Promise<InterviewWithDetails[]> {
    const result = await db
      .select()
      .from(interviews)
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(jobSeekers, eq(applications.jobSeekerId, jobSeekers.id))
      .leftJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(jobs.employerId, employerId))
      .orderBy(asc(interviews.scheduledAt));
    
    return result.map(row => ({
      ...row.interviews,
      application: {
        ...row.applications,
        job: {
          ...row.jobs,
          employer: {} as any,
        },
        jobSeeker: {
          ...row.job_seekers,
          user: row.users || {} as any,
        },
      },
      employer: {} as any,
      jobSeeker: {
        ...row.job_seekers,
        user: row.users || {} as any,
      },
    }));
  }

  async createInterview(interviewData: InsertInterview): Promise<Interview> {
    const [interview] = await db
      .insert(interviews)
      .values(interviewData)
      .returning();
    return interview;
  }

  async updateInterview(id: string, updates: Partial<InsertInterview>): Promise<Interview> {
    const [interview] = await db
      .update(interviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(interviews.id, id))
      .returning();
    return interview;
  }

  // Messaging operations
  async getConversations(userId: string): Promise<MessageWithUsers[]> {
    const result = await db
      .select()
      .from(messages)
      .innerJoin(users, or(eq(messages.senderId, users.id), eq(messages.receiverId, users.id)))
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt))
      .limit(50);
    
    return result.map(row => ({
      ...row.messages,
      sender: row.users,
      receiver: row.users,
    }));
  }

  async getMessages(senderId: string, receiverId: string): Promise<MessageWithUsers[]> {
    const result = await db
      .select()
      .from(messages)
      .innerJoin(users, or(eq(messages.senderId, users.id), eq(messages.receiverId, users.id)))
      .where(
        or(
          and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId)),
          and(eq(messages.senderId, receiverId), eq(messages.receiverId, senderId))
        )
      )
      .orderBy(asc(messages.createdAt));
    
    return result.map(row => ({
      ...row.messages,
      sender: row.users,
      receiver: row.users,
    }));
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  // Company Review operations
  async getCompanyReviews(employerId: string): Promise<CompanyReviewWithDetails[]> {
    const result = await db
      .select()
      .from(companyReviews)
      .innerJoin(employers, eq(companyReviews.employerId, employers.id))
      .innerJoin(jobSeekers, eq(companyReviews.jobSeekerId, jobSeekers.id))
      .leftJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(companyReviews.employerId, employerId))
      .orderBy(desc(companyReviews.createdAt));
    
    return result.map(row => ({
      ...row.company_reviews,
      employer: {
        ...row.employers,
        user: {} as any,
      },
      jobSeeker: {
        ...row.job_seekers,
        user: row.users || {} as any,
      },
    }));
  }

  async createCompanyReview(reviewData: InsertCompanyReview): Promise<CompanyReview> {
    const [review] = await db
      .insert(companyReviews)
      .values(reviewData)
      .returning();
    return review;
  }

  // Job matching and saved jobs
  async saveJob(jobSeekerId: string, jobId: string): Promise<void> {
    await db
      .insert(savedJobs)
      .values({ jobSeekerId, jobId })
      .onConflictDoNothing();
  }

  async unsaveJob(jobSeekerId: string, jobId: string): Promise<void> {
    await db
      .delete(savedJobs)
      .where(and(eq(savedJobs.jobSeekerId, jobSeekerId), eq(savedJobs.jobId, jobId)));
  }

  async getSavedJobs(jobSeekerId: string): Promise<JobWithEmployer[]> {
    const result = await db
      .select({
        job: jobs,
        employer: employers,
        user: users,
        savedAt: savedJobs.createdAt,
      })
      .from(savedJobs)
      .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .innerJoin(users, eq(employers.userId, users.id))
      .where(eq(savedJobs.jobSeekerId, jobSeekerId))
      .orderBy(desc(savedJobs.createdAt));
    
    return result.map(row => ({
      ...row.job,
      employer: {
        ...row.employer,
        user: row.user,
      },
    }));
  }

  async getJobMatches(jobSeekerId: string): Promise<JobWithEmployer[]> {
    const result = await db
      .select({
        job: jobs,
        employer: employers,
        user: users,
        matchScore: jobMatches.matchScore,
      })
      .from(jobMatches)
      .innerJoin(jobs, eq(jobMatches.jobId, jobs.id))
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .innerJoin(users, eq(employers.userId, users.id))
      .where(eq(jobMatches.jobSeekerId, jobSeekerId))
      .orderBy(desc(jobMatches.matchScore));
    
    return result.map(row => ({
      ...row.job,
      employer: {
        ...row.employer,
        user: row.user,
      },
    }));
  }

  // Skills operations
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(asc(skills.name));
  }

  async createSkill(skillData: InsertSkill): Promise<Skill> {
    const [skill] = await db
      .insert(skills)
      .values(skillData)
      .returning();
    return skill;
  }

  async getUserSkills(userId: string): Promise<Skill[]> {
    const result = await db
      .select()
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId));
    
    return result.map(row => row.skills);
  }

  async addUserSkill(userId: string, skillId: string): Promise<void> {
    await db
      .insert(userSkills)
      .values({ userId, skillId })
      .onConflictDoNothing();
  }

  // Dashboard data operations
  async getJobSeekerDashboardData(userId: string): Promise<JobSeekerDashboardData> {
    const profile = await this.getJobSeeker(userId);
    if (!profile) throw new Error("Job seeker profile not found");

    const stats = {
      totalApplications: 0,
      pendingApplications: 0,
      interviewsScheduled: 0,
      savedJobsCount: 0,
    };

    return {
      profile,
      recentApplications: [],
      savedJobs: [],
      jobMatches: [],
      upcomingInterviews: [],
      messages: [],
      stats,
    };
  }

  async getEmployerDashboardData(userId: string): Promise<EmployerDashboardData> {
    const profile = await this.getEmployer(userId);
    if (!profile) throw new Error("Employer profile not found");

    const activeJobs = await this.getJobsByEmployer(profile.id).catch(() => []);
    const recentApplications = await this.getApplicationsByEmployer(profile.id).catch(() => []);

    const stats = {
      totalJobs: activeJobs.length,
      activeJobs: activeJobs.filter(job => job.status === "active").length,
      totalApplications: recentApplications.length,
      interviewsScheduled: 0,
      averageRating: 0,
    };

    return {
      profile,
      activeJobs: activeJobs.slice(0, 10),
      recentApplications: recentApplications.slice(0, 20),
      upcomingInterviews: [],
      messages: [],
      companyReviews: [],
      stats,
    };
  }
}

export const storage = new DatabaseStorage();