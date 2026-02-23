// api/db.js
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for most hosted Postgres (Neon, Supabase, etc.)
});

module.exports = pool;
