// Simple server starter for Windows
// Run with: node start-server.js

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = 'development';

// Load .env file if it exists
const fs = require('fs');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/['"]/g, '');
    }
  });
  console.log('✅ Environment variables loaded from .env');
}

console.log('🚀 Starting JobConnect server...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🗄️ Database:', process.env.DATABASE_URL ? 'Connected' : 'Not configured');

// Start the server using tsx
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  console.log('\n💡 Try installing tsx globally:');
  console.log('npm install -g tsx');
});

serverProcess.on('close', (code) => {
  console.log(`\n🛑 Server process exited with code ${code}`);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  serverProcess.kill();
  process.exit();
});