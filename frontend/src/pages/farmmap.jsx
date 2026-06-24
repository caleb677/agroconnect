import { useState } from "react";
import { C } from "../utils/constants.js";

export default function FarmMapPage({ role }) {
  const [selectedSubcounty, setSelectedSubcounty] = useState(null);
  const [ward, setWard]         = useState("");
  const [subcounty, setSubcounty] = useState("");

  const subcounties = [
    { id:1, name:"Kandara",  farmers:312, certified:187, cx:160, cy:220 },
    { id:2, name:"Kiharu",   farmers:284, certified:142, cx:240, cy:160 },
    { id:3, name:"Maragua",  farmers:267, certified:201, cx:310, cy:240 },
    { id:4, name:"Kangema",  farmers:198, certified:98,  cx:140, cy:130 },
    { id:5, name:"Mathioya", farmers:176, certified:88,  cx:200, cy:90  },
    { id:6, name:"Gatanga",  farmers:163, certified:120, cx:330, cy:170 },
    { id:7, name:"Kigumo",   farmers:141, certified:75,  cx:260, cy:300 },
  ];

  const maxFarmers = Math.max(...subcounties.map(s => s.farmers));

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, marginBottom:4 }}>🗺️ Farm Location Map — Murang'a County</h2>
      <p style={{ color:C.gray, fontSize:13, marginBottom:20 }}>Explore farms by sub-county and ward</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:20 }}>
        {/* Filters */}
        <div>
          <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.25rem", marginBottom:14 }}>
            <div style={{ fontWeight:600, fontSize:14, marginBottom:12 }}>🔎 Filter Farms</div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:4 }}>Sub-County</label>
              <select value={subcounty} onChange={e => setSubcounty(e.target.value)}
                style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #ddd", fontSize:13 }}>
                <option value="">All Sub-Counties</option>
                {subcounties.map(sc => <option key={sc.id}>{sc.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:4 }}>Ward</label>
              <select value={ward} onChange={e => setWard(e.target.value)}
                style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #ddd", fontSize:13 }}>
                <option value="">All Wards</option>
                <option>Muruka</option><option>Kihumbuini</option><option>Kandara</option>
                <option>Ithiru</option><option>Ruchu</option><option>Gaichanjiru</option>
              </select>
            </div>
          </div>

          {/* Sub-county list */}
          <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1rem" }}>
            <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Sub-County Farmers</div>
            {subcounties.map(sc => (
              <div
                key={sc.id}
                onClick={() => setSelectedSubcounty(sc)}
                style={{
                  padding:"8px 10px", borderRadius:8, marginBottom:4, cursor:"pointer",
                  background: selectedSubcounty?.id === sc.id ? C.primaryLight : "transparent",
                  display:"flex", alignItems:"center", gap:10,
                }}
              >
                <div style={{
                  flex:1, background:"#eee", borderRadius:4, height:6, overflow:"hidden",
                }}>
                  <div style={{ background:C.primary, height:"100%", width:`${(sc.farmers / maxFarmers) * 100}%` }} />
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:C.dark, minWidth:70 }}>{sc.name}</span>
                <span style={{ fontSize:11, color:C.gray, minWidth:30 }}>{sc.farmers}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map panel */}
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #eee", fontWeight:600, fontSize:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>🗺️ Murang'a County</span>
            <a
              href="https://www.google.com/maps/place/Murang%27a+County/@-0.7800,37.0300,10z"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize:12, color:C.primary, textDecoration:"none", fontWeight:500 }}
            >
              Open in Google Maps ↗
            </a>
          </div>

          {/* OpenStreetMap embed */}
          <iframe
            title="Murang'a County Map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=36.7%2C-1.0%2C37.4%2C-0.5&layer=mapnik&marker=-0.719%2C37.155"
            style={{ width:"100%", height:260, border:"none", display:"block" }}
            loading="lazy"
          />

          {/* SVG overlay with sub-county bubbles */}
          <div style={{ padding:"1rem 1.25rem", background:"#f0f8f4" }}>
            <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>📍 Sub-County Farmer Density</div>
            <svg viewBox="0 0 420 360" style={{ width:"100%", borderRadius:8 }}>
              <rect width="420" height="360" fill="#e8f5e9" rx="8" />
              {subcounties.map(sc => {
                const r = 18 + (sc.farmers / maxFarmers) * 28;
                const isSelected = selectedSubcounty?.id === sc.id;
                return (
                  <g key={sc.id} onClick={() => setSelectedSubcounty(isSelected ? null : sc)} style={{ cursor:"pointer" }}>
                    <circle
                      cx={sc.cx} cy={sc.cy} r={r}
                      fill={isSelected ? C.primary : C.primary + "88"}
                      stroke={isSelected ? "#fff" : "none"}
                      strokeWidth={isSelected ? 3 : 0}
                    />
                    <text x={sc.cx} y={sc.cy - 2} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">{sc.name}</text>
                    <text x={sc.cx} y={sc.cy + 12} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.9)">{sc.farmers} farmers</text>
                  </g>
                );
              })}
            </svg>

            {selectedSubcounty && (
              <div style={{ background:"#fff", borderRadius:10, padding:"1rem", marginTop:10, boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.primary }}>📍 {selectedSubcounty.name}</div>
                  <button onClick={() => setSelectedSubcounty(null)} style={{ fontSize:11, color:C.gray, background:"none", border:"none", cursor:"pointer" }}>Close ×</button>
                </div>
                <div style={{ display:"flex", gap:20, fontSize:13 }}>
                  <div><span style={{ color:C.gray }}>Farmers: </span><strong>{selectedSubcounty.farmers}</strong></div>
                  <div><span style={{ color:C.gray }}>Certified: </span><strong style={{ color:C.primary }}>{selectedSubcounty.certified}</strong></div>
                  <div><span style={{ color:C.gray }}>Rate: </span><strong style={{ color:C.primary }}>{Math.round(selectedSubcounty.certified / selectedSubcounty.farmers * 100)}%</strong></div>
                </div>
                <div style={{ background:"#eee", borderRadius:4, height:6, marginTop:8, overflow:"hidden" }}>
                  <div style={{ background:C.primary, height:"100%", width:`${selectedSubcounty.certified / selectedSubcounty.farmers * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
