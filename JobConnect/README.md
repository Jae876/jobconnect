# JobConnect - Professional Networking & Job Marketplace Platform

A comprehensive LinkedIn-like professional networking and job marketplace platform built with modern web technologies. JobConnect features intelligent job matching, professional profiles, interview scheduling, messaging system, and company reviews.

## 🚀 Features

### For Job Seekers
- **Professional Profile Creation** - Skills, experience, resume upload
- **Intelligent Job Search** - Advanced filtering and matching algorithms
- **Job Applications** - Cover letter generation and application tracking
- **Interview Scheduling** - Video, phone, and in-person interview options
- **Dashboard Analytics** - Application status and career insights

### For Employers
- **Company Profiles** - Industry information and company branding
- **Job Posting Management** - Create and manage job listings
- **Candidate Review** - Application filtering and candidate evaluation
- **Interview Coordination** - Schedule and manage interviews
- **Communication Tools** - Direct messaging with candidates

### Core Platform Features
- **Real-time Messaging** - Direct communication between users
- **Company Reviews** - Transparent company rating system
- **Advanced Search** - Skills-based job matching
- **Mobile Responsive** - Optimized for all devices
- **Secure Authentication** - Session-based login with password hashing

## 🛠 Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool and dev server)
- Tailwind CSS + shadcn/ui components
- Wouter (lightweight routing)
- TanStack React Query (server state management)
- React Hook Form + Zod validation

**Backend:**
- Node.js + Express.js
- TypeScript
- Session-based authentication with bcryptjs
- RESTful API design

**Database:**
- PostgreSQL (Neon cloud hosting)
- Drizzle ORM with type-safe queries
- Comprehensive relational schema

**Development Tools:**
- ESBuild for server bundling
- PostCSS for CSS processing
- Drizzle Kit for database migrations

## 📋 Prerequisites

Before running this project locally, ensure you have:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL database** (local or cloud - Neon recommended)
- **Git** for version control

## 🚀 Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/jobconnect.git
cd jobconnect
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# Session Configuration (generate a random string)
SESSION_SECRET="your-super-secret-session-key-here"

# Development Configuration
NODE_ENV="development"
```

**For Neon Database (Recommended):**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

**For Local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobconnect"
```

### 4. Database Setup

Push the schema to your database:

```bash
npm run db:push
```

This command will:
- Create all necessary tables
- Set up relationships and constraints
- Initialize the database schema

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5000
- **API:** http://localhost:5000/api

## 📁 Project Structure

```
jobconnect/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main application component
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data access layer
│   └── index.ts           # Server entry point
├── shared/                 # Shared code between client/server
│   └── schema.ts          # Database schema and types
├── netlify/               # Netlify deployment functions
├── package.json           # Dependencies and scripts
├── drizzle.config.ts      # Database configuration
├── vite.config.ts         # Vite build configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## 🗄 Database Schema

The application uses PostgreSQL with the following main entities:

- **users** - Base user authentication and profile data
- **job_seekers** - Extended profiles for job candidates
- **employers** - Company profiles and information
- **jobs** - Job postings with requirements and details
- **applications** - Links between job seekers and jobs
- **interviews** - Interview scheduling and management
- **messages** - Direct messaging between users
- **reviews** - Company reviews and ratings

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)

# Deployment
npm run deploy       # Deploy to Netlify
```

## 🌐 Deployment

### Netlify Deployment (Recommended)

1. **Build Configuration:**
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Functions directory: `netlify/functions`

2. **Environment Variables:**
   Add these to your Netlify dashboard:
   ```
   DATABASE_URL=your-neon-database-url
   SESSION_SECRET=your-session-secret
   NODE_ENV=production
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder to your hosting provider

3. Configure environment variables on your hosting platform

## 🔒 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **Session Management** - Secure HTTP-only cookies
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Parameterized queries via Drizzle ORM
- **CSRF Protection** - Express session configuration
- **Environment Variables** - Sensitive data protection

## 🧪 Testing

The application includes comprehensive error handling and validation:

- **Form Validation** - Client and server-side validation
- **API Error Handling** - Centralized error middleware
- **Database Constraints** - Foreign key relationships and data integrity
- **Authentication Guards** - Protected routes and API endpoints

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Job Management
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job (employers only)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (employers only)

### Applications
- `POST /api/applications` - Submit job application
- `GET /api/applications` - Get user applications
- `PUT /api/applications/:id` - Update application status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the [existing issues](https://github.com/yourusername/jobconnect/issues)
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🎯 Roadmap

- [ ] Email notifications for job applications
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Integration with external job boards
- [ ] AI-powered job recommendations
- [ ] Video interview platform integration

---

**Built with ❤️ using modern web technologies**