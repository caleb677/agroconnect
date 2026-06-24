# 🌽 AgroConnect — Murang'a County Agricultural Platform

A complete agricultural platform for Murang'a County, Kenya — built with React + Vite.

## 🚀 Quick Start

```bash
# 1. Install dependencies (once)
npm install

# 2. Start development server
npm run dev
```

Then open: **http://localhost:5173**

## 🔑 Demo Login Accounts

| Role | Email | Password |
|------|-------|----------|
| 👑 Super Admin | admin@agroconnect.co.ke | Admin@2025 |
| 🌾 Farmer | john@farmer.co.ke | password |
| 🏪 Buyer | buyer@example.co.ke | password |
| 💊 Agrovet | agrovet@example.co.ke | password |
| 👨‍🏫 Extension Officer | ext1@agroconnect.co.ke | password |

## 🤖 AI Advisor (Claude API)

Create a `.env` file to enable live AI:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```
Without a key, the AI still works with **smart offline farming responses**.

## 📦 Features

| Feature | Status |
|---------|--------|
| 💳 M-Pesa STK Push (demo) | ✅ |
| 📹 Video/Image Uploads | ✅ |
| 🗺️ OpenStreetMap + Google Maps link | ✅ |
| 📧 Email notifications (UI) | ✅ |
| 📊 Analytics Dashboard with charts | ✅ |
| 🌦️ Live weather by ward (AI-powered) | ✅ |
| 🔔 Browser push notifications | ✅ |
| 💳 Payment history (localStorage) | ✅ |
| 📄 PDF Reports (print-to-PDF) | ✅ |
| 🤖 AI Crop Advisor + offline fallback | ✅ |
| 🔍 Advanced search & filters | ✅ |
| ⭐ Ratings & Reviews | ✅ |
| 🚚 Delivery Tracking | ✅ |
| 🌐 English / Kiswahili toggle | ✅ |
| 📲 Installable PWA + offline support | ✅ |

## 🏛️ Administrative Hierarchy

```
Super Admin
└── County Agricultural Officer (Murang'a)
    └── Sub-County Officers (Kandara, Kiharu, Maragua, Kangema, Mathioya, Gatanga, Kigumo)
        └── Ward Officers
            └── Extension Officers
                └── Farmers / Buyers / Agrovet Owners
```

## 🏗️ Build for Production

```bash
npm run build
# Output in /dist folder — host on Netlify, Vercel, or any static host
```

---
*AgroConnect © 2025 — Murang'a County, Kenya*
