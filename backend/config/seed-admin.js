// ── Creates the Super Admin account (Caleb Mwasi) ────────────────────────────
// Run ONCE after migration: node config/seed-admin.js
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const db     = require("./db");

async function seed() {
  console.log("🌱 Seeding admin account...");

  const email    = process.env.ADMIN_EMAIL || "calebmwasi22@gmail.com";
  const password = "CalebAdmin@2025!";
  const hash     = await bcrypt.hash(password, 12);

  // Check if already exists
  const { rows: existing } = await db.query("SELECT id FROM users WHERE email=$1", [email]);
  if (existing[0]) {
    console.log("✅ Admin account already exists:", email);
    process.exit(0);
  }

  await db.query(
    `INSERT INTO users (name, email, phone, role, password_hash, status)
     VALUES ($1, $2, $3, $4, $5, 'active')`,
    ["Caleb Mwasi Musyoka", email, "0799147722", "Admin", hash]
  );

  console.log("✅ Super Admin created!");
  console.log("   Email:    " + email);
  console.log("   Password: " + password);
  console.log("   Role:     Admin (Full access)");
  console.log("\n⚠️  Change your password after first login!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err.message);
  console.error("   Make sure your DATABASE_URL in .env is correct.");
  process.exit(1);
});
