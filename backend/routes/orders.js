// ── /api/orders ───────────────────────────────────────────────────────────────
const router   = require("express").Router();
const db       = require("../config/db");
const { protect, roles } = require("../middleware/auth");
const emailSvc = require("../services/email");
const notifSvc = require("../services/notifications");

// GET /api/orders — list orders for current user
router.get("/", protect, async (req, res) => {
  try {
    let query, vals;
    if (req.user.role === "Admin") {
      query = `SELECT o.*, p.name AS product_name, b.name AS buyer_name, f.name AS farmer_name
               FROM orders o
               JOIN products p ON o.product_id=p.id
               JOIN users b ON o.buyer_id=b.id
               JOIN users f ON o.farmer_id=f.id
               ORDER BY o.created_at DESC`;
      vals = [];
    } else if (req.user.role === "Buyer") {
      query = `SELECT o.*, p.name AS product_name, f.name AS farmer_name, f.phone AS farmer_phone
               FROM orders o
               JOIN products p ON o.product_id=p.id
               JOIN users f ON o.farmer_id=f.id
               WHERE o.buyer_id=$1 ORDER BY o.created_at DESC`;
      vals = [req.user.id];
    } else {
      // Farmer / Agrovet — see orders placed FOR them
      query = `SELECT o.*, p.name AS product_name, b.name AS buyer_name, b.phone AS buyer_phone
               FROM orders o
               JOIN products p ON o.product_id=p.id
               JOIN users b ON o.buyer_id=b.id
               WHERE o.farmer_id=$1 ORDER BY o.created_at DESC`;
      vals = [req.user.id];
    }
    const { rows } = await db.query(query, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders — place a new order
router.post("/", protect, roles("Buyer","Farmer","Agrovet"), async (req, res) => {
  const { product_id, qty, notes } = req.body;
  if (!product_id || !qty) return res.status(400).json({ error: "product_id and qty required." });
  try {
    // Get product and its owner
    const { rows: prod } = await db.query("SELECT * FROM products WHERE id=$1 AND status='active'", [product_id]);
    if (!prod[0]) return res.status(404).json({ error: "Product not found or unavailable." });
    const product = prod[0];

    const { rows } = await db.query(
      `INSERT INTO orders (product_id, buyer_id, farmer_id, qty, unit_price, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [product_id, req.user.id, product.farmer_id, qty, product.price, notes]
    );
    const order = rows[0];

    // Notify farmer by email + in-app
    const { rows: farmer } = await db.query("SELECT * FROM users WHERE id=$1", [product.farmer_id]);
    if (farmer[0]) {
      await emailSvc.sendOrderNotification(farmer[0], req.user, product, order).catch(() => {});
      await notifSvc.create(farmer[0].id, "📦 New Order", `${req.user.name} ordered ${qty} ${product.unit} of ${product.name}`);
    }

    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/orders/:id/status — update delivery status
router.patch("/:id/status", protect, async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending","confirmed","in_transit","delivered","cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status." });
  try {
    const { rows } = await db.query("SELECT * FROM orders WHERE id=$1", [req.params.id]);
    const order = rows[0];
    if (!order) return res.status(404).json({ error: "Order not found." });

    // Only farmer, buyer (cancel only), or admin can update
    const isFarmer = order.farmer_id === req.user.id;
    const isBuyer  = order.buyer_id  === req.user.id && status === "cancelled";
    if (req.user.role !== "Admin" && !isFarmer && !isBuyer) {
      return res.status(403).json({ error: "Not authorised to update this order." });
    }

    await db.query("UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2", [status, req.params.id]);

    // Notify buyer when status changes
    const { rows: buyer } = await db.query("SELECT * FROM users WHERE id=$1", [order.buyer_id]);
    if (buyer[0]) {
      await notifSvc.create(buyer[0].id, "🚚 Order Update", `Your order is now: ${status.replace(/_/g," ")}`);
    }
    res.json({ message: "Order status updated." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
