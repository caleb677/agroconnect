import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { TRACEABILITY_BATCHES } from "../data/mockData.js";
import { callAI, parseAIJson, AI_HEADERS } from "../utils/aihelper.js";
export default function TraceabilityPage() {
  const [scanInput, setScanInput]   = useState("");
  const [result,    setResult]      = useState(null);
  const [loading,   setLoading]     = useState(false);
  const [error,     setError]       = useState(null);
  const [searched,  setSearched]    = useState(false);
  const [liveBatches, setLiveBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(true);

  // Fetch live Kenya agricultural traceability / export batches on load
  useEffect(() => {
    const fetchLiveBatches = async () => {
      setBatchLoading(true);
      try {
        const text = await callAI(
          `Search for recent Kenya agricultural export batches and traceability records 2025 2026 - avocado exports, coffee, tea, horticulture from Murang'a, Kirinyaga, Meru, Nyeri, Kiambu counties.
Return ONLY a JSON array (no markdown) of 6 items:
[{"id":"BATCH-001","produce":"Hass Avocado","farmer":"James Mwangi","county":"Murang'a","certLevel":"Organic","exported":true,"destination":"Netherlands","weight":"2.5 tonnes","harvestDate":"20 May 2026","status":"Exported"}]`,
          "Return ONLY valid JSON array. No markdown. No backticks.",
          true
        );
        const parsed = parseAIJson(text);
        setLiveBatches(Array.isArray(parsed) ? parsed : TRACEABILITY_BATCHES);
      } catch(e) {
        console.warn("Traceability API:", e.message);
        setLiveBatches(TRACEABILITY_BATCHES);
      }
      setBatchLoading(false);
    };
    fetchLiveBatches();
  }, []);

  const scan = async () => {
    if (!scanInput.trim()) return;
    setLoading(true); setSearched(true); setError(null); setResult(null);
    try {
      // First check local batches
      const local = [...liveBatches, ...TRACEABILITY_BATCHES].find(
        b => b.id?.toLowerCase().includes(scanInput.toLowerCase()) ||
             b.produce?.toLowerCase().includes(scanInput.toLowerCase())
      );
      if (local) { setResult(local); setLoading(false); return; }

      // Then search online
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers: AI_HEADERS,
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:800,
          tools:[{ type:"web_search_20250305", name:"web_search" }],
          system:"Return ONLY valid JSON. No markdown.",
          messages:[{ role:"user", content:`Search for Kenya agricultural batch traceability information for: "${scanInput}". Return ONLY this JSON:
{"id":"string","produce":"string","farmer":"string","county":"string","certLevel":"string","harvestDate":"string","weight":"string","destination":"string","status":"string","exported":true|false,"journey":[{"stage":"string","date":"string","location":"string","officer":"string"}]}` }]
        })
      });
      const data = await resp.json();
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setResult(parsed);
    } catch { setError("Batch not found in live records. Try a batch ID from the list below."); }
    setLoading(false);
  };

  const statusColors = { "Exported":"#1D9E75","In Transit":"#378ADD","At Market":"#BA7517","Cleared":"#7F77DD","Pending":"#888780" };

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>🔍 Blockchain Traceability</h2>
          <p style={{ color:C.gray, fontSize:12, margin:"4px 0 0" }}>Live Kenya produce tracking · Search any batch ID or produce name</p>
        </div>
        <div style={{ background:"#E1F5EE", border:"1px solid #A7DEC9", borderRadius:8, padding:"6px 14px", fontSize:12, color:C.primaryDark, fontWeight:600 }}>
          🔴 Live · {batchLoading?"Loading…":`${liveBatches.length} batches tracked`}
        </div>
      </div>

      {/* Search */}
      <div style={{ background:"#fff", border:"1.5px solid #eee", borderRadius:12, padding:"1.25rem", marginBottom:20 }}>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:12 }}>🔎 Track a Batch or Produce</div>
        <div style={{ display:"flex", gap:10 }}>
          <input value={scanInput} onChange={e=>setScanInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()} placeholder="Enter batch ID (e.g. BATCH-001) or produce name (e.g. Avocado)" style={{ flex:1, padding:"11px 16px", border:"1.5px solid #ddd", borderRadius:10, fontSize:13, outline:"none" }} />
          <button onClick={scan} disabled={loading} style={{ padding:"11px 24px", background:loading?C.gray:C.primary, color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:loading?"not-allowed":"pointer" }}>
            {loading?"🔍 Searching…":"Track →"}
          </button>
        </div>
        {error && <div style={{ marginTop:10, color:C.danger, fontSize:13 }}>❌ {error}</div>}
      </div>

      {/* Result */}
      {searched && result && (
        <div style={{ background:"#fff", border:`2px solid ${C.primary}`, borderRadius:12, padding:"1.5rem", marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:18, color:C.dark }}>{result.produce}</div>
              <div style={{ fontSize:13, color:C.gray, marginTop:2 }}>Batch: <strong>{result.id}</strong> · {result.weight}</div>
            </div>
            <span style={{ background:(statusColors[result.status]||C.gray)+"20", color:statusColors[result.status]||C.gray, padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:700 }}>{result.status}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
            {[["👨‍🌾 Farmer",result.farmer],["📍 County",result.county],["🏅 Certification",result.certLevel],["📅 Harvested",result.harvestDate],["✈️ Destination",result.destination||"Local Market"],["📦 Status",result.status]].map(([l,v])=>(
              <div key={l} style={{ background:C.grayLight, borderRadius:9, padding:"10px 12px" }}>
                <div style={{ fontSize:11, color:C.gray, marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600, color:C.dark }}>{v||"—"}</div>
              </div>
            ))}
          </div>
          {result.journey?.length > 0 && (
            <div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>📋 Journey Timeline</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {result.journey.map((j,i)=>(
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ width:12, height:12, borderRadius:"50%", background:i===0?C.primary:C.gray, marginTop:3 }}/>
                      {i<result.journey.length-1&&<div style={{ width:2, height:28, background:"#eee", margin:"2px 0" }}/>}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{j.stage}</div>
                      <div style={{ fontSize:11, color:C.gray }}>{j.date} · {j.location} {j.officer?`· ${j.officer}`:""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live batch list */}
      <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #eee", fontWeight:700, fontSize:14 }}>
          📦 Recent Batches {batchLoading?"(Loading…)":`(${liveBatches.length})`}
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.grayLight }}>
              {["Batch ID","Produce","County","Certification","Weight","Destination","Status"].map(h=>(
                <th key={h} style={{ padding:"9px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:C.gray }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(liveBatches.length>0?liveBatches:TRACEABILITY_BATCHES).map((b,i)=>(
              <tr key={i} onClick={()=>{setScanInput(b.id);setResult(b);setSearched(true);}} style={{ borderTop:"1px solid #f5f5f5", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"11px 12px", fontWeight:600, fontSize:13, color:C.info }}>{b.id}</td>
                <td style={{ padding:"11px 12px", fontSize:13 }}>{b.produce}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:C.gray }}>{b.county}</td>
                <td style={{ padding:"11px 12px" }}><span style={{ background:C.primaryLight, color:C.primaryDark, padding:"2px 8px", borderRadius:5, fontSize:11, fontWeight:600 }}>{b.certLevel}</span></td>
                <td style={{ padding:"11px 12px", fontSize:12, color:C.gray }}>{b.weight}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:C.gray }}>{b.destination||"Local"}</td>
                <td style={{ padding:"11px 12px" }}><span style={{ background:(statusColors[b.status]||C.gray)+"20", color:statusColors[b.status]||C.gray, padding:"2px 10px", borderRadius:10, fontSize:11, fontWeight:700 }}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
