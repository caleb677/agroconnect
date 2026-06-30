require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");

const app = express();

// ── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limit: 100 requests per 15 min per IP
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
// Stricter limit on auth routes
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: "Too many attempts, try again in 15 minutes." } }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/users",         require("./routes/users"));
app.use("/api/products",      require("./routes/products"));
app.use("/api/orders",        require("./routes/orders"));
app.use("/api/messages",      require("./routes/messages"));
app.use("/api/market-prices", require("./routes/marketprices"));
app.use("/api/analytics",     require("./routes/analytics"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/mpesa",         require("./routes/mpesa"));
app.use("/api/upload",        require("./routes/upload"));
app.use("/api/ai",            require("./routes/ai"));
app.use("/api/admin",         require("./routes/admin"));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", platform: "AgroConnect Murang'a", time: new Date() }));

// ── 404 & error handlers ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ AgroConnect backend running on port ${PORT}`));
