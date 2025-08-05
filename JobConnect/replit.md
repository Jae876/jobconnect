# JobConnect - LinkedIn-like Professional Platform

## Overview

JobConnect is a comprehensive LinkedIn-like professional networking and job marketplace platform. It features advanced job matching, professional profiles, interview scheduling, messaging system, company reviews, and comprehensive dashboard analytics. Built with modern web technologies and deployed with Neon PostgreSQL cloud database.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 28, 2025)

✓ **Comprehensive Database Schema Migration** - Successfully migrated to Neon PostgreSQL with complete LinkedIn-like features
✓ **Enhanced Authentication System** - Implemented username-based credentials with comprehensive user profiles  
✓ **Advanced Job Matching Algorithm** - Built intelligent job matching system with skills-based recommendations
✓ **Professional Dashboards** - Created role-specific dashboards with real-time analytics and management tools
✓ **Messaging & Interview System** - Implemented direct messaging and interview scheduling functionality
✓ **Company Reviews Platform** - Added company review and rating system for transparency
✓ **Profile Management System** - Added profile dropdown with account editing and secure logout functionality
✓ **Online Interview Scheduling** - Built comprehensive interview scheduling system for employers with video/phone/in-person options
✓ **CRITICAL FIX: Job Seeker Registration Redirect** - Fixed routing inconsistency preventing job seekers from accessing dashboard after registration
✓ **Enhanced Job Seeker Dashboard** - Implemented LinkedIn-like interface with advanced job search, intelligent matching, cover letter generation, and professional UI
✓ **Registration Flow Fix** - Resolved authentication timing issue where users were redirected before user data could be fetched, causing dashboard access problems
✓ **Complete Registration System Rebuild** - Rebuilt entire registration system from scratch with proper two-step job seeker flow, clean database storage, and guaranteed dashboard redirects
✓ **Credential-Based Authentication System** - Implemented proper registration flow where users fill credentials that get stored in database and used for login authentication to access respective dashboards
✓ **Professional Skill Suggestions System** - Added 24+ clickable skill badges for easy job seeker registration
✓ **Comprehensive Job Seeker Dashboard** - Built complete LinkedIn-style dashboard with job search, applications, interviews, and career insights
✓ **VS Code Development Guide** - Created complete setup guide with Neon database migration instructions
✓ **Comprehensive Project Documentation** - Created detailed SDLC methodology documentation combining previous readable format with comprehensive academic depth, including all six chapters with complete system analysis, design, implementation, testing, and recommendations

## System Architecture

The application follows a comprehensive full-stack architecture optimized for professional networking:

- **Frontend**: React SPA with TypeScript, using Vite for development and optimized builds
- **Backend**: Express.js REST API with comprehensive authentication and business logic
- **Database**: Neon PostgreSQL with advanced relational schema and Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components for professional aesthetics
- **Authentication**: Session-based with bcryptjs password hashing and username support

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Architecture
- **API Design**: RESTful endpoints with Express.js middleware
- **Database Layer**: Drizzle ORM with type-safe database operations
- **Authentication**: Express sessions with secure cookie configuration
- **Validation**: Zod schemas shared between client and server
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Database Schema
The database uses PostgreSQL with the following main entities:
- **Users**: Core user authentication and profile data
- **Job Seekers**: Extended profile for candidates (skills, experience, resume)
- **Employers**: Extended profile for companies (company info, industry)
- **Jobs**: Job postings with requirements and compensation
- **Applications**: Linking job seekers to jobs with application status

### Authentication & Authorization
- Session-based authentication using express-session
- Role-based access control (job_seeker vs employer)
- Password hashing with bcryptjs
- Protected routes with authentication middleware
- Session persistence across browser sessions

## Data Flow

1. **User Registration**: 
   - User selects role (job seeker or employer)
   - Form validation on client and server
   - Password hashing and database storage
   - Automatic login after registration

2. **Job Management**:
   - Employers create job postings through protected routes
   - Jobs are associated with employer profiles
   - Real-time updates via React Query

3. **Application Process**:
   - Job seekers browse available positions
   - Applications create relationships between users and jobs
   - Status tracking and management through dashboards

4. **Dashboard Views**:
   - Role-specific interfaces for job seekers and employers
   - Real-time data fetching and caching
   - Responsive design for mobile and desktop

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **date-fns**: Date formatting utilities

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

The application is configured for deployment on Replit with:

- **Build Process**: Vite builds the client, esbuild bundles the server
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Session Security**: Configurable session secret for production
- **Static Assets**: Client build output served by Express in production
- **Development Mode**: Vite dev server with HMR for rapid development

### Build Configuration
- Client builds to `dist/public` directory
- Server bundles to `dist/index.js` with external dependencies
- Shared schema enables type safety between client and server
- Path aliases simplify imports and maintainability

The architecture prioritizes developer experience with hot reloading, type safety, and clear separation of concerns while maintaining production readiness with proper security measures and optimized builds.

## New Features Added

### Profile Management System
- **Profile Dropdown Component** - Professional user interface with avatar and menu options
- **Account Editing** - In-place profile editing with form validation
- **Secure Logout** - Proper session cleanup and redirect handling
- **User Experience** - LinkedIn-like professional appearance and functionality

### Online Interview Scheduling System
- **Multi-Format Support** - Video calls, phone interviews, and in-person meetings
- **Calendar Integration** - Date/time picker with duration selection
- **Meeting Links** - Support for Zoom, Google Meet, and custom meeting URLs
- **Interview Management** - Status tracking (scheduled, completed, cancelled)
- **Interviewer Notes** - Built-in note-taking and feedback system
- **Application Integration** - Direct scheduling from application reviews

### Development Environment
- **VS Code Setup Guide** - Complete step-by-step instructions for local development
- **Neon Database Integration** - Cloud database setup with connection instructions
- **Environment Configuration** - Proper .env setup with security considerations
- **Debugging Support** - VS Code launch configurations and troubleshooting guide