import { useState, useEffect, useRef } from "react";
import LangToggle from "./langtoggle.jsx";
import { C, inp ,sel } from "../utils/constants.js";
export default function TopBar({ role, user, onLogout, setPage, darkMode, toggleDark, onAIChat, notifs=[], setNotifs=()=>{}, pushNotification=()=>{} }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [pushForm, setPushForm] = useState({ title:"", message:"", target:"All Users", type:"info" });
  const unread = notifs.filter(n=>!n.read).length;
  const initials = user?.name?.split(" ").map(w=>w[0]).join("").slice(0,2) || "??";
  return (
    <div style={{ height:56, background:"#fff", borderBottom:"1px solid #eee", display:"flex", alignItems:"center", padding:"0 1.5rem", gap:16, position:"relative", zIndex:10 }}>
      <div style={{ flex:1 }}>
        <input placeholder="Search produce, farmers, buyers..." style={{ width:300, padding:"7px 14px", borderRadius:20, border:"1px solid #ddd", fontSize:13, outline:"none" }} />
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {/* AI Advisor Button */}
        <button onClick={onAIChat} style={{ padding:"6px 14px", background:C.primaryLight, color:C.primaryDark, border:"none", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:600 }}>
          🤖 AI Advisor
        </button>
        {/* Admin: Push Notification Button */}
        {role === "Admin" && (
          <div style={{ position:"relative" }}>
            <button onClick={()=>{ setShowPush(!showPush); setShowNotif(false); setShowProfile(false); }} style={{ padding:"6px 14px", background:"#FCEBEB", color:C.danger, border:"none", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:600 }}>
              📣 Push Notification
            </button>
            {showPush && (
              <div style={{ position:"absolute", right:0, top:40, width:360, background:"#fff", border:"1px solid #eee", borderRadius:12, boxShadow:"0 8px 30px rgba(0,0,0,0.15)", zIndex:200, padding:"1.25rem" }}>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:14, color:C.dark }}>📣 Push Notification to Users</div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:4 }}>Target Audience</label>
                  <select value={pushForm.target} onChange={e=>setPushForm({...pushForm,target:e.target.value})} style={{ ...sel, fontSize:13 }}>
                    {["All Users","Farmers Only","Buyers Only","Agrovet Only","Extension Officers"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:4 }}>Notification Type</label>
                  <select value={pushForm.type} onChange={e=>setPushForm({...pushForm,type:e.target.value})} style={{ ...sel, fontSize:13 }}>
                    {["info","alert","cert","order","weather","fraud"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:4 }}>Message</label>
                  <textarea value={pushForm.message} onChange={e=>setPushForm({...pushForm,message:e.target.value})} placeholder="Type notification message..." style={{ ...inp, height:70, resize:"vertical", fontSize:13 }} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>{
                    if (!pushForm.message.trim()) return;
                    pushNotification({ type:pushForm.type, text:`[${pushForm.target}] ${pushForm.message}` });
                    setPushForm({ title:"", message:"", target:"All Users", type:"info" });
                    setShowPush(false);
                  }} style={{ flex:1, padding:"9px", background:C.danger, color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
                    📣 Send Now
                  </button>
                  <button onClick={()=>setShowPush(false)} style={{ padding:"9px 14px", background:C.grayLight, color:C.dark, border:"none", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
        <LangToggle />
        {/* Dark mode toggle */}
        <button onClick={toggleDark} style={{ background:"none", border:"1px solid #eee", borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:14 }}>
          {darkMode ? "☀️" : "🌙"}
        </button>
        {/* Notifications */}
        <div style={{ position:"relative" }}>
          <button onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, position:"relative" }}>
            🔔
            {unread>0 && <span style={{ position:"absolute", top:-2, right:-2, background:C.danger, color:"#fff", borderRadius:10, padding:"0 5px", fontSize:10 }}>{unread}</span>}
          </button>
          {showNotif && (
            <div style={{ position:"absolute", right:0, top:40, width:340, background:"#fff", border:"1px solid #eee", borderRadius:12, boxShadow:"0 4px 20px rgba(0,0,0,0.12)", zIndex:100 }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:600, fontSize:14 }}>Notifications</span>
                <button onClick={()=>setNotifs(notifs.map(n=>({...n,read:true})))} style={{ background:"none", border:"none", color:C.primary, fontSize:12, cursor:"pointer" }}>Mark all read</button>
              </div>
              {notifs.map(n => (
                <div key={n.id} style={{ padding:"10px 16px", borderBottom:"1px solid #f5f5f5", background:n.read?"transparent":"#f0faf6" }}>
                  <div style={{ fontSize:13 }}>
                    {n.type==="fraud"&&<span style={{color:C.danger,fontWeight:600}}>⚠️ </span>}
                    {n.text}
                  </div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Profile */}
        <div style={{ position:"relative" }}>
          <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }} style={{ width:36, height:36, borderRadius:"50%", background:C.primary, color:"#fff", border:"none", cursor:"pointer", fontWeight:700, fontSize:13 }}>
            {initials}
          </button>
          {showProfile && (
            <div style={{ position:"absolute", right:0, top:44, width:200, background:"#fff", border:"1px solid #eee", borderRadius:12, boxShadow:"0 4px 20px rgba(0,0,0,0.12)", zIndex:100, padding:"0.5rem 0" }}>
              <div style={{ padding:"10px 16px", borderBottom:"1px solid #eee" }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{user?.name}</div>
                <div style={{ fontSize:12, color:C.gray }}>{role}</div>
              </div>
              <button style={{ width:"100%", textAlign:"left", padding:"8px 16px", background:"none", border:"none", cursor:"pointer", fontSize:13 }}>👤 Profile Settings</button>
              <button onClick={onLogout} style={{ width:"100%", textAlign:"left", padding:"8px 16px", background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.danger }}>🚪 Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}