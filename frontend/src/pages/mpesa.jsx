import { useState } from "react";
import { C, inp } from "../utils/constants.js";
import Btn from "../components/common/Btn.jsx";
import Alert from "../components/common/Alert.jsx";

const HISTORY_KEY = "ac_mpesa_history";
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }

const DEMO_PRODUCTS = [
  { id:"p1", name:"Maize (90kg bag)",    price:2800 },
  { id:"p2", name:"Potatoes (90kg)",     price:4500 },
  { id:"p3", name:"Tomatoes (crate)",    price:1200 },
  { id:"p4", name:"Dairy Cow Feed",      price:3600 },
  { id:"p5", name:"Certified Seeds",     price:850  },
];

const STATUS_STEPS = [
  "Initiating payment…",
  "Sending STK Push to your phone…",
  "Waiting for PIN confirmation…",
  "Processing transaction…",
  "Confirming with server…",
];

export default function MpesaPage() {
  const [phone,   setPhone]   = useState("0799147722");
  const [amount,  setAmount]  = useState("");
  const [ref,     setRef]     = useState("");
  const [product, setProduct] = useState("");
  const [status,  setStatus]  = useState(null);
  const [step,    setStep]    = useState(0);
  const [flash,   setFlash]   = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const [tab,     setTab]     = useState("pay");

  const formatPhone = (p) => {
    const d = p.replace(/\D/g, "");
    if (d.startsWith("07") || d.startsWith("01")) return "254" + d.slice(1);
    if (d.startsWith("254")) return d;
    return "254" + d;
  };

  const initiatePay = async () => {
    if (!phone || !amount || Number(amount) < 1) {
      setFlash({ type:"error", msg:"Enter a valid phone number and amount" });
      return;
    }
    setStatus("loading");
    setStep(0);
    for (let i = 0; i < STATUS_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 900 + Math.random() * 400));
      setStep(i);
    }
    const success = Math.random() > 0.1;
    if (success) {
      const txn = {
        id:       "TXN" + Date.now(),
        mpesaCode:"QK" + Math.random().toString(36).slice(2, 10).toUpperCase(),
        phone:    formatPhone(phone),
        amount:   Number(amount),
        product:  product || ref || "General Payment",
        status:   "completed",
        date:     new Date().toLocaleString("en-KE"),
      };
      const newH = [txn, ...history];
      setHistory(newH);
      saveHistory(newH);
      setStatus("success");
      setFlash({ type:"success", msg:"✅ Payment of KES " + amount + " confirmed! M-Pesa code: " + txn.mpesaCode });
    } else {
      setStatus("failed");
      setFlash({ type:"error", msg:"Payment cancelled or timed out. Please try again." });
    }
  };

  const reset = () => { setStatus(null); setStep(0); setAmount(""); setRef(""); setProduct(""); };

  return (
    <div style={{ padding:"1.5rem 2rem", maxWidth:720, margin:"0 auto" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, marginBottom:4 }}>💳 M-Pesa Payments</h2>
      <p style={{ color:C.gray, fontSize:13, marginBottom:20 }}>Lipa na M-Pesa — STK Push (Demo Mode)</p>

      {flash && <Alert type={flash.type} msg={flash.msg} onClose={() => setFlash(null)} />}

      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["pay", "history"].map(t2 => (
          <button key={t2} onClick={() => setTab(t2)} style={{
            padding:"8px 20px", borderRadius:20, border:"none", cursor:"pointer",
            fontSize:13, fontWeight:600,
            background: tab === t2 ? C.primary : "#eee",
            color:      tab === t2 ? "#fff"    : C.dark,
          }}>
            {t2 === "pay" ? "💳 Pay Now" : "📜 Payment History"}
          </button>
        ))}
      </div>

      {tab === "pay" && (
        <div style={{ background:"#fff", borderRadius:14, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
          {status === null && (
            <div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.dark, display:"block", marginBottom:6 }}>M-Pesa Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX" style={inp} />
                <div style={{ fontSize:11, color:C.gray, marginTop:3 }}>Formatted: {formatPhone(phone)}</div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.dark, display:"block", marginBottom:6 }}>Quick Select Product</label>
                <select
                  value={product}
                  onChange={e => {
                    setProduct(e.target.value);
                    const p = DEMO_PRODUCTS.find(x => x.name === e.target.value);
                    if (p) { setAmount(String(p.price)); setRef(p.name); }
                  }}
                  style={{ ...inp, background:"#fff" }}
                >
                  <option value="">-- Select or enter manually --</option>
                  {DEMO_PRODUCTS.map(p => (
                    <option key={p.id} value={p.name}>{p.name} — KES {p.price.toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.dark, display:"block", marginBottom:6 }}>Amount (KES)</label>
                <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 2800" type="number" min="1" style={inp} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.dark, display:"block", marginBottom:6 }}>Reference / Description</label>
                <input value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. Maize payment" style={inp} />
              </div>
              <div style={{ background:C.primaryLight, borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:12, color:"#0F6E56" }}>
                🔒 Demo mode — no real money is charged. Integrate Safaricom Daraja API for live payments.
              </div>
              <Btn onClick={initiatePay}>Send M-Pesa STK Push 📲</Btn>
            </div>
          )}

          {status === "loading" && (
            <div style={{ textAlign:"center", padding:"2rem 1rem" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📲</div>
              <div style={{ fontWeight:700, fontSize:16, color:C.dark, marginBottom:8 }}>Processing Payment</div>
              <div style={{ color:C.gray, fontSize:13, marginBottom:20 }}>{STATUS_STEPS[step]}</div>
              <div style={{ background:"#f0f0ee", borderRadius:8, height:8, overflow:"hidden", marginBottom:20 }}>
                <div style={{ background:C.primary, height:"100%", width:`${((step + 1) / STATUS_STEPS.length) * 100}%`, transition:"width 0.5s" }} />
              </div>
              <div style={{ fontSize:12, color:C.gray }}>Check your phone for the M-Pesa prompt</div>
            </div>
          )}

          {status === "success" && (
            <div style={{ textAlign:"center", padding:"2rem 1rem" }}>
              <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
              <div style={{ fontWeight:700, fontSize:18, color:C.primary, marginBottom:8 }}>Payment Successful!</div>
              <div style={{ color:C.gray, fontSize:13, marginBottom:24 }}>Your M-Pesa transaction has been confirmed.</div>
              <Btn onClick={reset}>Make Another Payment</Btn>
            </div>
          )}

          {status === "failed" && (
            <div style={{ textAlign:"center", padding:"2rem 1rem" }}>
              <div style={{ fontSize:52, marginBottom:12 }}>❌</div>
              <div style={{ fontWeight:700, fontSize:18, color:C.danger, marginBottom:8 }}>Payment Failed</div>
              <div style={{ color:C.gray, fontSize:13, marginBottom:24 }}>The request was cancelled or timed out.</div>
              <Btn onClick={reset}>Try Again</Btn>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div>
          {history.length === 0 ? (
            <div style={{ background:"#fff", borderRadius:14, padding:"3rem", textAlign:"center", color:C.gray }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
              <div style={{ fontSize:15, fontWeight:600 }}>No payment history yet</div>
              <div style={{ fontSize:13, marginTop:4 }}>Your M-Pesa transactions will appear here</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {history.map(txn => (
                <div key={txn.id} style={{ background:"#fff", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
                  <div style={{ width:40, height:40, borderRadius:20, background:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>✅</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:C.dark }}>{txn.product}</div>
                    <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>Code: {txn.mpesaCode} • {txn.date}</div>
                  </div>
                  <div style={{ fontWeight:700, fontSize:15, color:C.primary }}>KES {txn.amount.toLocaleString()}</div>
                </div>
              ))}
              <button
                onClick={() => { setHistory([]); saveHistory([]); }}
                style={{ fontSize:12, color:C.danger, background:"none", border:"none", cursor:"pointer", marginTop:4 }}
              >
                Clear history
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
