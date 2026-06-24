// ── Email service (Resend API) ────────────────────────────────────────────────
const { Resend } = require("resend");
const resend     = new Resend(process.env.RESEND_API_KEY);
const FROM       = process.env.EMAIL_FROM || "noreply@agroconnect.co.ke";
const ADMIN      = process.env.ADMIN_EMAIL || "calebmwasi22@gmail.com";

// Base HTML wrapper
function html(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:'Segoe UI',sans-serif;background:#f8f8f6;margin:0;padding:20px}
  .card{background:#fff;border-radius:12px;padding:32px;max-width:540px;margin:0 auto}
  .header{background:#0F6E56;color:#fff;border-radius:10px 10px 0 0;padding:20px 32px;margin:-32px -32px 24px}
  h1{margin:0;font-size:22px} p{color:#444;line-height:1.7}
  .btn{display:inline-block;background:#0F6E56;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0}
  .footer{text-align:center;color:#aaa;font-size:12px;margin-top:24px}
  .badge{background:#E1F5EE;color:#0F6E56;border-radius:20px;padding:4px 12px;font-size:13px;font-weight:600}
</style></head><body>
<div class="card">
  <div class="header"><h1>🌽 AgroConnect — ${title}</h1></div>
  ${body}
  <div class="footer">AgroConnect Kenya · Murang'a County Agricultural Platform<br>
  © ${new Date().getFullYear()} · <a href="https://agroconnect.co.ke" style="color:#0F6E56">agroconnect.co.ke</a></div>
</div></body></html>`;
}

// Welcome email on registration
exports.sendWelcome = async (user) => {
  await resend.emails.send({
    from:    FROM,
    to:      user.email,
    subject: `Welcome to AgroConnect, ${user.name}! 🌱`,
    html:    html("Welcome!", `
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Your AgroConnect account has been created successfully!</p>
      <p><span class="badge">${user.role}</span> &nbsp; ${user.subcounty || ""} ${user.ward ? "→ " + user.ward : ""}</p>
      <p>You can now log in and start using the platform — view market prices, list your produce, connect with buyers and access the AI crop advisor.</p>
      <a href="https://agroconnect.co.ke" class="btn">Open AgroConnect →</a>
      <p>If you have any questions, contact your local Extension Officer or reply to this email.</p>
    `),
  });
};

// Notify admin of new registration
exports.notifyAdmin = async (subject, message) => {
  await resend.emails.send({
    from:    FROM,
    to:      ADMIN,
    subject: `[AgroConnect Admin] ${subject}`,
    html:    html("Admin Alert", `<p>${message}</p><p><strong>Time:</strong> ${new Date().toLocaleString("en-KE")}</p>`),
  });
};

// Order notification to seller
exports.sendOrderNotification = async (seller, buyer, product, order) => {
  await resend.emails.send({
    from:    FROM,
    to:      seller.email,
    subject: `📦 New Order — ${product.name}`,
    html:    html("New Order Received!", `
      <p>Hello <strong>${seller.name}</strong>,</p>
      <p><strong>${buyer.name}</strong> has placed an order for your produce:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Product</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${product.name}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Quantity</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${order.qty} ${product.unit}</td></tr>
        <tr><td style="padding:8px;color:#888">Total</td><td style="padding:8px;font-weight:600;color:#0F6E56">KES ${(order.qty * product.price).toLocaleString()}</td></tr>
      </table>
      <p>Buyer contact: <strong>${buyer.phone}</strong></p>
      <a href="https://agroconnect.co.ke" class="btn">View Order →</a>
    `),
  });
};

// Daily analytics report to admin
exports.sendDailyReport = async ({ new_users, new_orders, daily_revenue }) => {
  await resend.emails.send({
    from:    FROM,
    to:      ADMIN,
    subject: `📊 AgroConnect Daily Report — ${new Date().toLocaleDateString("en-KE")}`,
    html:    html("Daily Summary", `
      <p>Here is your platform summary for today:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f8f8f6"><td style="padding:12px;color:#888">New Users</td><td style="padding:12px;font-weight:700;font-size:20px;color:#0F6E56">${new_users}</td></tr>
        <tr><td style="padding:12px;color:#888">New Orders</td><td style="padding:12px;font-weight:700;font-size:20px;color:#0F6E56">${new_orders}</td></tr>
        <tr style="background:#f8f8f6"><td style="padding:12px;color:#888">Revenue</td><td style="padding:12px;font-weight:700;font-size:20px;color:#0F6E56">KES ${daily_revenue.toLocaleString()}</td></tr>
      </table>
      <a href="https://agroconnect.co.ke/admin/analytics" class="btn">View Full Analytics →</a>
    `),
  });
};

// Broadcast email to multiple users
exports.sendBroadcast = async (user, subject, body) => {
  await resend.emails.send({
    from:    FROM,
    to:      user.email,
    subject: `[AgroConnect] ${subject}`,
    html:    html(subject, `<p>Hello ${user.name},</p><p>${body}</p>`),
  });
};
