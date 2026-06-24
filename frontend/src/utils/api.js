// ── Frontend API client — talks to the backend ─────────────────────────────
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken() { return localStorage.getItem("ac_token"); }
function setToken(t) { localStorage.setItem("ac_token", t); }
function clearToken() { localStorage.removeItem("ac_token"); }

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login:          (email, password)    => request("POST", "/auth/login",           { email, password }),
  register:       (data)               => request("POST", "/auth/register",         data),
  me:             ()                   => request("GET",  "/auth/me"),
  forgotPassword: (data)               => request("POST", "/auth/forgot-password",  data),

  // ── Users ─────────────────────────────────────────────────────────────────
  getUsers:       ()                   => request("GET",  "/users"),
  getUser:        (id)                 => request("GET",  `/users/${id}`),
  updateUserStatus:(id, status)        => request("PATCH",`/users/${id}/status`,    { status }),
  deleteUser:     (id)                 => request("DELETE",`/users/${id}`),
  getUserStats:   ()                   => request("GET",  "/users/stats/summary"),

  // ── Products ──────────────────────────────────────────────────────────────
  getProducts:    (params = {})        => request("GET",  "/products?" + new URLSearchParams(params)),
  createProduct:  (data)               => request("POST", "/products",              data),
  updateProduct:  (id, data)           => request("PATCH",`/products/${id}`,        data),
  deleteProduct:  (id)                 => request("DELETE",`/products/${id}`),

  // ── Orders ────────────────────────────────────────────────────────────────
  getOrders:      ()                   => request("GET",  "/orders"),
  createOrder:    (data)               => request("POST", "/orders",                data),
  updateOrderStatus:(id, status)       => request("PATCH",`/orders/${id}/status`,   { status }),

  // ── Market prices ─────────────────────────────────────────────────────────
  getPrices:      ()                   => request("GET",  "/market-prices"),
  postPrice:      (data)               => request("POST", "/market-prices",         data),

  // ── Messages ──────────────────────────────────────────────────────────────
  getThreads:     ()                   => request("GET",  "/messages/threads"),
  getConversation:(partnerId)          => request("GET",  `/messages/${partnerId}`),
  sendMessage:    (receiver_id, body)  => request("POST", "/messages",              { receiver_id, body }),
  getUnreadCount: ()                   => request("GET",  "/messages/unread/count"),

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications:()                  => request("GET",  "/notifications"),
  markRead:       (id)                 => request("PATCH",`/notifications/${id}/read`),
  markAllRead:    ()                   => request("PATCH","/notifications/read-all"),
  broadcast:      (data)               => request("POST", "/notifications/broadcast",data),

  // ── M-Pesa ────────────────────────────────────────────────────────────────
  stkPush:        (data)               => request("POST", "/mpesa/stk-push",        data),
  mpesaStatus:    (checkoutReqId)      => request("GET",  `/mpesa/status/${checkoutReqId}`),
  mpesaHistory:   ()                   => request("GET",  "/mpesa/history"),

  // ── Upload ────────────────────────────────────────────────────────────────
  uploadImage: async (file) => {
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch(`${BASE}/upload/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },
  uploadVideo: async (file) => {
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch(`${BASE}/upload/video`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  // ── AI ────────────────────────────────────────────────────────────────────
  aiChat:         (messages)           => request("POST", "/ai/chat",               { messages }),

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalyticsSummary:     ()          => request("GET",  "/analytics/summary"),
  getAnalyticsByRole:      ()          => request("GET",  "/analytics/users-by-role"),
  getSalesByMonth:         ()          => request("GET",  "/analytics/sales-by-month"),
  getTopProducts:          ()          => request("GET",  "/analytics/top-products"),
  getSubcountyBreakdown:   ()          => request("GET",  "/analytics/subcounty-breakdown"),
  sendDailyEmailReport:    ()          => request("POST", "/analytics/email-report"),

  // ── Admin ─────────────────────────────────────────────────────────────────
  getAdminDashboard:       ()          => request("GET",  "/admin/dashboard"),
  getAdminActivity:        ()          => request("GET",  "/admin/activity"),
  adminUpdateUser: (id, data)          => request("PATCH",`/admin/users/${id}`,     data),
  adminDeleteUser: (id)                => request("DELETE",`/admin/users/${id}`),
  emailAll:       (data)               => request("POST", "/admin/email-all",       data),
  getMpesaTransactions:    ()          => request("GET",  "/admin/mpesa-transactions"),

  // ── Token helpers ─────────────────────────────────────────────────────────
  setToken, getToken, clearToken,
};
