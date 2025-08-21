import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if we're running in development/localhost
const isLocalhost = process.env.NODE_ENV === 'development' || 
                   process.env.DATABASE_URL.includes('localhost') ||
                   process.env.DATABASE_URL.includes('127.0.0.1');

let pool: any;
let db: any;

if (isLocalhost && process.env.DATABASE_URL.includes('neon.tech')) {
  // For localhost development using Neon cloud database
  console.log('🔄 Connecting to Neon database from localhost...');
  
  // Use regular node-postgres for localhost to Neon connection
  pool = new NodePool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  db = drizzleNode(pool, { schema });
} else {
  // For Replit production or actual serverless environments
  neonConfig.webSocketConstructor = ws;
  
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };