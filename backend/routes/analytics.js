// ── /api/analytics ────────────────────────────────────────────────────────────
const router = require("express").Router();
const db     = require("../config/db");
const { protect, roles, scopeFilter } = require("../middleware/auth");
const emailSvc = require("../services/email");

// GET /api/analytics/summary — dashboard numbers
router.get("/summary", protect, roles("Admin","Extension Officer"), scopeFilter, async (req, res) => {
  try {
    const sc   = req.scope.subcounty;
    const scWhere = sc ? `AND u.subcounty='${sc.replace(/'/g,"''")}'` : "";
    const pWhere  = sc ? `AND p.subcounty='${sc.replace(/'/g,"''")}'` : "";

    const [users, products, orders, revenue] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users WHERE status='active' ${scWhere}`),
      db.query(`SELECT COUNT(*) FROM products WHERE status='active' ${pWhere}`),
      db.query(`SELECT COUNT(*) FROM orders o JOIN products p ON o.product_id=p.id WHERE o.status!='cancelled' ${pWhere}`),
      db.query(`SELECT COALESCE(SUM(o.total),0) AS total FROM orders o JOIN products p ON o.product_id=p.id WHERE o.status='delivered' ${pWhere}`),
    ]);

    res.json({
      total_users:    Number(users.rows[0].count),
      total_products: Number(products.rows[0].count),
      total_orders:   Number(orders.rows[0].count),
      total_revenue:  Number(revenue.rows[0].total),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/users-by-role — breakdown by role
router.get("/users-by-role", protect, roles("Admin","Extension Officer"), scopeFilter, async (req, res) => {
  try {
    const sc = req.scope.subcounty;
    const { rows } = await db.query(
      `SELECT role, COUNT(*) AS count FROM users WHERE status='active' ${sc ? `AND subcounty='${sc.replace(/'/g,"''")}'`:""} GROUP BY role`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/sales-by-month — monthly revenue trend
router.get("/sales-by-month", protect, roles("Admin","Extension Officer"), scopeFilter, async (req, res) => {
  try {
    const sc = req.scope.subcounty;
    const { rows } = await db.query(
      `SELECT TO_CHAR(o.created_at,'Mon YYYY') AS month,
              DATE_TRUNC('month',o.created_at) AS month_start,
              COUNT(*) AS orders,
              COALESCE(SUM(o.total),0) AS revenue
       FROM orders o JOIN products p ON o.product_id=p.id
       WHERE o.status='delivered' ${sc ? `AND p.subcounty='${sc.replace(/'/g,"''")}'`:""}
       GROUP BY month, month_start ORDER BY month_start DESC LIMIT 12`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/top-products — best selling produce
router.get("/top-products", protect, roles("Admin","Extension Officer"), scopeFilter, async (req, res) => {
  try {
    const sc = req.scope.subcounty;
    const { rows } = await db.query(
      `SELECT p.name, p.category, COUNT(o.id) AS orders, COALESCE(SUM(o.total),0) AS revenue
       FROM orders o JOIN products p ON o.product_id=p.id
       WHERE o.status!='cancelled' ${sc ? `AND p.subcounty='${sc.replace(/'/g,"''")}'`:""}
       GROUP BY p.name, p.category ORDER BY orders DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/subcounty-breakdown — per sub-county stats (admin only)
router.get("/subcounty-breakdown", protect, roles("Admin"), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.subcounty,
              COUNT(DISTINCT u.id) AS users,
              COUNT(DISTINCT CASE WHEN u.role='Farmer' THEN u.id END) AS farmers,
              COUNT(DISTINCT p.id) AS products,
              COALESCE(SUM(o.total),0) AS revenue
       FROM users u
       LEFT JOIN products p ON p.farmer_id=u.id
       LEFT JOIN orders   o ON o.farmer_id=u.id AND o.status='delivered'
       WHERE u.subcounty IS NOT NULL
       GROUP BY u.subcounty ORDER BY revenue DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/analytics/email-report — send daily summary to admin
router.post("/email-report", protect, roles("Admin"), async (req, res) => {
  try {
    const [users, orders, revenue] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE created_at > NOW()-INTERVAL '24 hours'"),
      db.query("SELECT COUNT(*) FROM orders WHERE created_at > NOW()-INTERVAL '24 hours'"),
      db.query("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status='delivered' AND updated_at > NOW()-INTERVAL '24 hours'"),
    ]);
    await emailSvc.sendDailyReport({
      new_users:    Number(users.rows[0].count),
      new_orders:   Number(orders.rows[0].count),
      daily_revenue: Number(revenue.rows[0].total),
    });
    res.json({ message: "Daily report emailed to admin." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
