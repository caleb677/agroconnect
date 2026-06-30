// ── JWT Authentication + Role/Hierarchy middleware ───────────────────────────
const jwt = require("jsonwebtoken");
const db  = require("../config/db");

// Verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token. Please log in." });
  }
  try {
    const token   = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await db.query("SELECT * FROM users WHERE id=$1 AND status='active'", [decoded.id]);
    if (!rows[0]) return res.status(401).json({ error: "User not found or suspended." });
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Only allow specific roles
exports.roles = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied. Requires: ${allowed.join(" or ")}` });
  }
  next();
};

// Hierarchy scope check:
// Admin sees everything.
// Extension Officer sees only their sub-county.
// Others see only their ward/location.
exports.scopeFilter = (req, _res, next) => {
  const u = req.user;
  if (u.role === "Admin") {
    req.scope = {};                          // no filter
  } else if (u.role === "Extension Officer") {
    req.scope = { subcounty: u.subcounty }; // filter by sub-county
  } else {
    req.scope = { subcounty: u.subcounty, ward: u.ward }; // filter by ward
  }
  next();
};
