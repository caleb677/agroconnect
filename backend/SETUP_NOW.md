# ✅ AgroConnect Backend — Fix Database Connection (5 Minutes)

## THE PROBLEM
Your `.env` file still has the placeholder DATABASE_URL.
The backend is trying to connect to a local PostgreSQL that doesn't exist.

---

## STEP 1 — Create Free Supabase Database (3 minutes)

1. Open: https://supabase.com
2. Click **"Start your project"** → Sign up with Google or email
3. Click **"New Project"**
4. Fill in:
   - **Name:** agroconnect
   - **Database Password:** (create a strong one — SAVE IT)
   - **Region:** choose closest → "East Africa (Mumbai)" or "Europe West"
5. Click **"Create new project"** — wait ~2 minutes

6. Once ready, click **"Project Settings"** (gear icon, left sidebar)
7. Click **"Database"**
8. Scroll down to **"Connection string"** → select **"URI"** tab
9. Copy the string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefgh.supabase.co:5432/postgres
   ```

---

## STEP 2 — Update Your .env File

Open `AgroConnect_FULL/backend/.env` in Notepad or VS Code.

Replace this line:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

With YOUR actual connection string from Step 1:
```
DATABASE_URL=postgresql://postgres:YourActualPassword@db.abcdefgh.supabase.co:5432/postgres
```

Also set a JWT secret (just type any random long string):
```
JWT_SECRET=agroconnect-muranga-2025-super-secret-key-caleb-mwasi
```

---

## STEP 3 — Run Migration (creates all tables)

In your terminal (inside the backend folder):
```bash
node config/migrate.js
```

You should see:
```
🔧 Running migrations...
✅ All tables created successfully.
```

---

## STEP 4 — Create Your Admin Account

```bash
node config/seed-admin.js
```

This creates your super admin account:
- Email: calebmwasi22@gmail.com
- Password: CalebAdmin@2025!

---

## STEP 5 — Start the backend

```bash
npm run dev
```

You should see:
```
✅ AgroConnect backend running on port 4000
```

Test it: Open http://localhost:4000/health in your browser
You should see: {"status":"ok","platform":"AgroConnect Murang'a"}

---

## STEP 6 — Connect Frontend to Backend

Open `AgroConnect_FULL/frontend/.env`
Make sure it says:
```
VITE_API_URL=http://localhost:4000/api
```

Then in a SECOND terminal:
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 — login with calebmwasi22@gmail.com / CalebAdmin@2025!

