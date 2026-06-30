// ── /api/admin ────────────────────────────────────────────────────────────────
// Admin-only platform control (Caleb Mwasi — owner)
const router   = require("express").Router();
const db       = require("../config/db");
const { protect, roles } = require("../middleware/auth");
const emailSvc = require("../services/email");

// GET /api/admin/dashboard — full platform overview
router.get("/dashboard", protect, roles("Admin"), async (req, res) => {
  try {
    const [users, products, orders, revenue, pending, mpesa] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE status='active'"),
      db.query("SELECT COUNT(*) FROM products WHERE status='active'"),
      db.query("SELECT COUNT(*) FROM orders"),
      db.query("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status='delivered'"),
      db.query("SELECT COUNT(*) FROM users WHERE status='pending'"),
      db.query("SELECT COALESCE(SUM(amount),0) AS total FROM mpesa_transactions WHERE status='completed'"),
    ]);
    res.json({
      users:           Number(users.rows[0].count),
      products:        Number(products.rows[0].count),
      orders:          Number(orders.rows[0].count),
      revenue:         Number(revenue.rows[0].total),
      pending_users:   Number(pending.rows[0].count),
      mpesa_collected: Number(mpesa.rows[0].total),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/activity — recent platform activity log
router.get("/activity", protect, roles("Admin"), async (req, res) => {
  try {
    const { rows } = await db.query(
      `(SELECT 'new_user' AS type, name AS label, created_at FROM users ORDER BY created_at DESC LIMIT 10)
       UNION ALL
       (SELECT 'new_order', 'Order #' || id::text, created_at FROM orders ORDER BY created_at DESC LIMIT 10)
       UNION ALL
       (SELECT 'payment', 'M-Pesa ' || COALESCE(mpesa_code,'pending'), created_at FROM mpesa_transactions ORDER BY created_at DESC LIMIT 10)
       ORDER BY created_at DESC LIMIT 20`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/users/:id — admin edit any user's details
router.patch("/users/:id", protect, roles("Admin"), async (req, res) => {
  const { name, phone, role, subcounty, ward, location, status } = req.body;
  try {
    await db.query(
      `UPDATE users SET
         name=COALESCE($1,name), phone=COALESCE($2,phone), role=COALESCE($3,role),
         subcounty=COALESCE($4,subcounty), ward=COALESCE($5,ward), location=COALESCE($6,location),
         status=COALESCE($7,status)
       WHERE id=$8`,
      [name, phone, role, subcounty, ward, location, status, req.params.id]
    );
    res.json({ message: "User updated." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/users/:id — hard delete (admin only)
router.delete("/users/:id", protect, roles("Admin"), async (req, res) => {
  try {
    // Prevent deleting the super admin account itself
    const { rows } = await db.query("SELECT email FROM users WHERE id=$1", [req.params.id]);
    if (rows[0]?.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: "Cannot delete the super admin account." });
    }
    await db.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    res.json({ message: "User permanently deleted." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/email-all — blast email to all active users (admin only)
router.post("/email-all", protect, roles("Admin"), async (req, res) => {
  const { subject, body, target_role } = req.body;
  if (!subject || !body) return res.status(400).json({ error: "subject and body required." });
  try {
    let query = "SELECT email, name FROM users WHERE status='active'";
    const vals = [];
    if (target_role) { vals.push(target_role); query += ` AND role=$${vals.length}`; }
    const { rows } = await db.query(query, vals);
    let sent = 0;
    for (const user of rows) {
      await emailSvc.sendBroadcast(user, subject, body).catch(() => {});
      sent++;
    }
    res.json({ message: `Email sent to ${sent} users.` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/mpesa-transactions — all M-Pesa activity
router.get("/mpesa-transactions", protect, roles("Admin"), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT t.*, u.name AS user_name, u.phone AS user_phone
       FROM mpesa_transactions t JOIN users u ON t.user_id=u.id
       ORDER BY t.created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
