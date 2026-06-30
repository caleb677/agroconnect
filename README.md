# 🌽 AgroConnect — Murang'a County Agricultural Platform

Full-stack platform: React frontend + Node.js backend + PostgreSQL (Supabase).

## 📁 Structure
```
AgroConnect_FRESH/
├── frontend/    React app (Vite 5 + React 18) — deploy on Vercel
└── backend/     Node.js API (Express) — deploy on Render
```

## 🚀 Run Locally

### Backend
```bash
cd backend
cp .env.example .env    # fill in DATABASE_URL from Supabase
npm install
node config/migrate.js
node config/seed-admin.js
npm run dev              # http://localhost:4000
```

### Frontend
```bash
cd frontend
cp .env.example .env     # set VITE_API_URL=http://localhost:4000/api
npm install
npm run dev               # http://localhost:5173
```

## 🌍 Deploy Online

### Backend → Render.com
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Add all `.env` variables

### Frontend → Vercel.com
- Root Directory: `frontend`
- Framework: Vite
- Environment Variable: `VITE_API_URL` = your Render URL + `/api`

## 🔑 Admin Login
- Email: calebmwasi22@gmail.com
- Password: CalebAdmin@2025!

## ⚠️ IMPORTANT — File naming rule
**Every file in this project uses lowercase filenames.** This avoids
Windows/Linux case-sensitivity bugs when deploying to Vercel (Linux).
Never rename files to start with a capital letter.
