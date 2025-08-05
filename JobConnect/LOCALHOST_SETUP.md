# JobConnect - Localhost Setup Guide

This guide will help you run JobConnect on your local machine for development.

## Prerequisites

Before starting, ensure you have these installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL** (optional - can use Neon cloud database) - [Download here](https://www.postgresql.org/)

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/jobconnect.git
cd jobconnect

# Install dependencies
npm install
```

### 2. Database Setup (Choose Option A or B)

**Option A: Use Neon Cloud Database (Recommended)**
1. Visit [neon.tech](https://neon.tech) and create a free account
2. Create a new project named "jobconnect"
3. Copy the connection string

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb jobconnect
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database URL
```

**For Neon Database (.env file):**
```env
DATABASE_URL="postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/jobconnect"
SESSION_SECRET="your-random-secret-key-here"
NODE_ENV="development"
```

**For Local PostgreSQL (.env file):**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobconnect"
SESSION_SECRET="your-random-secret-key-here"
NODE_ENV="development"
```

### 4. Initialize Database

```bash
# Push schema to database
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

🎉 **Your app is now running at http://localhost:5000**

## Detailed Setup Guide

### Installing Node.js

**Windows:**
1. Download installer from [nodejs.org](https://nodejs.org/)
2. Run installer and follow prompts
3. Verify: `node --version` and `npm --version`

**macOS:**
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
# Update package index
sudo apt update

# Install Node.js
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

### Database Options

#### Option 1: Neon Cloud Database (Easiest)

1. **Sign up at [neon.tech](https://neon.tech)**
2. **Create new project:**
   - Project name: `jobconnect`
   - Database name: `jobconnect`
   - Region: Choose closest to your location
3. **Get connection string:**
   - Go to Dashboard → Connection Details
   - Copy the "Connection string"
   - Example: `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/jobconnect`

#### Option 2: Local PostgreSQL

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer, set password for `postgres` user
3. Add PostgreSQL to PATH
4. Create database: `createdb jobconnect`

**macOS:**
```bash
# Install via Homebrew
brew install postgresql

# Start service
brew services start postgresql

# Create database
createdb jobconnect
```

**Linux:**
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE jobconnect;
\q
```

### Environment Variables Explained

```env
# Database connection string
DATABASE_URL="postgresql://username:password@host:port/database"

# Session security key (generate random string)
SESSION_SECRET="your-super-secret-key-minimum-32-characters"

# Environment mode
NODE_ENV="development"
```

**Generate Session Secret:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32

# Option 3: Use online generator
# Visit: https://generate-secret.now.sh/32
```

## Development Workflow

### Starting the Application

```bash
# Start development server (includes both frontend and backend)
npm run dev

# The app runs on http://localhost:5000
# API endpoints available at http://localhost:5000/api
```

### Database Management

```bash
# Push schema changes to database
npm run db:push

# Open database studio (visual interface)
npm run db:studio
```

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
jobconnect/
├── client/              # React frontend
├── server/              # Express backend  
├── shared/              # Shared types and schemas
├── netlify/             # Deployment functions
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables (create this)
├── .env.example         # Environment template
└── README.md            # Project documentation
```

## Troubleshooting

### Common Issues

**1. "Cannot connect to database"**
- Check DATABASE_URL in .env file
- Ensure PostgreSQL is running (for local setup)
- Verify database exists and credentials are correct

**2. "Module not found" errors**
- Run `npm install` to install dependencies
- Delete `node_modules` and run `npm install` again

**3. "Port 5000 already in use"**
- Kill process using port 5000: `lsof -ti:5000 | xargs kill -9`
- Or change port in `server/index.ts`

**4. Database migration issues**
- Drop and recreate database: `dropdb jobconnect && createdb jobconnect`
- Run `npm run db:push` again

### Getting Help

1. **Check the console** for error messages
2. **Verify environment variables** are set correctly
3. **Test database connection** separately
4. **Check if ports are available** (5000 for dev server)

### Development Tips

**1. Hot Reload**
- Frontend changes reload automatically
- Backend changes restart the server

**2. Database Changes**
- Modify `shared/schema.ts` for schema changes
- Run `npm run db:push` to apply changes

**3. API Testing**
- Use browser dev tools Network tab
- Or use tools like Postman/Insomnia

## Production Deployment

When ready to deploy:

1. **Build the project:** `npm run build`
2. **Set production environment variables**
3. **Deploy to hosting platform** (Netlify, Vercel, etc.)

See `NETLIFY_DEPLOYMENT.md` for detailed deployment instructions.

---

**Need help?** Create an issue on GitHub or check the main README.md for more information.