// ── /api/auth ─────────────────────────────────────────────────────────────────
const router   = require("express").Router();
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const db       = require("../config/db");
const { protect } = require("../middleware/auth");
const emailSvc = require("../services/email");

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, phone, role, password, subcounty, ward, location, ...extra } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: "name, email, password, role are required." });

  try {
    const exists = await db.query("SELECT id FROM users WHERE email=$1", [email.toLowerCase()]);
    if (exists.rows[0]) return res.status(409).json({ error: "Email already registered." });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (name,email,phone,role,password_hash,subcounty,ward,location,farm_size,produce,biz_type,staff_id,dept)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id,name,email,role,subcounty,ward,location,status`,
      [name, email.toLowerCase(), phone, role, hash, subcounty, ward, location,
       extra.farmSize, extra.produce, extra.bizType, extra.staffId, extra.dept]
    );
    const user  = rows[0];
    const token = sign(user.id);

    // Send welcome email
    await emailSvc.sendWelcome(user).catch(() => {});
    // Notify admin
    await emailSvc.notifyAdmin("New user registered", `${name} joined as ${role} in ${subcounty}`).catch(() => {});

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email=$1", [email.toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "No account found with that email." });
    if (user.status === "suspended") return res.status(403).json({ error: "Account suspended. Contact admin." });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Incorrect password." });

    await db.query("UPDATE users SET last_login=NOW() WHERE id=$1", [user.id]);
    const { password_hash, ...safeUser } = user;
    res.json({ token: sign(user.id), user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — get current user
router.get("/me", protect, (req, res) => {
  const { password_hash, ...safeUser } = req.user;
  res.json(safeUser);
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email, phone, newPassword } = req.body;
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email=$1", [email?.toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "No account found." });
    if (user.phone?.replace(/\s/g,"") !== phone?.replace(/\s/g,"")) return res.status(400).json({ error: "Phone number does not match." });
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, user.id]);
    res.json({ message: "Password updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
