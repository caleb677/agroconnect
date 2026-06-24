// ── /api/users ────────────────────────────────────────────────────────────────
const router = require("express").Router();
const db     = require("../config/db");
const { protect, roles, scopeFilter } = require("../middleware/auth");

// GET /api/users — list users (scoped by hierarchy)
router.get("/", protect, roles("Admin","Extension Officer"), scopeFilter, async (req, res) => {
  try {
    let query  = "SELECT id,name,email,phone,role,subcounty,ward,location,status,created_at FROM users WHERE 1=1";
    const vals = [];
    if (req.scope.subcounty) { vals.push(req.scope.subcounty); query += ` AND subcounty=$${vals.length}`; }
    if (req.scope.ward)      { vals.push(req.scope.ward);      query += ` AND ward=$${vals.length}`; }
    query += " ORDER BY created_at DESC";
    const { rows } = await db.query(query, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id,name,email,phone,role,subcounty,ward,location,status,created_at FROM users WHERE id=$1",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found." });
    // Scope check: non-admin can only view own sub-county
    if (req.user.role !== "Admin") {
      if (req.user.role === "Extension Officer" && rows[0].subcounty !== req.user.subcounty) {
        return res.status(403).json({ error: "Access denied — different sub-county." });
      }
    }
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/users/:id/status — suspend/activate (Admin only)
router.patch("/:id/status", protect, roles("Admin"), async (req, res) => {
  try {
    const { status } = req.body; // 'active' | 'suspended'
    await db.query("UPDATE users SET status=$1 WHERE id=$2", [status, req.params.id]);
    res.json({ message: "Status updated." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/users/:id
// Admin: delete anyone
// Extension Officer: delete Farmer/Buyer/Agrovet in own sub-county only
router.delete("/:id", protect, roles("Admin","Extension Officer"), async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE id=$1", [req.params.id]);
    const target = rows[0];
    if (!target) return res.status(404).json({ error: "User not found." });

    if (req.user.role === "Extension Officer") {
      if (!["Farmer","Buyer","Agrovet"].includes(target.role)) {
        return res.status(403).json({ error: "Extension Officers can only remove Farmers, Buyers and Agrovets." });
      }
      if (target.subcounty !== req.user.subcounty) {
        return res.status(403).json({ error: "You can only remove users in your own sub-county." });
      }
    }
    await db.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    res.json({ message: "User removed." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/stats/summary — admin dashboard counts
router.get("/stats/summary", protect, roles("Admin","Extension Officer"), scopeFilter, async (req, res) => {
  try {
    let where = "WHERE 1=1";
    const vals = [];
    if (req.scope.subcounty) { vals.push(req.scope.subcounty); where += ` AND subcounty=$${vals.length}`; }
    const { rows } = await db.query(
      `SELECT role, COUNT(*) AS count FROM users ${where} GROUP BY role`, vals
    );
    const summary = {};
    rows.forEach(r => { summary[r.role] = Number(r.count); });
    res.json(summary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
