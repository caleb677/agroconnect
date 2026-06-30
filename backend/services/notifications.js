// ── In-app notification service ───────────────────────────────────────────────
const db = require("../config/db");

// Create a notification for a single user
exports.create = async (userId, title, body, type = "info") => {
  await db.query(
    "INSERT INTO notifications (user_id,title,body,type) VALUES ($1,$2,$3,$4)",
    [userId, title, body, type]
  );
};

// Broadcast to all users in a sub-county (or all if no filter)
exports.broadcast = async (title, body, type = "info", { subcounty, role } = {}) => {
  let query = "SELECT id FROM users WHERE status='active'";
  const vals = [];
  if (subcounty) { vals.push(subcounty); query += ` AND subcounty=$${vals.length}`; }
  if (role)      { vals.push(role);      query += ` AND role=$${vals.length}`; }
  const { rows } = await db.query(query, vals);
  if (!rows.length) return 0;
  const valueStr = rows.map((_, i) => `($${i * 4 + 1},$${i * 4 + 2},$${i * 4 + 3},$${i * 4 + 4})`).join(",");
  const flatVals = rows.flatMap(r => [r.id, title, body, type]);
  await db.query(`INSERT INTO notifications (user_id,title,body,type) VALUES ${valueStr}`, flatVals);
  return rows.length;
};
