// Quick database connection test
// Run with: node test-db-connection.js

const { Pool } = require('@neondatabase/serverless');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/['"]/g, '');
    }
  });
  console.log('✅ .env file loaded');
} else {
  console.log('❌ .env file not found - create one with DATABASE_URL');
  process.exit(1);
}

async function testDatabaseConnection() {
  console.log('\n🔍 Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not set in .env file');
    console.log('\nCreate .env file with:');
    console.log('DATABASE_URL="postgresql://username:password@host:port/database"');
    return;
  }

  try {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('🔄 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');

    console.log('🔄 Testing query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Query successful!');
    console.log('📅 Server time:', result.rows[0].current_time);
    console.log('📊 PostgreSQL version:', result.rows[0].postgres_version.split(' ')[0]);

    client.release();
    await pool.end();
    
    console.log('\n🎉 Database connection test passed!');
    console.log('Your localhost setup should work now.');
    
  } catch (error) {
    console.log('\n❌ Database connection failed!');
    console.log('Error:', error.message);
    
    if (error.message.includes('getaddrinfo')) {
      console.log('\n💡 This is a DNS/network error. Solutions:');
      console.log('1. Get your own Neon database at https://neon.tech');
      console.log('2. Install PostgreSQL locally');
      console.log('3. Check LOCALHOST_DATABASE_FIX.md for detailed instructions');
    }
    
    if (error.message.includes('password')) {
      console.log('\n💡 Password authentication failed. Check:');
      console.log('1. Username and password in DATABASE_URL');
      console.log('2. Database user permissions');
    }
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Database does not exist. Create it with:');
      console.log('createdb jobconnect');
    }
  }
}

testDatabaseConnection();