import { useState } from "react";
import { C } from "../utils/constants.js";
import { useLang } from "../utils/lang.js";

export default function Sidebar({ role, page, setPage, unread, supportBadge }) {
  const { t } = useLang();
  const menus = {
    Farmer: [
      { id:"dashboard",    icon:"📊", label:t("Dashboard") },
      { id:"marketplace",  icon:"🏪", label:t("Marketplace") },
      { id:"farm-inputs",  icon:"🌿", label:t("Farm Inputs") },
      { id:"my-produce",   icon:"🌾", label:t("My Produce") },
      { id:"orders",       icon:"📦", label:t("Orders") },
      { id:"farm-diary",   icon:"📋", label:t("Farm Diary") },
      { id:"ratings",      icon:"⭐", label:t("Ratings & Reviews") },
      { id:"certification",icon:"🏅", label:t("Certification") },
      { id:"messages",     icon:"💬", label:t("Messages"), badge:unread },
      { id:"support",      icon:"🆘", label:t("Support"), badge:supportBadge },
      { id:"transport",    icon:"🚛", label:t("Transport") },
      { id:"tutorials",    icon:"📚", label:t("E-Learning") },
      { id:"map",          icon:"🗺️", label:t("Farm Map") },
      { id:"weather",      icon:"🌦️", label:t("Weather") },
      { id:"market-prices",icon:"📈", label:t("Market Prices") },
      { id:"traceability", icon:"🔍", label:t("Traceability") },
      { id:"mpesa",        icon:"💳", label:t("M-Pesa Pay") },
      { id:"delivery",     icon:"🚚", label:t("Delivery Track") },
      { id:"pdf-reports",  icon:"📄", label:t("PDF Reports") },
    ],
    Buyer: [
      { id:"dashboard",    icon:"📊", label:t("Dashboard") },
      { id:"marketplace",  icon:"🏪", label:t("Marketplace") },
      { id:"orders",       icon:"📦", label:t("My Orders") },
      { id:"ratings",      icon:"⭐", label:t("Ratings & Reviews") },
      { id:"messages",     icon:"💬", label:t("Messages"), badge:unread },
      { id:"traceability", icon:"🔍", label:t("Verify Produce") },
      { id:"market-prices",icon:"📈", label:t("Market Prices") },
      { id:"mpesa",        icon:"💳", label:t("M-Pesa Pay") },
      { id:"delivery",     icon:"🚚", label:t("Delivery Track") },
    ],
    Agrovet: [
      { id:"dashboard",    icon:"📊", label:t("Dashboard") },
      { id:"marketplace",  icon:"🏪", label:t("Marketplace") },
      { id:"farm-inputs",  icon:"🌿", label:t("Farm Inputs") },
      { id:"products",     icon:"💊", label:t("My Products") },
      { id:"orders",       icon:"📦", label:t("Orders") },
      { id:"ratings",      icon:"⭐", label:t("Ratings & Reviews") },
      { id:"transport",    icon:"🚛", label:t("Transport") },
      { id:"messages",     icon:"💬", label:t("Messages"), badge:unread },
      { id:"mpesa",        icon:"💳", label:t("M-Pesa Pay") },
      { id:"pdf-reports",  icon:"📄", label:t("PDF Reports") },
    ],
    "Extension Officer": [
      { id:"dashboard",    icon:"📊", label:t("Dashboard") },
      { id:"certification",icon:"🏅", label:t("Certifications") },
      { id:"farmers",      icon:"👨‍🌾",label:t("Farmers") },
      { id:"tutorials",    icon:"📚", label:t("Tutorials") },
      { id:"messages",     icon:"💬", label:t("Messages"), badge:unread },
      { id:"support-inbox",icon:"🎧", label:t("Support Inbox"), badge:supportBadge },
      { id:"map",          icon:"🗺️", label:t("Farm Map") },
      { id:"users",        icon:"👥", label:t("Invite Users") },
      { id:"pdf-reports",  icon:"📄", label:t("PDF Reports") },
    ],
    Admin: [
      { id:"dashboard",    icon:"📊", label:t("Dashboard") },
      { id:"users",        icon:"👥", label:t("Users") },
      { id:"marketplace",  icon:"🏪", label:t("Marketplace") },
      { id:"farm-inputs",  icon:"🌿", label:t("Farm Inputs") },
      { id:"certification",icon:"🏅", label:t("Certifications") },
      { id:"transport",    icon:"🚛", label:t("Transport") },
      { id:"analytics",    icon:"📈", label:t("Analytics") },
      { id:"map",          icon:"🗺️", label:t("Farm Map") },
      { id:"support-inbox",icon:"🎧", label:t("Support Inbox"), badge:supportBadge },
      { id:"pdf-reports",  icon:"📄", label:t("PDF Reports") },
    ],
  };
  const items = menus[role] || menus.Farmer;

  return (
    <div style={{ width:220, background:"#0F6E56", minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      {/* Header with maize image replacing seedling icon */}
      <div style={{ padding:"1.25rem 1rem 0.75rem", borderBottom:"1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:8, overflow:"hidden",
            border:"2px solid rgba(255,255,255,0.3)", flexShrink:0,
            background:"#0a5240"
          }}>
            <img
              src="/maize.png"
              alt="Maize"
              style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}
              onError={e => { e.target.style.display="none"; e.target.parentNode.innerHTML="🌽"; }}
            />
          </div>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>AgroConnect</div>
            <div style={{ color:"rgba(255,255,255,0.55)", fontSize:10 }}>Murang'a Platform</div>
          </div>
        </div>
      </div>
      <nav style={{ padding:"0.75rem 0.6rem", flex:1, overflowY:"auto" }}>
        {items.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            width:"100%", display:"flex", alignItems:"center", gap:9,
            padding:"8px 10px", borderRadius:7, marginBottom:1, border:"none", cursor:"pointer",
            background: page===item.id ? "rgba(255,255,255,0.18)" : "transparent",
            color: page===item.id ? "#fff" : "rgba(255,255,255,0.7)",
            fontSize:12.5, fontWeight: page===item.id ? 600 : 400, textAlign:"left",
          }}>
            <span style={{ fontSize:13.5 }}>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
            {item.badge ? <span style={{ background:C.danger, color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:11 }}>{item.badge}</span> : null}
          </button>
        ))}
      </nav>
    </div>
  );
}
