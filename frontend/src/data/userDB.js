// ─── SEED ACCOUNTS (pre-loaded into storage on first run) ──────────────────────
export const SEED_ACCOUNTS = [
  { role:"Admin", email:"calebmwasi22@gmail.com", password:"CalebAdmin@2025!", name:"Caleb Mwasi (Super Admin)" },
];

// ─── STORAGE-BACKED USER DB ────────────────────────────────────────────────────
// Strategy: store ALL users in ONE key ("users:all") as { email: accountObj }.
// Single read/write per operation — no sequential loops, no index sync delays.
// In-memory cache (_cache) means repeat calls (exists + create) hit RAM, not storage.
export const UserDB = {
  _profileCache: null,  // { email → profileObj } — in-memory after first load
  _seedPromise:  null,

  // ── Internal: load/save the shared profiles map ────────────────────────────
  async _loadProfiles() {
    if (this._profileCache !== null) return this._profileCache;
    try {
      const r = await window.storage.get("users:all", true);
      this._profileCache = r ? JSON.parse(r.value) : {};
    } catch { this._profileCache = {}; }
    return this._profileCache;
  },
  async _saveProfiles() {
    await window.storage.set("users:all", JSON.stringify(this._profileCache), true);
  },
  async _load() { return this._loadProfiles(); },
  get _cache() { return this._profileCache; },

  // ── Seed demo accounts on first launch ────────────────────────────────────
  async seed() {
    if (this._seedPromise) return this._seedPromise;
    this._seedPromise = (async () => {
      const map = await this._loadProfiles();
      if (Object.keys(map).length > 0) return; // already seeded
      SEED_ACCOUNTS.forEach(a => {
        map[a.email] = {
          ...a,
          joinedAt: "01 Jan 2026",
          certStatus: "approved",
          dashboardUnlocked: true,
          docsMeta: {},
        };
      });
      await this._saveProfiles();
    })();
    return this._seedPromise;
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  async find(email, password) {
    const map = await this._loadProfiles();
    const acct = map[email];
    if (!acct || acct.password !== password) return null;
    // Return full profile (without password) for session
    const { password: _, ...safe } = acct;
    return { ...safe, password }; // keep password so session has it for password-reset checks
  },

  exists(email) {
    if (this._profileCache === null) return false;
    return Object.prototype.hasOwnProperty.call(this._profileCache, email);
  },

  // ── Create new account — saved immediately to shared storage ──────────────
  async create(acct) {
    const map = await this._loadProfiles();
    map[acct.email] = {
      ...acct,
      joinedAt: new Date().toLocaleDateString("en-KE",{ day:"numeric", month:"long", year:"numeric" }),
      certStatus: (acct.role === "Admin" || acct.role === "Extension Officer") ? "approved" : "none",
      dashboardUnlocked: (acct.role === "Admin" || acct.role === "Extension Officer" || acct.role === "Buyer"),
      docsMeta: {},
    };
    await this._saveProfiles(); // awaited — account must be persisted before UI proceeds
    return map[acct.email];
  },

  // ── Update any fields on an existing profile ───────────────────────────────
  async updateProfile(email, patch) {
    const map = await this._loadProfiles();
    if (!map[email]) return false;
    map[email] = { ...map[email], ...patch };
    await this._saveProfiles();
    return map[email];
  },

  async updatePassword(email, newPassword) {
    return this.updateProfile(email, { password: newPassword });
  },

  // ── List every account (Admin use) ────────────────────────────────────────
  async listAll() {
    const map = await this._loadProfiles();
    return Object.values(map).map(u => ({ ...u, password:"••••••••" }));
  },

  // ── Documents: store each file as base64 blob in private storage ──────────
  // doc keys: "nationalId" | "farmPhoto" | "trainingCert" | "soilReport" | "profilePhoto"
  async saveDoc(email, key, base64Data) {
    try {
      await window.storage.set(`doc:${email}:${key}`, base64Data, false);
      const sizeKB = Math.round(base64Data.length * 0.75 / 1024);
      await this.updateProfile(email, {
        docsMeta: {
          ...(this._profileCache?.[email]?.docsMeta || {}),
          [key]: { uploaded:true, savedAt: new Date().toISOString(), sizeKB },
        }
      });
      return true;
    } catch(e) { console.error("saveDoc:", e); return false; }
  },

  async loadDoc(email, key) {
    try {
      const r = await window.storage.get(`doc:${email}:${key}`, false);
      return r ? r.value : null;
    } catch { return null; }
  },

  // Convenience: load all docs for a user (for Admin viewer)
  async loadAllDocs(email) {
    const keys = ["nationalId","farmPhoto","trainingCert","soilReport","profilePhoto"];
    const out = {};
    await Promise.all(keys.map(async k => { out[k] = await this.loadDoc(email, k); }));
    return out;
  },

  // ── Certification ─────────────────────────────────────────────────────────
  async saveCert(email, certData) {
    try {
      await window.storage.set(`cert:${email}`, JSON.stringify({ ...certData, updatedAt: new Date().toISOString() }), false);
      if (certData.status === "approved") {
        await this.updateProfile(email, { certStatus:"approved", dashboardUnlocked:true });
      } else if (certData.status === "pending") {
        await this.updateProfile(email, { certStatus:"pending" });
      }
      return true;
    } catch { return false; }
  },

  async loadCert(email) {
    try {
      const r = await window.storage.get(`cert:${email}`, false);
      return r ? JSON.parse(r.value) : null;
    } catch { return null; }
  },

  // ── Full profile with cert merged ─────────────────────────────────────────
  async getProfile(email) {
    const map = await this._loadProfiles();
    const profile = map[email];
    if (!profile) return null;
    const cert = await this.loadCert(email);
    return { ...profile, cert };
  },
};

// Murang'a County sub-counties
const MURANGA_SUBCOUNTIES = [
  "Kandara","Gatanga","Kigumo","Kiharu","Mathioya","Kahuro","Murang'a South",
];

const SUBCOUNTY_FIELD = { key:"county", label:"Sub-County (Murang'a)", type:"select", options: MURANGA_SUBCOUNTIES };
