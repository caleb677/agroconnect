import StatCard from "../components/common/StatCard.jsx";
import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/Badge.jsx";
import Btn from "../components/common/Btn.jsx";
import Modal from "../components/common/Modal.jsx";
import Field from "../components/common/Field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { MURANGA_SUBCOUNTIES } from "../data/mockData.js";
import { SEED_ACCOUNTS,UserDB } from "../data/userDB.js";
export default function DashboardPage({ role, setPage, notifs=[], user={}, orders=[] }) {
  const statsByRole = {
    Farmer: [
      { label:"Active Listings", value:"6",       icon:"🌿", change:2,    color:C.primary },
      { label:"Total Orders",    value:"23",      icon:"📦", change:15,   color:C.info    },
      { label:"Revenue (KES)",   value:"142,500", icon:"💰", change:8,    color:C.accent  },
      { label:"Trust Score",     value:"87/100",  icon:"⭐", change:null, color:C.primary },
    ],
    Buyer: [
      { label:"Orders Placed",   value:"12",      icon:"📦", change:5,    color:C.info    },
      { label:"Spent (KES)",     value:"85,000",  icon:"💰", change:10,   color:C.accent  },
      { label:"Farmers Sourced", value:"8",       icon:"👨‍🌾",change:2,    color:C.primary },
      { label:"Pending Orders",  value:"3",       icon:"⏳", change:null, color:C.gray    },
    ],
    Agrovet: [
      { label:"Products Listed", value:"24",      icon:"💊", change:3,    color:C.accent  },
      { label:"Orders Received", value:"41",      icon:"📦", change:12,   color:C.info    },
      { label:"Revenue (KES)",   value:"98,200",  icon:"💰", change:7,    color:C.primary },
      { label:"Farmers Served",  value:"63",      icon:"👨‍🌾",change:4,    color:C.primary },
    ],
    "Extension Officer": [
      { label:"Assigned Farmers",value:"87",      icon:"👨‍🌾",change:5,    color:C.primary },
      { label:"Certs Reviewed",  value:"34",      icon:"🏅", change:8,    color:C.accent  },
      { label:"Tutorials",       value:"12",      icon:"📚", change:2,    color:C.info    },
      { label:"Pending Reviews", value:"4",       icon:"⏳", change:null, color:C.gray    },
    ],
    Admin: [
      { label:"Total Users",     value:"2,847",   icon:"👥", change:5,    color:C.info    },
      { label:"Active Listings", value:"382",     icon:"🏪", change:12,   color:C.primary },
      { label:"Orders Today",    value:"94",      icon:"📦", change:-3,   color:C.accent  },
      { label:"Certifications",  value:"61",      icon:"🏅", change:7,    color:C.primary },
    ],
  };
  const stats = statsByRole[role] || statsByRole.Farmer;

  // ── NEW USER DETECTION: users whose email is not in SEED_ACCOUNTS are "new" ──
  const seedEmails = SEED_ACCOUNTS.map(a => a.email);
  // Admin and Extension Officers always see full dashboard even if new
  // Dashboard is locked for new users until certification is approved
  const certApproved = user?.dashboardUnlocked === true || user?.certStatus === "approved";
  const isNewUser = !certApproved;
  const showEmptyState = isNewUser && !certApproved && role !== "Admin" && role !== "Extension Officer";

  const quickActions = {
    Farmer: [
      { icon:"🌾", label:"List Produce",   desc:"Add new listing",         color:C.primary, page:"my-produce"    },
      { icon:"🌿", label:"Farm Inputs",    desc:"Buy certified inputs",     color:C.accent,  page:"farm-inputs"   },
      { icon:"🏅", label:"Get Certified",  desc:"Apply for certification",  color:C.info,    page:"certification" },
      { icon:"🤖", label:"AI Advisor",     desc:"Get farming advice",       color:C.purple,  page:"ai"            },
      { icon:"🗺️", label:"Farm Map",       desc:"Pin your location",        color:"#7F77DD", page:"map"           },
      { icon:"🌦️", label:"Weather",        desc:"Check farm weather",       color:C.info,    page:"weather"       },
    ],
    Buyer: [
      { icon:"🔍", label:"Browse Market",  desc:"Find fresh produce",       color:C.primary, page:"marketplace"   },
      { icon:"📦", label:"Track Orders",   desc:"View order status",         color:C.info,    page:"orders"        },
      { icon:"🔍", label:"Verify Produce", desc:"Scan QR traceability",      color:C.accent,  page:"traceability"  },
      { icon:"💬", label:"Messages",       desc:"Contact suppliers",         color:"#9333ea", page:"messages"      },
    ],
    Agrovet: [
      { icon:"🌿", label:"Farm Inputs",    desc:"Manage certified inputs",   color:C.primary, page:"farm-inputs"   },
      { icon:"📦", label:"Orders",         desc:"Customer orders",           color:C.info,    page:"orders"        },
      { icon:"🚛", label:"Transport",      desc:"Select logistics company",  color:C.accent,  page:"transport"     },
      { icon:"💬", label:"Messages",       desc:"Stakeholder chat",          color:"#9333ea", page:"messages"      },
    ],
    "Extension Officer": [
      { icon:"🏅", label:"Review Certs",   desc:"Pending approvals",         color:C.accent,  page:"certification" },
      { icon:"👨‍🌾",label:"Manage Farmers", desc:"View your farmers",         color:C.primary, page:"farmers"       },
      { icon:"📚", label:"Tutorials",      desc:"Upload training",           color:C.info,    page:"tutorials"     },
      { icon:"🗺️", label:"Farm Map",       desc:"Murang'a farm locations",   color:C.purple,  page:"map"           },
    ],
    Admin: [
      { icon:"👥", label:"Manage Users",   desc:"Invite & verify accounts",  color:C.info,    page:"users"         },
      { icon:"🏅", label:"Certifications", desc:"Review applications",       color:C.accent,  page:"certification" },
      { icon:"🏪", label:"Marketplace",    desc:"Manage listings",           color:C.primary, page:"marketplace"   },
      { icon:"📈", label:"Analytics",      desc:"Platform insights",         color:C.gray,    page:"analytics"     },
    ],
  };
  const actions = quickActions[role] || quickActions.Farmer;

  // Fraud alert for admin/extension
  const fraudAlert = (role==="Admin"||role==="Extension Officer") && (
    <div style={{ background:"#FFF3CD", border:"1px solid #FFEAA7", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
      <span style={{ fontSize:20 }}>⚠️</span>
      <div>
        <div style={{ fontWeight:600, fontSize:13, color:"#856404" }}>Fraud Detection Alert</div>
        <div style={{ fontSize:12, color:"#856404" }}>2 suspicious seller accounts flagged. 1 duplicate certificate detected. <button style={{ color:"#0F6E56", background:"none", border:"none", cursor:"pointer", fontSize:12, fontWeight:600 }}>Review now →</button></div>
      </div>
    </div>
  );

  if (showEmptyState) return (
    <div style={{ padding:"2rem", fontFamily:"inherit" }}>
      <h2 style={{ fontSize:22, fontWeight:700, marginBottom:4, color:C.dark }}>Welcome, {user?.name} 👋</h2>
      <p style={{ color:C.gray, marginBottom:32, fontSize:14 }}>{new Date().toLocaleDateString("en-KE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} — {user?.county||"Kenya"}, Kenya</p>
      {/* Onboarding checklist */}
      <div style={{ background:"#fff", border:"1.5px solid #1D9E75", borderRadius:14, padding:"1.75rem", maxWidth:560, marginBottom:24 }}>
        <div style={{ fontSize:20, marginBottom:6 }}>🌱 Get started with AgroConnect</div>
        <p style={{ color:C.gray, fontSize:13, marginBottom:20 }}>Complete your certification to unlock your full dashboard.</p>
        <div style={{ background:"#FFF8E7", border:"1.5px solid #BA7517", borderRadius:9, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#BA7517", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>🔒</span>
          <div><strong>Dashboard locked</strong> — Once your certification is approved, your full dashboard with orders, market prices, AI advisor and more will unlock automatically.</div>
        </div>
        {[
          { done:true,  icon:"✅", label:"Account created",           desc:"You're registered on AgroConnect" },
          { done:user?.certStatus==="approved", icon:"🏅", label:"Complete certification", desc: user?.certStatus==="pending"?"Certification under review — check status":"Apply and get your farm certified", page:"certification" },
          { done:false, icon:"🌾", label:role==="Farmer"?"List your first produce":"Browse the marketplace", desc:role==="Farmer"?"Add a product to the marketplace":"Find certified produce near you", page:role==="Farmer"?"my-produce":"marketplace" },
          { done:false, icon:"🤖", label:"Talk to AI Advisor",         desc:"Get personalised farming tips", page:"ai" },
        ].map((step,i) => (
          <div key={i} onClick={()=>!step.done&&step.page&&setPage(step.page)} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:i<3?"1px solid #f0f0f0":"none", cursor:step.done||!step.page?"default":"pointer" }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:step.done?C.primaryLight:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{step.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600,fontSize:14,color:step.done?C.primary:C.dark }}>{step.label}</div>
              <div style={{ fontSize:12,color:C.gray }}>{step.desc}</div>
            </div>
            {!step.done&&step.page&&<div style={{ color:C.primary,fontSize:18 }}>›</div>}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        {(quickActions[role]||[]).map((a,i)=>(
          <div key={i} onClick={()=>setPage(a.page)} style={{ background:"#fff",border:"1.5px solid #eee",borderRadius:12,padding:"16px",cursor:"pointer",width:160,textAlign:"center" }}>
            <div style={{ fontSize:28,marginBottom:6 }}>{a.icon}</div>
            <div style={{ fontWeight:600,fontSize:13,color:a.color }}>{a.label}</div>
            <div style={{ fontSize:11,color:C.gray,marginTop:3 }}>{a.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {fraudAlert}
      <h2 style={{ fontSize:22, fontWeight:700, marginBottom:4, color:C.dark }}>Welcome back, {user?.name || role} 👋</h2>
      <p style={{ color:C.gray, marginBottom:24, fontSize:14 }}>{new Date().toLocaleDateString("en-KE", { weekday:"long", day:"numeric", month:"long", year:"numeric" })} — {user?.county || "Kenya"}, Kenya</p>
      {/* Show incoming orders banner for Farmer/Agrovet */}
      {(role==="Farmer"||role==="Agrovet") && (() => {
        const incoming = orders.filter(o=>o.status==="pending"&&(role==="Farmer"?o._type==="produce":o._type==="input"));
        return incoming.length>0?(
          <div onClick={()=>setPage("orders")} style={{ background:"linear-gradient(90deg,#1D9E75,#0F6E56)",borderRadius:12,padding:"14px 20px",marginBottom:20,color:"#fff",display:"flex",alignItems:"center",gap:14,cursor:"pointer" }}>
            <span style={{ fontSize:28 }}>📦</span>
            <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:15 }}>You have {incoming.length} new order{incoming.length>1?"s":""}</div><div style={{ fontSize:12,opacity:0.85 }}>Tap to view and confirm</div></div>
            <span style={{ fontSize:20 }}>›</span>
          </div>
        ):null;
      })()}
      <div style={{ display:"flex", gap:16, marginBottom:28, flexWrap:"wrap" }}>
        {stats.map((s,i) => <StatCard key={i} {...s} />)}
      </div>
      {/* Trust Score Banner for Farmers */}
      {role==="Farmer" && (
        <div style={{ background:"linear-gradient(135deg,#0F6E56,#1D9E75)", borderRadius:12, padding:"1.25rem 1.5rem", marginBottom:20, color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>🏆 Gold Farmer Status</div>
            <div style={{ fontSize:13, opacity:0.85, marginTop:2 }}>You're in the top 15% of certified farmers on AgroConnect</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:32, fontWeight:700 }}>87</div>
            <div style={{ fontSize:11, opacity:0.8 }}>Trust Score</div>
          </div>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.25rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:600, fontSize:15 }}>🔔 Notifications & Activity</div>
            {notifs.filter(n=>!n.read).length > 0 && (
              <span style={{ background:C.dangerLight, color:C.danger, fontSize:11, padding:"2px 8px", borderRadius:10, fontWeight:600 }}>
                {notifs.filter(n=>!n.read).length} new
              </span>
            )}
          </div>
          {notifs.length === 0 && <div style={{ fontSize:13, color:C.gray }}>No notifications yet.</div>}
          {notifs.slice(0,6).map((n,i) => {
            const typeIcon = { order:"📦", cert:"🏅", price:"📈", alert:"⚠️", weather:"🌦️", fraud:"🚨", info:"ℹ️" };
            const isAdminPush = n.text?.startsWith("[");
            return (
              <div key={n.id||i} style={{ display:"flex", gap:10, marginBottom:12, padding:"8px 10px", borderRadius:8, background:n.read?"transparent":C.primaryLight+"88" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:isAdminPush?C.dangerLight:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>
                  {isAdminPush ? "📣" : (typeIcon[n.type]||"🔔")}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:n.read?400:500 }}>{n.text}</div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>{n.time}</div>
                </div>
                {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:C.primary, marginTop:4, flexShrink:0 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.25rem" }}>
          <div style={{ fontWeight:600, marginBottom:16, fontSize:15 }}>Quick Actions</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {actions.slice(0,6).map(({ icon, label, desc, color, page:target }) => (
              <button key={label} onClick={() => setPage(target)} style={{
                padding:"12px", background:color+"12", border:`1.5px solid ${color}22`, borderRadius:10,
                cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10,
              }}>
                <div style={{ width:34, height:34, borderRadius:8, background:color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:C.dark }}>{label}</div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:1 }}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}