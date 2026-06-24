import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/Badge.jsx";
import Btn from "../components/common/Btn.jsx";
import Modal from "../components/common/Modal.jsx";
import Field from "../components/common/Field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { MARKET_PRICES } from "../data/mockdata.js";
import { callAI, parseAIJson, AI_HEADERS } from "../utils/aiHelper.js";
export default function MarketPricesPage() {
  const [prices,    setPrices]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [filter,    setFilter]    = useState("All");

  const fetchPrices = async () => {
    setLoading(true); setError(null);
    try {
      const text = await callAI(
        `Search for today's live agricultural commodity prices in Kenya markets: Wakulima Market Nairobi, Muthurwa, Kongowea Mombasa, Murang'a market, Eldoret. Include: avocado, tomatoes, maize, beans, kale/sukuma, cabbage, onions, potatoes, carrots, spinach, bananas, milk per litre, eggs per tray, tea leaves.
Return ONLY a JSON array (no markdown, no backticks) of 15 items:
[{"produce":"Tomatoes","unit":"kg","price":85,"prevPrice":80,"change":6.3,"market":"Wakulima","category":"Vegetables","updatedAt":"Today"}]
Use real current Kenyan market prices in KES. change = percentage change vs yesterday.`,
        "Return ONLY a valid JSON array. No markdown. No backticks. No explanation.",
        true
      );
      const parsed = parseAIJson(text);
      setPrices(Array.isArray(parsed) ? parsed : MARKET_PRICES);
      setLastFetch(new Date());
    } catch(e) {
      console.warn("Prices API:", e.message);
      setError("Live prices unavailable. Showing last known prices.");
      setPrices(MARKET_PRICES.map(p=>({ ...p, category:"General", updatedAt:"Cached" })));
      setLastFetch(new Date());
    }
    setLoading(false);
  }
  useEffect(() => { fetchPrices(); const t=setInterval(fetchPrices,5*60*1000); return()=>clearInterval(t); }, []);

  const categories = ["All", ...new Set(prices.map(p=>p.category||"General").filter(Boolean))];
  const filtered = filter==="All" ? prices : prices.filter(p=>p.category===filter);
  const barMax = Math.max(...prices.map(p=>p.price||0), 1);

  if (loading && prices.length===0) return (
    <div style={{ padding:"3rem 2rem", textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📈</div>
      <div style={{ fontSize:15, color:C.gray, marginBottom:8 }}>Fetching live Kenyan market prices…</div>
      <div style={{ width:200, height:4, background:C.grayLight, borderRadius:4, overflow:"hidden", margin:"0 auto" }}>
        <div style={{ height:"100%", width:"60%", background:C.primary, borderRadius:4, animation:"slide 1.5s ease-in-out infinite" }}/>
      </div>
      <style>{"@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}"}</style>
    </div>
  );

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>📈 Live Market Prices</h2>
          <p style={{ color:C.gray, fontSize:12, margin:"4px 0 0" }}>
            🔴 Live · Wakulima, Muthurwa, Murang'a, Kongowea · Updated: {lastFetch?.toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"})||"—"}
          </p>
        </div>
        <button onClick={fetchPrices} disabled={loading} style={{ padding:"8px 16px", background:C.primary, color:"#fff", border:"none", borderRadius:9, fontWeight:600, fontSize:13, cursor:loading?"not-allowed":"pointer" }}>
          {loading?"⏳ Updating…":"🔄 Refresh"}
        </button>
      </div>

      {error && <div style={{ background:"#FFF3CD", border:"1px solid #FFEAA7", borderRadius:9, padding:"9px 14px", marginBottom:12, fontSize:12, color:"#856404" }}>⚠️ {error}</div>}

      {/* Category filter */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {categories.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{ padding:"5px 14px", borderRadius:20, border:`1.5px solid ${filter===c?C.primary:"#ddd"}`, background:filter===c?C.primaryLight:"#fff", color:filter===c?C.primaryDark:C.gray, fontSize:12, fontWeight:600, cursor:"pointer" }}>{c}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:700, fontSize:14 }}>Today's Prices ({filtered.length} commodities)</span>
            {loading && <span style={{ fontSize:11, color:C.gray }}>⏳ Refreshing…</span>}
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.grayLight }}>
                {["Produce","Unit","Price (KES)","vs Yesterday","Market","Bar"].map(h=>(
                  <th key={h} style={{ padding:"9px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:C.gray }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p,i)=>(
                <tr key={i} style={{ borderTop:"1px solid #f5f5f5" }}>
                  <td style={{ padding:"11px 12px", fontWeight:600, fontSize:13 }}>{p.produce}</td>
                  <td style={{ padding:"11px 12px", fontSize:12, color:C.gray }}>{p.unit}</td>
                  <td style={{ padding:"11px 12px", fontWeight:700, fontSize:15, color:C.primaryDark }}>KES {(p.price||0).toLocaleString()}</td>
                  <td style={{ padding:"11px 12px" }}>
                    <span style={{ fontWeight:700, fontSize:13, color:p.change>0?C.primary:p.change<0?C.danger:C.gray }}>
                      {p.change>0?`↑ +${p.change}%`:p.change<0?`↓ ${p.change}%`:"— 0%"}
                    </span>
                  </td>
                  <td style={{ padding:"11px 12px", fontSize:11, color:C.gray }}>{p.market}</td>
                  <td style={{ padding:"11px 12px" }}>
                    <div style={{ width:70, height:5, background:C.grayLight, borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${((p.price||0)/barMax)*100}%`, background:p.change>0?C.primary:p.change<0?C.danger:C.gray, borderRadius:3, transition:"width 0.5s" }}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Top movers */}
          <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.25rem" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>🔥 Top Movers Today</div>
            {[...prices].sort((a,b)=>Math.abs(b.change||0)-Math.abs(a.change||0)).slice(0,5).map((p,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, paddingBottom:10, borderBottom:i<4?"1px solid #f5f5f5":"none" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{p.produce}</div>
                  <div style={{ fontSize:11, color:C.gray }}>{p.market}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:14, fontWeight:700, color:p.change>0?C.primary:p.change<0?C.danger:C.gray }}>
                    {p.change>0?"+":""}{p.change}%
                  </div>
                  <div style={{ fontSize:11, color:C.gray }}>KES {(p.price||0).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Export demand box */}
          <div style={{ background:"linear-gradient(135deg,#0F6E56,#1D9E75)", borderRadius:12, padding:"1.25rem", color:"#fff" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>📊 Export Demand</div>
            {[["Avocado","High — EU Markets"],["Beans","Medium — Middle East"],["Maize","High — Regional"],["Tea","Very High — Global"]].map(([crop,demand])=>(
              <div key={crop} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:8, paddingBottom:8, borderBottom:"1px solid rgba(255,255,255,0.15)" }}>
                <span>{crop}</span><span style={{ opacity:0.85 }}>{demand}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}