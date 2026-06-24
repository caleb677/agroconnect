// ── /api/messages ─────────────────────────────────────────────────────────────
const router = require("express").Router();
const db     = require("../config/db");
const { protect } = require("../middleware/auth");

// GET /api/messages/threads — list all conversation partners
router.get("/threads", protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT DISTINCT ON (partner_id)
         partner_id,
         partner_name,
         partner_role,
         last_msg,
         last_time,
         unread_count
       FROM (
         SELECT
           CASE WHEN m.sender_id=$1 THEN m.receiver_id ELSE m.sender_id END AS partner_id,
           CASE WHEN m.sender_id=$1 THEN ru.name ELSE su.name END AS partner_name,
           CASE WHEN m.sender_id=$1 THEN ru.role ELSE su.role END AS partner_role,
           m.body AS last_msg,
           m.created_at AS last_time,
           COUNT(CASE WHEN m.receiver_id=$1 AND NOT m.read THEN 1 END)
             OVER (PARTITION BY CASE WHEN m.sender_id=$1 THEN m.receiver_id ELSE m.sender_id END)
             AS unread_count
         FROM messages m
         JOIN users su ON m.sender_id=su.id
         JOIN users ru ON m.receiver_id=ru.id
         WHERE m.sender_id=$1 OR m.receiver_id=$1
         ORDER BY m.created_at DESC
       ) t
       ORDER BY partner_id, last_time DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/messages/:partnerId — conversation with one user
router.get("/:partnerId", protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT m.*, u.name AS sender_name
       FROM messages m JOIN users u ON m.sender_id=u.id
       WHERE (m.sender_id=$1 AND m.receiver_id=$2)
          OR (m.sender_id=$2 AND m.receiver_id=$1)
       ORDER BY m.created_at ASC LIMIT 200`,
      [req.user.id, req.params.partnerId]
    );
    // Mark received messages as read
    await db.query(
      "UPDATE messages SET read=true WHERE sender_id=$1 AND receiver_id=$2 AND read=false",
      [req.params.partnerId, req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/messages — send a message
router.post("/", protect, async (req, res) => {
  const { receiver_id, body } = req.body;
  if (!receiver_id || !body?.trim()) return res.status(400).json({ error: "receiver_id and body required." });
  try {
    const { rows } = await db.query(
      "INSERT INTO messages (sender_id,receiver_id,body) VALUES ($1,$2,$3) RETURNING *",
      [req.user.id, receiver_id, body.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/messages/unread/count
router.get("/unread/count", protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT COUNT(*) FROM messages WHERE receiver_id=$1 AND read=false",
      [req.user.id]
    );
    res.json({ count: Number(rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
