import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { DIARY_ACTIVITIES, ACTIVITY_TYPES } from "../data/mockData.js";
export default function FarmDiaryPage({ isNewUser=false }) {
  const todayISO = new Date().toISOString().split("T")[0]; // e.g. "2026-05-24"
  const [entries, setEntries]   = useState(isNewUser ? [] : DIARY_ACTIVITIES);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState("all");
  const [flash, setFlash]       = useState(null);
  const [form, setForm]         = useState({ date: todayISO, type:"planting", crop:"", note:"", weather:"☀️ Sunny", qty:"" });

  const typeMap = Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, t]));
  const weathers = ["☀️ Sunny","🌤️ Partly Cloudy","🌥️ Cloudy","🌦️ Light Rain","🌧️ Heavy Rain","⛈️ Thunderstorm"];
  const filtered = filter === "all" ? entries : entries.filter(e => e.type === filter);

  const save = () => {
    if (!form.date || !form.crop.trim()) return;
    setEntries(prev => [{ id: Date.now(), ...form }, ...prev]);
    setShowForm(false);
    setForm({ date: todayISO, type:"planting", crop:"", note:"", weather:"☀️ Sunny", qty:"" });
    setFlash({ type:"success", title:"Activity logged!", sub:"Your farm diary has been updated." });
  };

  // summary counts
  const counts = Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, entries.filter(e=>e.type===t.key).length]));

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {flash && <FlashResult type={flash.type} title={flash.title} sub={flash.sub} onDone={()=>setFlash(null)} />}

      {/* header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>📋 Farm Diary</h2>
          <p style={{ color:C.gray, fontSize:13, margin:"4px 0 0" }}>Record all farm activities for certification & traceability</p>
        </div>
        <button onClick={()=>{ setForm({ date: todayISO, type:"planting", crop:"", note:"", weather:"☀️ Sunny", qty:"" }); setShowForm(true); }} style={{ padding:"9px 20px", background:C.primary, color:"#fff", border:"none", borderRadius:9, fontWeight:600, fontSize:13, cursor:"pointer" }}>+ Log Activity</button>
      </div>

      {/* activity summary chips */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
        <button onClick={()=>setFilter("all")} style={{ padding:"6px 16px", borderRadius:20, border:`1.5px solid ${filter==="all"?C.primary:"#ddd"}`, background:filter==="all"?C.primaryLight:"#fff", color:filter==="all"?C.primaryDark:C.gray, fontSize:12, fontWeight:600, cursor:"pointer" }}>
          All ({entries.length})
        </button>
        {ACTIVITY_TYPES.map(t => (
          <button key={t.key} onClick={()=>setFilter(t.key)} style={{ padding:"6px 16px", borderRadius:20, border:`1.5px solid ${filter===t.key?t.color:"#ddd"}`, background:filter===t.key?t.bg:"#fff", color:filter===t.key?t.color:C.gray, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            {t.icon} {t.label} {counts[t.key]>0 && `(${counts[t.key]})`}
          </button>
        ))}
      </div>

      {/* log form */}
      {showForm && (
        <div style={{ background:"#fff", border:`1.5px solid ${C.primary}`, borderRadius:14, padding:"1.5rem", marginBottom:20, boxShadow:"0 4px 20px rgba(29,158,117,0.1)" }}>
          <div style={{ fontWeight:700, fontSize:15, color:C.dark, marginBottom:14 }}>📝 New Farm Activity</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
            <Field label="Date *">
              <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inp} />
            </Field>
            <Field label="Activity Type *">
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={sel}>
                {ACTIVITY_TYPES.map(t=><option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
              </select>
            </Field>
            <Field label="Crop / Produce *">
              <input value={form.crop} onChange={e=>setForm({...form,crop:e.target.value})} placeholder="e.g. Maize, Tomatoes" style={inp} />
            </Field>
            <Field label="Quantity / Area">
              <input value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} placeholder="e.g. 2 acres, 50kg" style={inp} />
            </Field>
            <Field label="Weather">
              <select value={form.weather} onChange={e=>setForm({...form,weather:e.target.value})} style={sel}>
                {weathers.map(w=><option key={w}>{w}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes / Observations">
            <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Describe what was done, products used, observations..." rows={2} style={{ ...inp, resize:"vertical" }} />
          </Field>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={save}>Save Activity</Btn>
            <Btn variant="ghost" onClick={()=>{ setShowForm(false); setForm({ date: todayISO, type:"planting", crop:"", note:"", weather:"☀️ Sunny", qty:"" }); }}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* entries timeline */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"3rem", color:C.gray, fontSize:14 }}>No activities logged yet. Start recording your farm work!</div>
        )}
        {filtered.length === 0 && entries.length === 0 && (
          <EmptyState
            icon="📔"
            title="Your farm diary is empty"
            desc="Start recording your farm activities — planting, irrigation, spraying, harvesting — to build your history for certification and traceability."
            actionLabel="Log First Activity"
            action={()=>setShowForm(true)}
          />
        )}
        {filtered.map(entry => {
          const t = typeMap[entry.type] || typeMap.other;
          return (
            <div key={entry.id} style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1rem 1.25rem", display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:44, height:44, background:t.bg, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{t.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontWeight:700, fontSize:14, color:C.dark }}>{entry.crop}</span>
                    <span style={{ background:t.bg, color:t.color, borderRadius:6, padding:"2px 9px", fontSize:11, fontWeight:600 }}>{t.label}</span>
                    {entry.qty && <span style={{ fontSize:12, color:C.gray }}>· {entry.qty}</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:12 }}>{entry.weather}</span>
                    <span style={{ fontSize:12, color:C.gray }}>{entry.date}</span>
                  </div>
                </div>
                {entry.note && <p style={{ fontSize:13, color:"#555", margin:0, lineHeight:1.5 }}>{entry.note}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* certification tip */}
      <div style={{ marginTop:20, padding:"12px 16px", background:C.infoLight, borderRadius:10, fontSize:12, color:C.info, display:"flex", gap:8, alignItems:"center" }}>
        💡 <strong>Tip:</strong> Consistent diary entries strengthen your organic certification application. Extension officers review your activity history during field visits.
      </div>
    </div>
  );
}