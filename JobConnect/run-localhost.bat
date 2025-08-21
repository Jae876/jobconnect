@echo off
echo Starting JobConnect localhost...
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file...
    echo DATABASE_URL=postgresql://neondb_owner:npg_7SQZ0CWMKYyb@ep-raspy-sea-a5c5rduw.us-east-2.aws.neon.tech/neondb > .env
    echo SESSION_SECRET=your-random-secret-key >> .env
    echo NODE_ENV=development >> .env
    echo .env file created!
    echo.
)

REM Set environment variables for this session
set NODE_ENV=development
set DATABASE_URL=postgresql://neondb_owner:npg_7SQZ0CWMKYyb@ep-raspy-sea-a5c5rduw.us-east-2.aws.neon.tech/neondb
set SESSION_SECRET=your-random-secret-key

echo Installing dependencies...
call npm install

echo.
echo Starting server...
echo Open http://localhost:5000 in your browser
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npx tsx server/index.ts

pause