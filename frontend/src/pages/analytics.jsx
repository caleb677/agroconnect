import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import StatCard from "../components/common/StatCard.jsx";
export default function AnalyticsPage({ isNewUser=false }) {
  const barData = [
    { month:"Jan", sales:45000 }, { month:"Feb", sales:52000 }, { month:"Mar", sales:61000 },
    { month:"Apr", sales:58000 }, { month:"May", sales:74000 },
  ];
  const maxVal = Math.max(...barData.map(d=>d.sales));
  const certStats = [
    { label:"Approved", value:61, color:C.primary },
    { label:"Pending",  value:18, color:C.accent  },
    { label:"Rejected", value:7,  color:C.danger  },
    { label:"In Review",value:12, color:C.info    },
  ];
  if (isNewUser) return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:"0 0 4px" }}>📊 Analytics</h2>
      <p style={{ color:C.gray, fontSize:13, margin:"0 0 24px" }}>Track your farm performance, sales trends and income.</p>
      <EmptyState
        icon="📊"
        title="No analytics data yet"
        desc="Your sales performance, revenue charts and buyer trends will appear here once you start transacting on AgroConnect."
        actionLabel={null}
      />
    </div>
  );
  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, marginBottom:20 }}>📈 Platform Analytics</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Total Revenue (KES)" value="2.4M"     icon="💰" change={12} color={C.primary} />
        <StatCard label="Active Farmers"       value="1,284"   icon="👨‍🌾" change={8}  color={C.info}    />
        <StatCard label="Transactions"         value="5,920"   icon="🔄" change={15} color={C.accent}  />
        <StatCard label="Avg Order Value"      value="KES 4.2K"icon="📊" change={-2} color={C.gray}    />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:20, marginBottom:20 }}>
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem" }}>
          <div style={{ fontWeight:600, marginBottom:20, fontSize:15 }}>Monthly Sales (KES)</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:180 }}>
            {barData.map((d,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ fontSize:11, color:C.gray }}>{(d.sales/1000).toFixed(0)}K</div>
                <div style={{ width:"100%", background:C.primary, borderRadius:"4px 4px 0 0", height:(d.sales/maxVal*140)+"px" }} />
                <div style={{ fontSize:12, color:C.gray }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem" }}>
          <div style={{ fontWeight:600, marginBottom:16, fontSize:15 }}>Top Categories</div>
          {[["Vegetables",42,C.primary],["Grains",28,C.accent],["Fruits",20,C.info],["Other",10,C.gray]].map(([cat,pct,color])=>(
            <div key={cat} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}><span>{cat}</span><span style={{ fontWeight:500 }}>{pct}%</span></div>
              <div style={{ background:C.grayLight, borderRadius:4, height:8, overflow:"hidden" }}>
                <div style={{ background:color, height:"100%", width:pct+"%", borderRadius:4 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem" }}>
          <div style={{ fontWeight:600, marginBottom:16, fontSize:15 }}>Certifications</div>
          {certStats.map(s=>(
            <div key={s.label} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}><span>{s.label}</span><span style={{ fontWeight:600, color:s.color }}>{s.value}</span></div>
              <div style={{ background:C.grayLight, borderRadius:4, height:7, overflow:"hidden" }}>
                <div style={{ background:s.color, height:"100%", width:String((s.value/98)*100) + "%", borderRadius:4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Fraud & Security */}
      <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem" }}>
        <div style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>⚠️ Fraud Detection Log</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[
            { icon:"🔴", label:"Fake Certificates Flagged", value:3, color:C.danger },
            { icon:"🟡", label:"Suspicious Sellers",        value:7, color:C.accent },
            { icon:"🟠", label:"Expired Certifications",    value:12, color:"#E88C2A" },
          ].map(f=>(
            <div key={f.label} style={{ background:f.color+"12", border:`1px solid ${f.color}30`, borderRadius:10, padding:"1rem", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize:22, fontWeight:700, color:f.color }}>{f.value}</div>
                <div style={{ fontSize:12, color:C.gray }}>{f.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Ward-level breakdown */}
      <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem", marginTop:20 }}>
        <div style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>📍 Performance by Sub-County</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
          {[
            { name:"Kandara",  farmers:312, revenue:"KES 480K", topCrop:"Maize",    color:C.primary },
            { name:"Kiharu",   farmers:284, revenue:"KES 420K", topCrop:"Potatoes", color:C.info    },
            { name:"Maragua",  farmers:267, revenue:"KES 390K", topCrop:"Tomatoes", color:C.accent  },
            { name:"Kangema",  farmers:198, revenue:"KES 310K", topCrop:"Beans",    color:"#7c3aed" },
            { name:"Mathioya", farmers:176, revenue:"KES 280K", topCrop:"Cabbages", color:"#db2777" },
            { name:"Gatanga",  farmers:163, revenue:"KES 250K", topCrop:"Milk",     color:"#0891b2" },
            { name:"Kigumo",   farmers:141, revenue:"KES 210K", topCrop:"Coffee",   color:C.accent  },
          ].map(s=>(
            <div key={s.name} style={{ background:s.color+"10", border:`1px solid ${s.color}25`, borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontWeight:700, fontSize:14, color:s.color, marginBottom:4 }}>{s.name}</div>
              <div style={{ fontSize:12, color:C.gray }}>👨‍🌾 {s.farmers} farmers</div>
              <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>💰 {s.revenue}</div>
              <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>🌾 Top: {s.topCrop}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// ─── FARM DIARY ────────────────────────────────────────────────────────────────
const DIARY_ACTIVITIES = [
  { id:1, date:"2026-05-20", type:"planting",    crop:"Maize",          note:"Planted DK8031 hybrid, spacing 75x25cm. Basal DAP applied.", weather:"☀️ Sunny",    qty:"2 acres" },
  { id:2, date:"2026-05-18", type:"irrigation",  crop:"Tomatoes",       note:"Drip irrigation run for 2 hours. Soil moisture looking good.", weather:"🌤️ Partly Cloudy", qty:"1 acre" },
  { id:3, date:"2026-05-15", type:"fertilizing", crop:"Maize",          note:"Top-dressed with CAN fertilizer at 6-week stage.", weather:"☀️ Sunny",    qty:"50kg CAN" },
  { id:4, date:"2026-05-12", type:"spraying",    crop:"Tomatoes",       note:"Applied Mancozeb 80WP for blight prevention. Mixed at 40g/20L.", weather:"🌥️ Cloudy",   qty:"20L mix" },
  { id:5, date:"2026-05-08", type:"harvesting",  crop:"Avocados (Hass)",note:"Harvested 280kg. Grade A: 200kg, Grade B: 80kg. Stored in coolroom.", weather:"☀️ Sunny",    qty:"280 kg" },
  { id:6, date:"2026-05-05", type:"planting",    crop:"Spinach",        note:"Nursery seedlings transplanted. 30cm row spacing.", weather:"🌦️ Light Rain", qty:"0.5 acres" },
];
const ACTIVITY_TYPES = [
  { key:"planting",    label:"Planting",    icon:"🌱", color:"#1D9E75", bg:"#E1F5EE" },
  { key:"irrigation",  label:"Irrigation",  icon:"💧", color:"#378ADD", bg:"#E6F1FB" },
  { key:"fertilizing", label:"Fertilizing", icon:"🌿", color:"#BA7517", bg:"#FAEEDA" },
  { key:"spraying",    label:"Spraying",    icon:"🧪", color:"#7F77DD", bg:"#EEEDFE" },
  { key:"harvesting",  label:"Harvesting",  icon:"🌾", color:"#E24B4A", bg:"#FCEBEB" },
  { key:"other",       label:"Other",       icon:"📝", color:"#888780", bg:"#F1EFE8" },
];