# 🚀 AgroConnect — How To Make It 100% Real

## ✅ WHAT IS ALREADY WORKING (No extra cost)

| Feature | Status |
|---------|--------|
| Full React app, all pages | ✅ Done |
| Hierarchy: Sub-County → Ward → Location | ✅ Done |
| Extension Officer controls own sub-county | ✅ Done |
| Admin controls everything | ✅ Done |
| PWA (installable on phone) | ✅ Done |
| Offline support | ✅ Done |
| PDF reports | ✅ Done |
| Delivery tracking | ✅ Done |
| English/Kiswahili toggle | ✅ Done |
| AI crop advisor (offline fallback) | ✅ Done |

---

## 🔑 WHAT YOU NEED (Step by Step)

---

### STEP 1 — Deploy Online FREE (Vercel)

**Cost: FREE forever for this app**

1. Go to https://vercel.com → Sign up with GitHub
2. Create account at https://github.com → Upload your project
3. In Vercel, click "New Project" → import your GitHub repo
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Click Deploy → **Your app is live in 2 minutes**

Your URL will be: `https://agroconnect-muranga.vercel.app`

To use a custom domain like `agroconnect.co.ke`:
- Buy domain at https://www.kenic.or.ke (~KES 1,200/year)
- Point it to Vercel in their DNS settings

---

### STEP 2 — Real Database (Supabase — FREE tier)

**Cost: FREE up to 500MB**

Right now data is in the browser. For real persistent accounts:

1. Go to https://supabase.com → Create free account
2. Create new project called "agroconnect"
3. Copy your **Project URL** and **Anon Key**
4. Add to your `.env` file:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```
5. Run: `npm install @supabase/supabase-js`

Tables to create in Supabase (run in their SQL editor):
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text, email text UNIQUE, phone text,
  role text, subcounty text, ward text, location text,
  status text DEFAULT 'active',
  password_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text, price numeric, qty numeric, unit text,
  category text, farmer_id uuid REFERENCES users(id),
  subcounty text, ward text, location text,
  media_url text, media_type text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid, buyer_id uuid, farmer_id uuid,
  qty numeric, amount numeric, status text,
  mpesa_code text, created_at timestamptz DEFAULT now()
);

-- Row-Level Security: Extension Officer only sees own sub-county
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "extension_own_subcounty" ON users
  FOR ALL USING (
    auth.jwt()->>'role' = 'Admin' OR
    subcounty = (SELECT subcounty FROM users WHERE id = auth.uid())
  );
```

---

### STEP 3 — Real AI (Anthropic Claude API)

**Cost: ~KES 10–50 per month for moderate use**

1. Go to https://console.anthropic.com
2. Create account → Go to API Keys
3. Create new key → Copy it
4. Add to `.env`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```
5. The AI chat in the app will immediately start working fully

---

### STEP 4 — Real M-Pesa (Safaricom Daraja API)

**Cost: FREE to register. Safaricom takes 1% per transaction**

1. Go to https://developer.safaricom.co.ke
2. Register for a developer account
3. Create an app → Get **Consumer Key** and **Consumer Secret**
4. Apply for **Go Live** (requires business registration)

**For Go Live you need:**
- Business Registration Certificate (from eCitizen: ~KES 950)
- KRA PIN Certificate
- Bank account in business name
- Letter from Safaricom confirming paybill/till number

5. Add to `.env`:
```
VITE_MPESA_CONSUMER_KEY=your-key
VITE_MPESA_CONSUMER_SECRET=your-secret
VITE_MPESA_SHORTCODE=your-paybill
VITE_MPESA_PASSKEY=your-passkey
VITE_MPESA_CALLBACK_URL=https://agroconnect.co.ke/api/mpesa-callback
```

**Important:** M-Pesa STK Push requires a **backend server** to handle callbacks.
Use a free Render.com server (Node.js) or Supabase Edge Functions.

---

### STEP 5 — Email Notifications (Resend — FREE tier)

**Cost: FREE up to 3,000 emails/month**

1. Go to https://resend.com → Create account
2. Add your domain (or use their sandbox for testing)
3. Get API key
4. Add to `.env`:
```
VITE_RESEND_API_KEY=re_...
```

Emails sent automatically for:
- New user registration → Welcome email
- New order placed → Notification to seller
- Disease alert posted → Email to all farmers in ward
- Admin: Daily summary of activity

---

### STEP 6 — File/Image/Video Storage (Cloudinary — FREE)

**Cost: FREE up to 25GB**

For uploading farm photos and tutorial videos:

1. Go to https://cloudinary.com → Create free account
2. Get your **Cloud Name**, **API Key**, **API Secret**
3. Add to `.env`:
```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=agroconnect
```

---

## 💰 TOTAL MONTHLY COST SUMMARY

| Service | Cost |
|---------|------|
| Vercel hosting | FREE |
| Supabase database | FREE (up to 500MB) |
| Claude AI (light use) | ~KES 200–500/month |
| Resend email | FREE (up to 3K emails) |
| Cloudinary storage | FREE (up to 25GB) |
| Domain (agroconnect.co.ke) | ~KES 100/month |
| M-Pesa | 1% per transaction only |
| **TOTAL** | **~KES 300–600/month** |

---

## 🏛️ HIERARCHY ENFORCEMENT (Already in the app)

```
Admin (Caleb Mwasi — Platform Owner)
  └── Can: View ALL, Edit ALL, Delete ALL, Analytics ALL, Notifications ALL

Extension Officer (e.g. Dr. Sam — Kandara)
  └── Can: View Kandara users only
  └── Can: Delete Farmers/Buyers/Agrovets in Kandara only
  └── Cannot: See Kiharu, Kigumo, or any other sub-county
  └── Cannot: Delete other Extension Officers or Admin

Farmer / Buyer / Agrovet
  └── See only their own ward's marketplace
  └── Cannot see other users
  └── Cannot delete anyone
```

---

## 📱 BUSINESS REGISTRATION (For M-Pesa + Legitimacy)

To register the business legally in Kenya:

1. **eCitizen** (https://www.ecitizen.go.ke)
   - Register as Sole Proprietor: KES 950
   - Or Limited Company: KES 10,765

2. **KRA PIN** for the business (free at KRA iTax)

3. **M-Pesa Paybill**: Apply via Safaricom business portal
   - Paybill application: ~KES 1,000/month
   - OR Till Number: KES 0/month (but limits apply)

---

## 🛡️ ADMIN CREDENTIALS (Your account)

```
Name:     Caleb Mwasi Musyoka
Email:    calebmwasi22@gmail.com
Role:     Admin (Super Admin)
Access:   Full platform control
```

Change your password after first login at: Settings → Account

---
*Generated by AgroConnect Platform Builder · June 2025*
