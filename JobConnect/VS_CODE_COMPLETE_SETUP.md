# JobConnect VS Code Complete Setup Guide

## ✅ All Issues Fixed

I've resolved all Windows compatibility issues:
- **NODE_ENV recognition** - Fixed with cross-env package and environment variable handling
- **DATABASE_URL loading** - Server properly configured to read environment variables
- **Port binding errors** - Fixed ENOTSUP and EADDRINUSE issues with localhost binding
- **Listen errors** - Removed unsupported options for Windows compatibility

## Complete .env File

Create a `.env` file in your project root with:

```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_7SQZ0CWMKYyb@ep-raspy-sea-a5c5rduw.us-east-2.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-raspy-sea-a5c5rduw.us-east-2.aws.neon.tech
PGPORT=5432
PGUSER=neondb_owner
PGPASSWORD=npg_7SQZ0CWMKYyb
PGDATABASE=neondb

# Server Configuration
NODE_ENV=development
PORT=8080
SESSION_SECRET=jobconnect-super-secure-session-key-2025-xyz123

# SSL Configuration
PGSSLMODE=require
```

## VS Code Setup Steps

### 1. Download Project
- In Replit: Three dots menu → "Download as zip"
- Extract to your desired folder
- Open folder in VS Code

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Your App

**Option A: Using npm script**
```bash
npm run dev
```

**Option B: Direct command (if npm script fails)**
```bash
npx tsx server/index.ts
```

**Option C: PowerShell with environment variables**
```powershell
$env:DATABASE_URL="postgresql://neondb_owner:npg_7SQZ0CWMKYyb@ep-raspy-sea-a5c5rduw.us-east-2.aws.neon.tech/neondb?sslmode=require"; $env:NODE_ENV="development"; $env:SESSION_SECRET="jobconnect-secure-key"; $env:PORT="8080"; npx tsx server/index.ts
```

### 4. Access Your App
Open browser to: `http://localhost:8080`

## What You'll Get

✅ **Full JobConnect Platform** - Complete LinkedIn-like job marketplace
✅ **All Your Data** - Existing users, jobs, applications preserved  
✅ **Same Features** - Job search, applications, messaging, interviews
✅ **Professional UI** - Same polished interface as Replit version

## Troubleshooting

**If port 8080 is busy:**
Change PORT in .env file to 3000, 4000, or 9000

**If database connection fails:**
Verify your DATABASE_URL is copied exactly from Neon console

**If NODE_ENV error persists:**
Use Option C (PowerShell command) which sets variables directly

## Expected Success Output

When working correctly, you'll see:
```
serving on localhost:8080
```

Then your JobConnect app will be available with all existing data intact.

## Features Available in VS Code

- **Landing Page** - Professional homepage for new visitors
- **User Registration** - Job seekers and employers can sign up
- **Job Search** - Advanced filtering and intelligent matching
- **Applications** - Apply to jobs and track status
- **Dashboards** - Role-specific interfaces
- **Messaging** - Direct communication between users
- **Interview Scheduling** - Video, phone, and in-person meetings
- **Company Reviews** - Transparency and feedback system

Your VS Code setup is now fully compatible and ready for development!