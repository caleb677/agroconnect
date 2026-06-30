// ── PostgreSQL connection via Supabase ────────────────────────────────────────
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { Pool } = require("pg");

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("[PASSWORD]")) {
  console.error("❌ DATABASE_URL is not set in your .env file.");
  console.error("   Get it from: supabase.com → Settings → Database → URI");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => console.error("DB pool error:", err.message));

module.exports = {
  query:  (text, params) => pool.query(text, params),
  pool,
};
