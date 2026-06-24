// ── /api/market-prices ────────────────────────────────────────────────────────
const router = require("express").Router();
const db     = require("../config/db");
const { protect, roles, scopeFilter } = require("../middleware/auth");

// GET /api/market-prices
router.get("/", protect, scopeFilter, async (req, res) => {
  try {
    let query = `SELECT mp.*, u.name AS posted_by_name
                 FROM market_prices mp JOIN users u ON mp.posted_by=u.id WHERE 1=1`;
    const vals = [];
    if (req.scope.subcounty) { vals.push(req.scope.subcounty); query += ` AND mp.subcounty=$${vals.length}`; }
    query += " ORDER BY mp.created_at DESC LIMIT 100";
    const { rows } = await db.query(query, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/market-prices — post new price (Extension Officer or Admin)
router.post("/", protect, roles("Admin","Extension Officer"), async (req, res) => {
  const { produce, unit, price, market, ward } = req.body;
  if (!produce || !price) return res.status(400).json({ error: "produce and price required." });
  try {
    const { rows } = await db.query(
      `INSERT INTO market_prices (produce,unit,price,market,subcounty,ward,posted_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [produce, unit, price, market, req.user.subcounty || req.body.subcounty, ward || req.user.ward, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
