import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '@shared/schema';

dotenv.config();
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create MySQL connection pool
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

// Export Drizzle client
export const db = drizzle(pool, { schema, mode: 'default' });
