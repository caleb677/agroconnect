// ── /api/notifications ────────────────────────────────────────────────────────
const router = require("express").Router();
const db     = require("../config/db");
const { protect, roles } = require("../middleware/auth");

// GET /api/notifications — get current user's notifications
router.get("/", protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/notifications/:id/read — mark as read
router.patch("/:id/read", protect, async (req, res) => {
  try {
    await db.query("UPDATE notifications SET read=true WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user.id]);
    res.json({ message: "Marked as read." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", protect, async (req, res) => {
  try {
    await db.query("UPDATE notifications SET read=true WHERE user_id=$1", [req.user.id]);
    res.json({ message: "All marked as read." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications/broadcast — Admin sends notification to all / by role / by subcounty
router.post("/broadcast", protect, roles("Admin","Extension Officer"), async (req, res) => {
  const { title, body, type, target_role, target_subcounty } = req.body;
  if (!title) return res.status(400).json({ error: "title required." });

  try {
    let query = "SELECT id FROM users WHERE status='active'";
    const vals = [];

    // Extension Officers can only broadcast within their sub-county
    if (req.user.role === "Extension Officer") {
      vals.push(req.user.subcounty);
      query += ` AND subcounty=$${vals.length}`;
    } else if (target_subcounty) {
      vals.push(target_subcounty);
      query += ` AND subcounty=$${vals.length}`;
    }
    if (target_role) {
      vals.push(target_role);
      query += ` AND role=$${vals.length}`;
    }

    const { rows: targets } = await db.query(query, vals);
    if (!targets.length) return res.status(400).json({ error: "No matching users found." });

    // Bulk insert notifications
    const valueStr = targets.map((_, i) => `($${i * 4 + 1},$${i * 4 + 2},$${i * 4 + 3},$${i * 4 + 4})`).join(",");
    const flatVals = targets.flatMap(t => [t.id, title, body, type || "info"]);
    await db.query(
      `INSERT INTO notifications (user_id, title, body, type) VALUES ${valueStr}`,
      flatVals
    );

    res.json({ message: `Notification sent to ${targets.length} users.`, count: targets.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
