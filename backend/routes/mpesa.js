// ── /api/mpesa ────────────────────────────────────────────────────────────────
// Real Safaricom Daraja STK Push integration
const router = require("express").Router();
const db     = require("../config/db");
const { protect } = require("../middleware/auth");

// ── Get OAuth token from Safaricom ───────────────────────────────────────────
async function getDarajaToken() {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const url = process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const resp = await fetch(url, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await resp.json();
  if (!data.access_token) throw new Error("Failed to get M-Pesa token: " + JSON.stringify(data));
  return data.access_token;
}

// ── Build STK Push password ──────────────────────────────────────────────────
function buildPassword(timestamp) {
  const str = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  return Buffer.from(str).toString("base64");
}

// ── Format phone to 254XXXXXXXXX ─────────────────────────────────────────────
function formatPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("07") || digits.startsWith("01")) return "254" + digits.slice(1);
  if (digits.startsWith("254")) return digits;
  return "254" + digits;
}

// POST /api/mpesa/stk-push — initiate STK push (sends M-Pesa PIN prompt to phone)
router.post("/stk-push", protect, async (req, res) => {
  const { phone, amount, order_id, description } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: "phone and amount required." });
  if (Number(amount) < 1)  return res.status(400).json({ error: "Minimum amount is KES 1." });

  try {
    const token     = await getDarajaToken();
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g,"").slice(0,14);
    const password  = buildPassword(timestamp);
    const formatted = formatPhone(phone);

    const stkUrl = process.env.MPESA_ENVIRONMENT === "production"
      ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
      : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const body = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   "CustomerPayBillOnline",
      Amount:            Math.round(Number(amount)),
      PartyA:            formatted,
      PartyB:            process.env.MPESA_SHORTCODE,
      PhoneNumber:       formatted,
      CallBackURL:       process.env.MPESA_CALLBACK_URL,
      AccountReference:  "AgroConnect",
      TransactionDesc:   description || "AgroConnect Payment",
    };

    const stkResp = await fetch(stkUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const stkData = await stkResp.json();

    if (stkData.ResponseCode !== "0") {
      return res.status(400).json({ error: stkData.errorMessage || stkData.ResponseDescription || "STK Push failed." });
    }

    // Save pending transaction to DB
    const { rows } = await db.query(
      `INSERT INTO mpesa_transactions (order_id, user_id, phone, amount, merchant_req_id, checkout_req_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING id`,
      [order_id || null, req.user.id, formatted, amount, stkData.MerchantRequestID, stkData.CheckoutRequestID]
    );

    res.json({
      message:          "STK Push sent. Check your phone for M-Pesa PIN prompt.",
      checkout_req_id:  stkData.CheckoutRequestID,
      transaction_id:   rows[0].id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/mpesa/callback — Safaricom calls this when user completes/cancels payment
// This URL must be HTTPS and publicly reachable
router.post("/callback", async (req, res) => {
  // Always respond 200 immediately — Safaricom requires this
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return;

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

    if (ResultCode === 0 && CallbackMetadata?.Item) {
      // Payment SUCCESS — extract M-Pesa receipt number
      const items = CallbackMetadata.Item;
      const get   = (name) => items.find(i => i.Name === name)?.Value;
      const mpesaCode = get("MpesaReceiptNumber");
      const amount    = get("Amount");
      const phone     = get("PhoneNumber");

      await db.query(
        `UPDATE mpesa_transactions
         SET status='completed', mpesa_code=$1, result_desc=$2, completed_at=NOW()
         WHERE checkout_req_id=$3`,
        [mpesaCode, ResultDesc, CheckoutRequestID]
      );

      // Update order status if linked
      const { rows } = await db.query(
        "SELECT * FROM mpesa_transactions WHERE checkout_req_id=$1", [CheckoutRequestID]
      );
      if (rows[0]?.order_id) {
        await db.query("UPDATE orders SET status='confirmed', mpesa_code=$1 WHERE id=$2",
          [mpesaCode, rows[0].order_id]);
      }

      console.log(`✅ M-Pesa payment confirmed: ${mpesaCode} KES ${amount} from ${phone}`);
    } else {
      // Payment FAILED or CANCELLED
      await db.query(
        "UPDATE mpesa_transactions SET status='failed', result_desc=$1 WHERE checkout_req_id=$2",
        [ResultDesc, CheckoutRequestID]
      );
      console.log(`❌ M-Pesa payment failed: ${ResultDesc}`);
    }
  } catch (err) {
    console.error("M-Pesa callback error:", err.message);
  }
});

// GET /api/mpesa/status/:checkoutReqId — poll payment status
router.get("/status/:checkoutReqId", protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id,status,mpesa_code,amount,result_desc,completed_at FROM mpesa_transactions WHERE checkout_req_id=$1",
      [req.params.checkoutReqId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Transaction not found." });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/mpesa/history — current user's payment history
router.get("/history", protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT t.*, o.id AS order_ref
       FROM mpesa_transactions t
       LEFT JOIN orders o ON t.order_id=o.id
       WHERE t.user_id=$1 ORDER BY t.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
