import { useState, useEffect } from "react";
import { C, inp, sel } from "../utils/constants.js";
import { api } from "../utils/api.js";
import { SEED_ACCOUNTS } from "../data/userDB.js";
import { ROLE_CONFIG } from "../data/roleConfig.js";
import FlashResult from "../components/common/flashresult.jsx";
import { getWards, getLocations } from "../data/hierarchy.js";

// ─── Shared styles ─────────────────────────────────────────────────────────────
const FONT = "'Segoe UI', system-ui, -apple-system, sans-serif";
const GREEN = "#0F6E56";
const GREEN2 = "#1D9E75";

// Left panel: maize photo hero with overlay
function HeroPanel({ title, subtitle, extra, onBack, backLabel }) {
  return (
    <div style={{
      width: 420, flexShrink: 0, position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* Background image */}
      <img
        src="/maize.png"
        alt="Murang'a maize farm"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
      />
      {/* Dark gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(10,60,40,0.82) 0%, rgba(15,110,86,0.75) 60%, rgba(8,40,28,0.92) 100%)" }} />
      {/* Content over overlay */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", padding: "2.5rem 2.2rem" }}>
        {onBack && (
          <button onClick={onBack} style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, marginBottom: "auto" }}>
            ← {backLabel || "Back"}
          </button>
        )}
        <div style={{ marginTop: onBack ? "2rem" : "auto" }}>
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", border: "2.5px solid rgba(255,255,255,0.4)", flexShrink: 0 }}>
              <img src="/maize.png" alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: 0.3 }}>AgroConnect</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Murang'a County, Kenya</div>
            </div>
          </div>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.2 }}>{title}</h2>
          {subtitle && <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>{subtitle}</p>}
          {extra}
        </div>
        {/* Feature badges */}
        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["🏅 Certified Farmers", "🤖 AI Advisory", "📈 Live Prices", "🗺️ Farm Mapping", "🌦️ Weather"].map(tag => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                {tag}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 14, color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
            © 2025 AgroConnect Kenya · Murang'a County
          </div>
        </div>
      </div>
    </div>
  );
}

function inputStyle(focus) {
  return {
    width: "100%", padding: "12px 14px", border: `1.5px solid ${focus ? GREEN2 : "#ddd"}`,
    borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box",
    fontFamily: FONT, background: "#fafaf9", color: "#1a1a1a", transition: "border-color 0.15s",
  };
}

function Label({ children }) {
  return <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5, fontWeight: 600 }}>{children}</label>;
}

function GreenBtn({ label, onClick, disabled, loading: ld, style: extra = {} }) {
  return (
    <button onClick={onClick} disabled={disabled || ld} style={{
      width: "100%", padding: "13px", background: disabled || ld ? "#bbb" : GREEN2,
      color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
      cursor: disabled || ld ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
      justifyContent: "center", gap: 8, fontFamily: FONT, transition: "background 0.15s", ...extra,
    }}>
      {ld && <div style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.4)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
      {label}
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </button>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 9, fontSize: 13, marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>❌ {msg}</div>;
}

// ─── MAIN AUTH COMPONENT ──────────────────────────────────────────────────────
export default function AuthScreen({ onLogin }) {
  const [screen,        setScreen]        = useState("landing");
  const [selectedRole,  setSelectedRole]  = useState(null);
  const [loginData,     setLoginData]     = useState({ email: "", password: "" });
  const [showPw,        setShowPw]        = useState(false);
  const [signupData,    setSignupData]    = useState({});
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [flash,         setFlash]         = useState(null);
  const [dbReady,       setDbReady]       = useState(false);
  const [focusField,    setFocusField]    = useState("");

  const [enteredCode,   setEnteredCode]   = useState("");
  const [codeError,     setCodeError]     = useState("");
  const [codeVerified,  setCodeVerified]  = useState(false);

  const [syncQueue, setSyncQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem("agro_sync_queue") || "[]"); } catch { return []; }
  });

  const flushSyncQueue = async () => {
    if (!navigator.onLine || syncQueue.length === 0) return;
    const remaining = [];
    for (const acct of syncQueue) {
      try { await api.register(acct); } catch { remaining.push(acct); }
    }
    setSyncQueue(remaining);
    try { localStorage.setItem("agro_sync_queue", JSON.stringify(remaining)); } catch {}
  };

  const [resetEmail,      setResetEmail]      = useState("");
  const [resetStep,       setResetStep]       = useState(1);
  const [resetPhone,      setResetPhone]      = useState("");
  const [resetFoundAcct,  setResetFoundAcct]  = useState(null);
  const [resetNewPw,      setResetNewPw]      = useState("");
  const [resetConfirmPw,  setResetConfirmPw]  = useState("");

  const roles = Object.keys(ROLE_CONFIG);

  useEffect(() => {
    setDbReady(true);
    flushSyncQueue();
    window.addEventListener("online", flushSyncQueue);
    return () => window.removeEventListener("online", flushSyncQueue);
  }, []);

  const ACCESS_CODES  = { Admin: "AGRO-ADMIN-2026", "Extension Officer": "EXT-AGRO-2026" };
  const isPrivileged  = selectedRole === "Admin" || selectedRole === "Extension Officer";

  const goToSignup = (role) => {
    setSelectedRole(role);
    setSignupData({});
    setError("");
    setEnteredCode("");
    setCodeError("");
    setCodeVerified(false);
    setScreen(role === "Admin" || role === "Extension Officer" ? "code-gate" : "signup");
  };

  // ── Login ──────────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    try {
      const { token, user } = await api.login(loginData.email.trim(), loginData.password);
      api.setToken(token);
      setFlash({ type: "success", title: "Welcome back, " + user.name + "!", sub: "Signing you in…", cb: () => onLogin(user) });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  // ── Code gate ─────────────────────────────────────────────────────────────────
  const handleVerifyCode = () => {
    const correct = ACCESS_CODES[selectedRole];
    if (enteredCode.trim() !== correct) { setCodeError("Incorrect access code. Please contact your administrator."); return; }
    setCodeVerified(true);
    setCodeError("");
    setScreen("signup");
  };

  // ── Signup ────────────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    const cfg    = ROLE_CONFIG[selectedRole];
    const fields = cfg.fields.filter(f => f.key !== "adminCode" && f.key !== "inviteCode");
    const required = fields.filter(f => !f.label.toLowerCase().includes("optional"));
    for (const f of required) {
      if (!signupData[f.key]?.trim()) { setError("Please fill in: " + f.label); return; }
    }
    if (signupData.password && signupData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const acct = { ...signupData, role: selectedRole };
      if (!navigator.onLine) {
        const q = [...syncQueue, acct];
        setSyncQueue(q);
        localStorage.setItem("agro_sync_queue", JSON.stringify(q));
        setFlash({ type: "success", title: "Account saved locally!", sub: "Welcome, " + acct.name + "! Will sync when connected.", cb: () => onLogin(acct) });
        return;
      }
      const { token, user } = await api.register(acct);
      api.setToken(token);
      setFlash({ type: "success", title: "Account created!", sub: "Welcome to AgroConnect, " + user.name + "!", cb: () => onLogin(user) });
    } catch (e) {
      setError(e.message || "Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  // ── Forgot password ───────────────────────────────────────────────────────────
  const handleResetLookup = async () => {
    if (!resetEmail) { setError("Please enter your email address."); return; }
    setLoading(true); setError("");
    try {
      // We don't have a "find by email" endpoint, so we ask for phone directly
      // and verify everything together in handleSetNewPassword.
      setResetFoundAcct({ email: resetEmail.trim() });
      setResetStep(2);
    } catch { setError("Error looking up account. Try again."); }
    finally { setLoading(false); }
  };
  const handleVerifyPhone = () => {
    if (!resetPhone) { setError("Please enter your phone number."); return; }
    setError(""); setResetStep(3);
  };
  const handleSetNewPassword = async () => {
    if (resetNewPw.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (resetNewPw !== resetConfirmPw) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      await api.forgotPassword({ email: resetFoundAcct.email, phone: resetPhone, newPassword: resetNewPw });
      setFlash({ type: "success", title: "Password reset!", sub: "You can now sign in with your new password.", cb: () => { setScreen("login"); setError(""); } });
    } catch (err) {
      setError(err.message || "Error updating password. Try again.");
    } finally { setLoading(false); }
  };

  // ─── LANDING ───────────────────────────────────────────────────────────────────
  if (screen === "landing") return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT }}>
      {flash && <FlashResult type={flash.type} title={flash.title} sub={flash.sub} onDone={() => { flash.cb?.(); setFlash(null); }} />}

      {/* LEFT — maize photo hero */}
      <HeroPanel
        title={"Kenya's #1\nAgricultural\nPlatform"}
        subtitle="Connecting Murang'a County farmers, buyers and agribusiness in one powerful platform."
        extra={
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "✅", text: "Sell certified farm produce directly" },
              { icon: "📊", text: "Real-time market prices by ward" },
              { icon: "🤖", text: "AI crop advisor — 24/7 farming help" },
              { icon: "💳", text: "M-Pesa payments built in" },
            ].map(item => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{item.text}</span>
              </div>
            ))}
          </div>
        }
      />

      {/* RIGHT — join panel */}
      <div style={{ flex: 1, background: "#f8f8f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontWeight: 800, fontSize: 26, color: GREEN, marginBottom: 4 }}>Join AgroConnect</div>
            <div style={{ color: "#888", fontSize: 14 }}>Choose your role to get started</div>
          </div>

          {/* Public roles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {roles.filter(r => r !== "Admin" && r !== "Extension Officer").map(r => {
              const cfg = ROLE_CONFIG[r];
              return (
                <button key={r} onClick={() => goToSignup(r)} style={{
                  background: "#fff", border: "2px solid #eee", borderRadius: 14,
                  padding: "1.2rem 0.8rem", cursor: "pointer", textAlign: "center",
                  transition: "all 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                  onMouseOver={e => { e.currentTarget.style.border = "2px solid " + GREEN2; e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,110,86,0.12)"; }}
                  onMouseOut={e => { e.currentTarget.style.border = "2px solid #eee"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{cfg.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 4 }}>{r}</div>
                  <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{cfg.tagline}</div>
                </button>
              );
            })}
          </div>

          {/* Privileged roles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
            {["Admin", "Extension Officer"].map(r => {
              const cfg = ROLE_CONFIG[r];
              return (
                <button key={r} onClick={() => goToSignup(r)} style={{
                  background: "#1a1a1a", border: "none", borderRadius: 12,
                  padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                  transition: "background 0.15s",
                }}
                  onMouseOver={e => { e.currentTarget.style.background = "#333"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "#1a1a1a"; }}
                >
                  <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{r}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>🔐 Access code required</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#eee" }} />
            <span style={{ color: "#bbb", fontSize: 12, fontWeight: 600 }}>ALREADY HAVE AN ACCOUNT?</span>
            <div style={{ flex: 1, height: 1, background: "#eee" }} />
          </div>

          <button
            onClick={() => { setScreen("login"); setError(""); }}
            style={{
              width: "100%", padding: "14px", background: "#fff", color: GREEN,
              border: "2px solid " + GREEN, borderRadius: 10, fontWeight: 700,
              fontSize: 15, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.15s",
            }}
            onMouseOver={e => { e.currentTarget.style.background = GREEN; e.currentTarget.style.color = "#fff"; }}
            onMouseOut={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = GREEN; }}
          >
            Sign In to Existing Account →
          </button>
        </div>
      </div>
    </div>
  );

  // ─── CODE GATE ────────────────────────────────────────────────────────────────
  if (screen === "code-gate" && selectedRole) {
    const cfg = ROLE_CONFIG[selectedRole];
    const hints = {
      "Admin": "The Admin access code is provided by the platform owner (Super Admin). It is shared only with authorised administrators.",
      "Extension Officer": "Your access code is issued by your county Admin when setting up your Extension Officer profile.",
    };
    return (
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT }}>
        {flash && <FlashResult type={flash.type} title={flash.title} sub={flash.sub} onDone={() => { flash.cb?.(); setFlash(null); }} />}
        <HeroPanel
          title={"Restricted\nAccess"}
          subtitle={selectedRole + " accounts require a valid access code before registration."}
          onBack={() => setScreen("landing")}
          backLabel="Back to roles"
        />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f6", padding: "2rem" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>{cfg.icon}</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", margin: "0 0 6px" }}>Join as {selectedRole}</h2>
              <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Verify your access code to continue</p>
            </div>

            <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: "#1E40AF", fontSize: 13, marginBottom: 4 }}>ℹ️ Where to get your code</div>
              <div style={{ color: "#1E3A8A", fontSize: 12, lineHeight: 1.6 }}>{hints[selectedRole]}</div>
            </div>

            <Label>Enter Access Code</Label>
            <div style={{ position: "relative", marginBottom: codeError ? 8 : 20 }}>
              <input
                type="text"
                value={enteredCode}
                onChange={e => { setEnteredCode(e.target.value.toUpperCase()); setCodeError(""); }}
                onKeyDown={e => e.key === "Enter" && handleVerifyCode()}
                placeholder="e.g. AGRO-XXXX-XXXX"
                autoFocus
                style={{ ...inputStyle(focusField === "code"), fontSize: 17, fontWeight: 700, fontFamily: "monospace", letterSpacing: 3, textAlign: "center", padding: "14px", border: "2px solid " + (codeError ? "#E24B4A" : enteredCode.length > 5 ? GREEN2 : "#ddd"), borderRadius: 10 }}
                onFocus={() => setFocusField("code")}
                onBlur={() => setFocusField("")}
              />
            </div>
            {codeError && <div style={{ color: "#E24B4A", fontSize: 12, marginBottom: 16, background: "#FEE2E2", padding: "8px 12px", borderRadius: 8 }}>❌ {codeError}</div>}

            <GreenBtn label="Verify Code & Continue →" onClick={handleVerifyCode} disabled={enteredCode.length < 4} />
            <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#888" }}>
              Already registered?{" "}
              <button onClick={() => setScreen("login")} style={{ background: "none", border: "none", color: GREEN2, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Sign in</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SIGNUP ───────────────────────────────────────────────────────────────────
  if (screen === "signup" && selectedRole) {
    const cfg    = ROLE_CONFIG[selectedRole];
    const fields = cfg.fields.filter(f => f.key !== "adminCode" && f.key !== "inviteCode");
    return (
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT }}>
        {flash && <FlashResult type={flash.type} title={flash.title} sub={flash.sub} onDone={() => { flash.cb?.(); setFlash(null); }} />}
        <HeroPanel
          title={"Create Your\nAccount"}
          subtitle={"Setting up your " + selectedRole + " account on AgroConnect Murang'a."}
          onBack={() => setScreen(isPrivileged ? "code-gate" : "landing")}
          backLabel="Back"
          extra={isPrivileged && (
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>Access code verified — you're cleared to register.</div>
            </div>
          )}
        />
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", background: "#f8f8f6", padding: "2.5rem 2rem", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 500 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 30 }}>{cfg.icon}</span>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", margin: 0 }}>Create {selectedRole} Account</h3>
                <div style={{ color: "#888", fontSize: 13 }}>All fields marked * are required</div>
              </div>
            </div>

            {!navigator.onLine && (
              <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#92400E" }}>
                📶 You're offline — account will sync when connected.
              </div>
            )}

            <ErrBox msg={error} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {fields.map(f => (
                <div key={f.key} style={{ gridColumn: ["email", "password", "license", "kraPin", "county", "produce"].includes(f.key) ? "span 2" : "span 1" }}>
                  <Label>{f.label} {f.label.toLowerCase().includes("optional") ? "" : "*"}</Label>
                  {f.type === "select" ? (
                    <select
                      value={signupData[f.key] || ""}
                      onChange={e => { setSignupData({ ...signupData, [f.key]: e.target.value }); setError(""); }}
                      style={{ ...inputStyle(focusField === f.key), background: "#fff" }}
                      onFocus={() => setFocusField(f.key)}
                      onBlur={() => setFocusField("")}
                    >
                      <option value="">Select…</option>
                      {(f.dynamic === "ward"
                          ? getWards(signupData.subcounty || "")
                          : f.dynamic === "location"
                          ? getLocations(signupData.subcounty || "", signupData.ward || "")
                          : (f.options || [])
                      ).map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      value={signupData[f.key] || ""}
                      onChange={e => { setSignupData({ ...signupData, [f.key]: e.target.value }); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleSignup()}
                      placeholder={f.placeholder}
                      style={inputStyle(focusField === f.key)}
                      onFocus={() => setFocusField(f.key)}
                      onBlur={() => setFocusField("")}
                    />
                  )}
                </div>
              ))}
            </div>

            <GreenBtn
              label={"Create " + selectedRole + " Account →"}
              onClick={handleSignup}
              loading={loading}
              style={{ marginTop: 24 }}
            />
            <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#888" }}>
              Already registered?{" "}
              <button onClick={() => setScreen("login")} style={{ background: "none", border: "none", color: GREEN2, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Sign in</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────────
  if (screen === "login") return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT }}>
      {flash && <FlashResult type={flash.type} title={flash.title} sub={flash.sub} onDone={() => { flash.cb?.(); setFlash(null); }} />}
      <HeroPanel
        title={"Welcome\nBack"}
        subtitle="Sign in to your AgroConnect account to access your farm dashboard, market prices and more."
        onBack={() => setScreen("landing")}
        backLabel="Back to home"
      />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f6", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>Sign In</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>Enter your email and password to continue</p>

          <ErrBox msg={error} />

          <div style={{ marginBottom: 14 }}>
            <Label>Email Address</Label>
            <input
              type="email"
              value={loginData.email}
              onChange={e => { setLoginData({ ...loginData, email: e.target.value }); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="your@email.com"
              autoFocus
              style={inputStyle(focusField === "email")}
              onFocus={() => setFocusField("email")}
              onBlur={() => setFocusField("")}
            />
          </div>

          <div style={{ marginBottom: 6 }}>
            <Label>Password</Label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={loginData.password}
                onChange={e => { setLoginData({ ...loginData, password: e.target.value }); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Enter your password"
                style={inputStyle(focusField === "pw")}
                onFocus={() => setFocusField("pw")}
                onBlur={() => setFocusField("")}
              />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 14 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <button onClick={() => { setScreen("forgot"); setResetStep(1); setResetEmail(""); setError(""); }} style={{ background: "none", border: "none", color: GREEN2, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Forgot password?</button>
          </div>

          <GreenBtn label={loading ? "Signing in…" : "Sign In →"} onClick={handleLogin} loading={loading} disabled={!dbReady} />

          {/* Demo accounts */}
          <details style={{ marginTop: 20 }}>
            <summary style={{ fontSize: 12, color: "#888", cursor: "pointer", fontWeight: 600, userSelect: "none", marginBottom: 4 }}>🔑 Demo accounts (click to expand)</summary>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
              {SEED_ACCOUNTS.map(a => (
                <button key={a.email} onClick={() => setLoginData({ email: a.email, password: a.password })}
                  style={{ padding: "8px 12px", background: "#fff", border: "1.5px solid #eee", borderRadius: 9, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, transition: "border-color 0.1s" }}
                  onMouseOver={e => e.currentTarget.style.borderColor = GREEN2}
                  onMouseOut={e => e.currentTarget.style.borderColor = "#eee"}
                >
                  <span style={{ color: "#333" }}>{ROLE_CONFIG[a.role]?.icon} {a.name}</span>
                  <span style={{ color: "#aaa", fontSize: 11 }}>{a.role}</span>
                </button>
              ))}
            </div>
          </details>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" }}>
            No account?{" "}
            <button onClick={() => setScreen("landing")} style={{ background: "none", border: "none", color: GREEN2, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Register here →</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
  if (screen === "forgot") {
    const stepTitles = ["Find account", "Verify identity", "New password"];
    const stepIcons  = ["🔍", "📱", "🔑"];
    return (
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT }}>
        {flash && <FlashResult type={flash.type} title={flash.title} sub={flash.sub} onDone={() => { flash.cb?.(); setFlash(null); }} />}
        <HeroPanel
          title={"Password\nReset"}
          subtitle="Verify your identity in 3 quick steps to regain access to your account."
          onBack={() => { setScreen("login"); setError(""); }}
          backLabel="Back to sign in"
          extra={
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stepTitles.map((t, i) => {
                const s    = i + 1;
                const done = resetStep > s;
                const active = resetStep === s;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, opacity: active || done ? 1 : 0.45 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "rgba(255,255,255,0.9)" : active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                      {done ? "✅" : stepIcons[i]}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>Step {s}</div>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{t}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f6", padding: "2rem" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <ErrBox msg={error} />

            {resetStep === 1 && (
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>Find your account 🔍</h3>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Enter the email address linked to your AgroConnect account.</p>
                <Label>Email Address</Label>
                <input value={resetEmail} onChange={e => { setResetEmail(e.target.value); setError(""); }} type="email" placeholder="you@example.com" onKeyDown={e => e.key === "Enter" && handleResetLookup()} style={{ ...inputStyle(focusField === "re"), marginBottom: 16 }} onFocus={() => setFocusField("re")} onBlur={() => setFocusField("")} />
                <GreenBtn label={loading ? "Searching…" : "Find Account →"} onClick={handleResetLookup} loading={loading} />
              </div>
            )}

            {resetStep === 2 && resetFoundAcct && (
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>Verify identity 📱</h3>
                <div style={{ background: "#E1F5EE", border: "1.5px solid " + GREEN2, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: GREEN }}>Account found: <strong>{resetFoundAcct.name}</strong> ({resetFoundAcct.role})</div>
                </div>
                <Label>Phone number on file</Label>
                <input value={resetPhone} onChange={e => { setResetPhone(e.target.value); setError(""); }} type="tel" placeholder="e.g. 0712 345 678" onKeyDown={e => e.key === "Enter" && handleVerifyPhone()} style={{ ...inputStyle(focusField === "rp"), marginBottom: 16 }} onFocus={() => setFocusField("rp")} onBlur={() => setFocusField("")} />
                <GreenBtn label="Verify & Continue →" onClick={handleVerifyPhone} />
              </div>
            )}

            {resetStep === 3 && (
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>Set new password 🔑</h3>
                <Label>New Password</Label>
                <input value={resetNewPw} onChange={e => { setResetNewPw(e.target.value); setError(""); }} type="password" placeholder="Min 8 characters" style={{ ...inputStyle(focusField === "np"), marginBottom: 10 }} onFocus={() => setFocusField("np")} onBlur={() => setFocusField("")} />
                {resetNewPw.length > 0 && (() => {
                  const s = resetNewPw.length < 8 ? 0 : /[A-Z]/.test(resetNewPw) && /[0-9]/.test(resetNewPw) ? 3 : resetNewPw.length < 10 ? 1 : 2;
                  const labels = ["Too short", "Weak", "Good", "Strong"];
                  const cols   = ["#E24B4A", "#BA7517", "#378ADD", GREEN2];
                  return (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                        {[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= s ? cols[s] : "#eee" }} />)}
                      </div>
                      <div style={{ fontSize: 11, color: cols[s], fontWeight: 500 }}>{labels[s]}</div>
                    </div>
                  );
                })()}
                <Label>Confirm Password</Label>
                <input value={resetConfirmPw} onChange={e => { setResetConfirmPw(e.target.value); setError(""); }} type="password" placeholder="Re-enter password" onKeyDown={e => e.key === "Enter" && handleSetNewPassword()} style={{ ...inputStyle(focusField === "cp"), marginBottom: 16 }} onFocus={() => setFocusField("cp")} onBlur={() => setFocusField("")} />
                <GreenBtn label={loading ? "Updating…" : "Reset Password ✓"} onClick={handleSetNewPassword} loading={loading} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
