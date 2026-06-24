// ── /api/products ─────────────────────────────────────────────────────────────
const router = require("express").Router();
const db     = require("../config/db");
const { protect, scopeFilter } = require("../middleware/auth");

// GET /api/products — marketplace listings scoped to user's area
router.get("/", protect, scopeFilter, async (req, res) => {
  try {
    const { category, search, subcounty, ward } = req.query;
    let query = `SELECT p.*, u.name AS farmer_name, u.phone AS farmer_phone
                 FROM products p JOIN users u ON p.farmer_id=u.id WHERE p.status='active'`;
    const vals = [];
    // Apply hierarchy scope
    if (req.scope.subcounty) { vals.push(req.scope.subcounty); query += ` AND p.subcounty=$${vals.length}`; }
    if (req.scope.ward)      { vals.push(req.scope.ward);      query += ` AND p.ward=$${vals.length}`; }
    // Optional extra filters from query params
    if (category) { vals.push(category); query += ` AND p.category=$${vals.length}`; }
    if (search)   { vals.push(`%${search}%`); query += ` AND p.name ILIKE $${vals.length}`; }
    query += " ORDER BY p.created_at DESC LIMIT 100";
    const { rows } = await db.query(query, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/products — create listing
router.post("/", protect, async (req, res) => {
  const { name, category, price, qty, unit, description, media_url, media_type } = req.body;
  if (!name || !price) return res.status(400).json({ error: "name and price required." });
  try {
    const { rows } = await db.query(
      `INSERT INTO products (farmer_id,name,category,price,qty,unit,description,media_url,media_type,subcounty,ward,location)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.user.id, name, category, price, qty, unit, description, media_url, media_type,
       req.user.subcounty, req.user.ward, req.user.location]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/products/:id — update (owner or admin)
router.patch("/:id", protect, async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    const product = rows[0];
    if (!product) return res.status(404).json({ error: "Product not found." });
    if (req.user.role !== "Admin" && product.farmer_id !== req.user.id) {
      return res.status(403).json({ error: "Not your listing." });
    }
    const { name, category, price, qty, unit, description, status } = req.body;
    await db.query(
      `UPDATE products SET name=COALESCE($1,name), category=COALESCE($2,category),
       price=COALESCE($3,price), qty=COALESCE($4,qty), unit=COALESCE($5,unit),
       description=COALESCE($6,description), status=COALESCE($7,status) WHERE id=$8`,
      [name, category, price, qty, unit, description, status, req.params.id]
    );
    res.json({ message: "Product updated." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/products/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Product not found." });
    if (req.user.role !== "Admin" && rows[0].farmer_id !== req.user.id) {
      return res.status(403).json({ error: "Not your listing." });
    }
    await db.query("DELETE FROM products WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
