// ── Database migration — run ONCE to create all tables ───────────────────────
// Usage: node config/migrate.js
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const db = require("./db");

async function migrate() {
  console.log("🔧 Running migrations...");

  // Test connection first
  try {
    await db.query("SELECT 1");
    console.log("✅ Database connection successful");
  } catch (e) {
    console.error("❌ Cannot connect to database.");
    console.error("   Check your DATABASE_URL in backend/.env");
    console.error("   Get it from: supabase.com → Settings → Database → URI");
    process.exit(1);
  }

  await db.query(`

    -- ── USERS ─────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      phone         TEXT,
      role          TEXT NOT NULL CHECK (role IN ('Admin','Extension Officer','Farmer','Buyer','Agrovet')),
      password_hash TEXT NOT NULL,
      subcounty     TEXT,
      ward          TEXT,
      location      TEXT,
      farm_size     TEXT,
      produce       TEXT,
      biz_type      TEXT,
      staff_id      TEXT,
      dept          TEXT,
      status        TEXT DEFAULT 'active' CHECK (status IN ('active','pending','suspended')),
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      last_login    TIMESTAMPTZ
    );

    -- ── PRODUCTS (marketplace listings) ──────────────────────────────────
    CREATE TABLE IF NOT EXISTS products (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farmer_id   UUID REFERENCES users(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      category    TEXT,
      price       NUMERIC NOT NULL,
      qty         NUMERIC,
      unit        TEXT DEFAULT 'kg',
      description TEXT,
      media_url   TEXT,
      media_type  TEXT,
      subcounty   TEXT,
      ward        TEXT,
      location    TEXT,
      status      TEXT DEFAULT 'active',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── ORDERS ────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS orders (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id  UUID REFERENCES products(id),
      buyer_id    UUID REFERENCES users(id),
      farmer_id   UUID REFERENCES users(id),
      qty         NUMERIC NOT NULL,
      unit_price  NUMERIC NOT NULL,
      total       NUMERIC GENERATED ALWAYS AS (qty * unit_price) STORED,
      status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_transit','delivered','cancelled')),
      mpesa_code  TEXT,
      notes       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── MARKET PRICES ─────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS market_prices (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      produce     TEXT NOT NULL,
      unit        TEXT,
      price       NUMERIC NOT NULL,
      market      TEXT,
      subcounty   TEXT,
      ward        TEXT,
      posted_by   UUID REFERENCES users(id),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── MESSAGES ──────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS messages (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id   UUID REFERENCES users(id) ON DELETE CASCADE,
      receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
      body        TEXT NOT NULL,
      read        BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── NOTIFICATIONS ─────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS notifications (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
      title       TEXT NOT NULL,
      body        TEXT,
      type        TEXT DEFAULT 'info',
      read        BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── MPESA TRANSACTIONS ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS mpesa_transactions (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id        UUID REFERENCES orders(id),
      user_id         UUID REFERENCES users(id),
      phone           TEXT NOT NULL,
      amount          NUMERIC NOT NULL,
      merchant_req_id TEXT,
      checkout_req_id TEXT UNIQUE,
      mpesa_code      TEXT,
      status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','cancelled')),
      result_desc     TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      completed_at    TIMESTAMPTZ
    );

    -- ── FARM DIARY ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS farm_diary (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farmer_id     UUID REFERENCES users(id) ON DELETE CASCADE,
      activity      TEXT NOT NULL,
      notes         TEXT,
      cost          NUMERIC DEFAULT 0,
      activity_date DATE,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── CERTIFICATIONS ────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS certifications (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      farmer_id   UUID REFERENCES users(id) ON DELETE CASCADE,
      status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      cert_number TEXT UNIQUE,
      issued_by   UUID REFERENCES users(id),
      issued_at   TIMESTAMPTZ,
      expires_at  TIMESTAMPTZ,
      documents   JSONB DEFAULT '[]'
    );

    -- ── TUTORIALS ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS tutorials (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       TEXT NOT NULL,
      description TEXT,
      video_url   TEXT,
      pdf_url     TEXT,
      category    TEXT,
      posted_by   UUID REFERENCES users(id),
      subcounty   TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── RATINGS ───────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS ratings (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      rater_id    UUID REFERENCES users(id),
      rated_id    UUID REFERENCES users(id),
      order_id    UUID REFERENCES orders(id),
      stars       INTEGER CHECK (stars BETWEEN 1 AND 5),
      review      TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(rater_id, order_id)
    );

    -- ── SUPPORT TICKETS ───────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS support_tickets (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID REFERENCES users(id),
      subject     TEXT NOT NULL,
      body        TEXT,
      status      TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
      assigned_to UUID REFERENCES users(id),
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── INDEXES for performance ───────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_users_subcounty    ON users(subcounty);
    CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
    CREATE INDEX IF NOT EXISTS idx_products_subcounty ON products(subcounty);
    CREATE INDEX IF NOT EXISTS idx_products_farmer    ON products(farmer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer       ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_farmer      ON orders(farmer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver  ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_notifs_user        ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_mpesa_checkout     ON mpesa_transactions(checkout_req_id);
  `);

  console.log("✅ All tables created successfully.");
  console.log("\nNext steps:");
  console.log("  node config/seed-admin.js   ← creates your admin account");
  console.log("  node config/seed-demo.js    ← creates demo users (optional)");
  console.log("  npm run dev                 ← starts the server");
  process.exit(0);
}

migrate().catch(err => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
