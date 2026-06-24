# 🌽 AgroConnect Kenya — Full Stack Platform
## Murang'a County Agricultural Platform

---

## 📁 PROJECT STRUCTURE

```
AgroConnect/
│
├── frontend/          ← React app (what users see in browser)
│   ├── src/
│   │   ├── auth/          ← Login, Register, Forgot Password screens
│   │   ├── components/    ← Reusable UI pieces (Sidebar, TopBar, buttons)
│   │   │   └── common/    ← Alert, Btn, Modal, Field, Badge, Table...
│   │   ├── data/          ← Static data (hierarchy, roles, mock fallback)
│   │   ├── pages/         ← Full pages (dashboard, marketplace, mpesa...)
│   │   └── utils/         ← api.js (talks to backend), constants, lang
│   ├── public/            ← maize.png, manifest.json, sw.js (PWA)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/           ← Node.js API server (data, auth, payments)
    ├── config/
    │   ├── db.js          ← PostgreSQL connection (Supabase)
    │   └── migrate.js     ← Creates all database tables (run once)
    ├── middleware/
    │   └── auth.js        ← JWT verification + hierarchy scope
    ├── routes/
    │   ├── auth.js        ← POST /register, POST /login, GET /me
    │   ├── users.js       ← GET/DELETE /users (scoped by role)
    │   ├── products.js    ← Marketplace listings (CRUD)
    │   ├── orders.js      ← Orders + delivery status
    │   ├── mpesa.js       ← REAL STK Push + callback handler
    │   ├── ai.js          ← Claude AI crop advisor
    │   ├── messages.js    ← Private messaging
    │   ├── notifications.js← In-app + broadcast notifications
    │   ├── analytics.js   ← Dashboard charts, email reports
    │   ├── marketprices.js← Live market prices by ward
    │   ├── upload.js      ← Image/video → Cloudinary
    │   └── admin.js       ← Full admin control (Caleb only)
    ├── services/
    │   ├── email.js       ← Resend API — welcome, orders, reports
    │   └── notifications.js← Notification helper
    ├── server.js          ← Express app entry point
    ├── package.json
    └── .env.example       ← Copy to .env and fill in keys
```

---

## 🚀 HOW TO RUN (Development)

### 1. Start the Backend
```bash
cd backend
cp .env.example .env        # Fill in your API keys
npm install
node config/migrate.js      # Create database tables (ONCE only)
npm run dev                 # Starts on http://localhost:4000
```

### 2. Start the Frontend
```bash
cd frontend
cp .env.example .env        # Set VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                 # Starts on http://localhost:5173
```

---

## 🔑 API KEYS YOU NEED

| Key | Get It From | Cost |
|-----|------------|------|
| `DATABASE_URL` | supabase.com → Settings → Database | FREE |
| `JWT_SECRET` | Make up any long random string | FREE |
| `ANTHROPIC_API_KEY` | console.anthropic.com | ~KES 300/month |
| `MPESA_CONSUMER_KEY/SECRET` | developer.safaricom.co.ke | FREE (1% per txn) |
| `RESEND_API_KEY` | resend.com | FREE (3K emails/month) |
| `CLOUDINARY_*` | cloudinary.com | FREE (25GB) |

---

## 🌍 DEPLOY ONLINE

### Backend → Render.com (FREE)
1. Push `backend/` folder to GitHub
2. Go to render.com → New Web Service → Connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables in Render dashboard
6. Your API: `https://agroconnect-api.onrender.com`

### Frontend → Vercel (FREE)
1. Push `frontend/` folder to GitHub
2. Go to vercel.com → New Project → Connect repo
3. Set `VITE_API_URL=https://agroconnect-api.onrender.com/api`
4. Deploy → Your app: `https://agroconnect.vercel.app`

### M-Pesa Callback URL
After deploying backend, set:
```
MPESA_CALLBACK_URL=https://agroconnect-api.onrender.com/api/mpesa/callback
```
This is the URL Safaricom calls when payment completes.

---

## 🏛️ HIERARCHY RULES (enforced in backend middleware)

| Role | Can See | Can Delete |
|------|---------|-----------|
| **Admin** (Caleb) | Everything | Everyone |
| **Extension Officer** | Own sub-county only | Farmers/Buyers/Agrovets in own sub-county |
| **Farmer / Buyer / Agrovet** | Own ward only | Nobody |

---
*AgroConnect © 2025 — Murang'a County, Kenya*
