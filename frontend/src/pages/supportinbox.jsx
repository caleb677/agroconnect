import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { TICKET_CATEGORIES } from "../data/mockData.js";
import {StatusBadge } from "../components/common/statusbadge.jsx";
import { PriorityBadge } from "../components/common/prioritybadge.jsx";
export default function SupportInboxPage({ user, tickets, setTickets }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");

  const role = user?.role || "Extension Officer";

  // Smart routing: show only tickets where this role is the right handler
  // Route logic mirrors TICKET_CATEGORIES assignTo rules
  const ROUTING_MAP = {
    "Certification":        "Extension Officer",
    "Weather & Crops":      "Extension Officer",
    "Training & Extension": "Extension Officer",
    "Farm Inputs":          "Admin",
    "Market & Pricing":     "Admin",
    "Payments & Orders":    "Admin",
    "Transport & Logistics":"Admin",
    "Account & Access":     "Admin",
    "Other":                "Admin",
  };
  const getAssignee = (ticket) => {
    const cat = TICKET_CATEGORIES.find(c => c.key === ticket.category);
    return cat?.assignTo || ticket.assignedTo || "Admin";
  };
  const relevant = tickets.filter(t => {
    if (role === "Admin") return true; // Admin sees everything
    const assignee = getAssignee(t);
    return assignee === role;
  });

  // Auto-route new tickets: update assignedTo if missing/wrong
  useEffect(() => {
    setTickets(prev => prev.map(t => {
      const correct = getAssignee(t);
      if (t.assignedTo !== correct && role === "Admin") {
        return { ...t, assignedTo: correct };
      }
      return t;
    }));
  }, []);

  const filtered = relevant.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.farmerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const updateStatus = (ticketId, newStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status:newStatus } : t));
    if (selectedTicket === ticketId && newStatus === "closed") setSelectedTicket(null);
  };

  const sendReply = (ticketId) => {
    if (!replyText.trim()) return;
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      replies: [...t.replies, {
        from: user?.name || role,
        role,
        text: replyText,
        time: new Date().toLocaleString("en-KE", { dateStyle:"medium", timeStyle:"short" }),
        isStaff: true,
      }],
      status: t.status === "open" ? "in-progress" : t.status,
    } : t));
    setReplyText("");
  };

  const openCount = relevant.filter(t => t.status === "open").length;
  const urgentCount = relevant.filter(t => t.priority === "urgent").length;
  const inProgressCount = relevant.filter(t => t.status === "in-progress").length;

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>🎧 Support Inbox</h2>
        <p style={{ color:C.gray, fontSize:13, margin:"4px 0 0" }}>Farmer questions, issues & requests assigned to you</p>
      </div>

      {/* Stats strip */}
      <div style={{ display:"flex", gap:14, marginBottom:24 }}>
        {[
          { label:"Open",       value:openCount,       color:C.info,    bg:C.infoLight    },
          { label:"In Progress",value:inProgressCount, color:C.accent,  bg:C.accentLight  },
          { label:"Urgent",     value:urgentCount,     color:C.danger,  bg:C.dangerLight  },
          { label:"Total",      value:relevant.length, color:C.gray,    bg:C.grayLight    },
        ].map(s => (
          <div key={s.label} style={{ flex:1, background:s.bg, borderRadius:10, padding:"12px 16px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:s.color, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by farmer name or subject..."
          style={{ flex:1, minWidth:200, padding:"8px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:13, outline:"none" }} />
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{ padding:"8px 12px", border:"1px solid #ddd", borderRadius:8, fontSize:13, outline:"none", background:"#fff" }}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}
          style={{ padding:"8px 12px", border:"1px solid #ddd", borderRadius:8, fontSize:13, outline:"none", background:"#fff" }}>
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
  <option value="all">All Categories</option>
  {TICKET_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
</select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: selectedTicket ? "360px 1fr" : "1fr", gap:20 }}>
        {/* Ticket list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.length === 0 ? (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"2.5rem", textAlign:"center", color:C.gray }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
              <div style={{ fontWeight:500 }}>No tickets found</div>
              <div style={{ fontSize:13, marginTop:4 }}>Try adjusting your filters</div>
            </div>
          ) : filtered.map(t => (
            <div key={t.id} onClick={() => { setSelectedTicket(t.id === selectedTicket ? null : t.id); setReplyText(""); }}
              style={{ background:"#fff", border:`2px solid ${selectedTicket===t.id?C.primary:t.priority==="urgent"?C.danger+"55":"#eee"}`, borderRadius:12, padding:"1rem 1.25rem", cursor:"pointer", transition:"border-color 0.15s", position:"relative" }}>
              {t.priority === "urgent" && <div style={{ position:"absolute", top:10, right:10, background:C.danger, color:"#fff", borderRadius:5, padding:"2px 8px", fontSize:11, fontWeight:600 }}>🚨 URGENT</div>}
              <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.primaryDark, fontSize:14, flexShrink:0 }}>
                  {t.farmerName.split(" ").map(w=>w[0]).join("").slice(0,2)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:C.dark, marginBottom:2 }}>{t.subject}</div>
                  <div style={{ fontSize:12, color:C.gray }}>👨‍🌾 {t.farmerName} · 📍 {t.county}</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:C.gray, marginBottom:8, lineHeight:1.5 }}>
                {t.message.length > 90 ? t.message.slice(0,90)+"..." : t.message}
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                <StatusBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
                <span style={{ fontSize:11, background:C.grayLight, color:C.gray, borderRadius:5, padding:"2px 8px" }}>{t.category}</span>
                <span style={{ fontSize:11, color:C.gray, marginLeft:"auto" }}>{t.createdAt}</span>
              </div>
              {t.replies.length > 0 && (
                <div style={{ marginTop:6, fontSize:11, color:C.info, fontWeight:500 }}>
                  💬 {t.replies.length} message{t.replies.length>1?"s":""} · Last: {t.replies[t.replies.length-1].from}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ticket thread view */}
        {selectedTicket && (() => {
          const ticket = tickets.find(t => t.id === selectedTicket);
          if (!ticket) return null;
          return (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:14, display:"flex", flexDirection:"column", maxHeight:"80vh" }}>
              {/* Thread header */}
              <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid #eee" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:C.dark, marginBottom:6 }}>{ticket.subject}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                      <span style={{ fontSize:12, background:C.grayLight, color:C.gray, borderRadius:5, padding:"2px 8px" }}>{ticket.category}</span>
                      <span style={{ fontSize:12, color:C.gray }}>{ticket.id}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:C.gray }}>×</button>
                </div>
                {/* Farmer info bar */}
                <div style={{ background:C.grayLight, borderRadius:8, padding:"8px 12px", display:"flex", gap:16, fontSize:12 }}>
                  <span>👨‍🌾 <strong>{ticket.farmerName}</strong></span>
                  <span>📍 {ticket.county}</span>
                  <span>📅 {ticket.createdAt}</span>
                  <span>→ Assigned to: <strong>{ticket.assignedTo}</strong></span>
                </div>
                {/* Quick status actions */}
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  {ticket.status !== "in-progress" && ticket.status !== "closed" && (
                    <button onClick={() => updateStatus(ticket.id,"in-progress")} style={{ padding:"5px 14px", background:C.accentLight, color:C.accent, border:"none", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:500 }}>▶ Mark In Progress</button>
                  )}
                  {ticket.status !== "resolved" && ticket.status !== "closed" && (
                    <button onClick={() => updateStatus(ticket.id,"resolved")} style={{ padding:"5px 14px", background:"#EAF3DE", color:"#3B6D11", border:"none", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:500 }}>✅ Mark Resolved</button>
                  )}
                  {ticket.status !== "closed" && (
                    <button onClick={() => updateStatus(ticket.id,"closed")} style={{ padding:"5px 14px", background:C.grayLight, color:C.gray, border:"none", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:500 }}>🔒 Close</button>
                  )}
                  {role === "Admin" && (
                    <button onClick={() => setTickets(prev => prev.map(t => t.id===ticket.id ? {...t, priority:"urgent"} : t))} style={{ padding:"5px 14px", background:C.dangerLight, color:C.danger, border:"none", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:500 }}>🚨 Escalate</button>
                  )}
                </div>
              </div>

              {/* Messages thread */}
              <div style={{ flex:1, overflowY:"auto", padding:"1.25rem", display:"flex", flexDirection:"column", gap:14 }}>
                {/* Original message */}
                <div style={{ display:"flex", gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.primaryDark, fontSize:14, flexShrink:0 }}>
                    {ticket.farmerName.split(" ").map(w=>w[0]).join("").slice(0,2)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5 }}>
                      <span style={{ fontWeight:600, fontSize:13 }}>{ticket.farmerName}</span>
                      <span style={{ fontSize:11, background:C.primaryLight, color:C.primaryDark, borderRadius:5, padding:"1px 7px" }}>Farmer</span>
                      <span style={{ fontSize:11, color:C.gray }}>{ticket.createdAt}</span>
                    </div>
                    <div style={{ background:C.grayLight, padding:"12px 16px", borderRadius:"4px 16px 16px 16px", fontSize:13, color:C.dark, lineHeight:1.6 }}>
                      {ticket.message}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {ticket.replies.map((r, i) => (
                  <div key={i} style={{ display:"flex", gap:12, flexDirection:r.isStaff?"row-reverse":"row" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:r.isStaff?C.infoLight:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                      {r.isStaff ? (r.role==="Admin"?"🛡️":"🎓") : "👨‍🌾"}
                    </div>
                    <div style={{ flex:1, maxWidth:"80%" }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5, flexDirection:r.isStaff?"row-reverse":"row" }}>
                        <span style={{ fontWeight:600, fontSize:13 }}>{r.from}</span>
                        <span style={{ fontSize:11, background:r.isStaff?C.infoLight:C.primaryLight, color:r.isStaff?C.info:C.primaryDark, borderRadius:5, padding:"1px 7px" }}>{r.role}</span>
                        <span style={{ fontSize:11, color:C.gray }}>{r.time}</span>
                      </div>
                      <div style={{ background:r.isStaff?C.info:"#fff", border:r.isStaff?"none":"1px solid #eee", color:r.isStaff?"#fff":C.dark, padding:"12px 16px", borderRadius:r.isStaff?"16px 4px 16px 16px":"4px 16px 16px 16px", fontSize:13, lineHeight:1.6 }}>
                        {r.text}
                      </div>
                    </div>
                  </div>
                ))}

                {ticket.status === "resolved" && (
                  <div style={{ textAlign:"center", padding:"12px", background:"#EAF3DE", borderRadius:10, fontSize:13, color:"#3B6D11", fontWeight:500 }}>
                    ✅ Ticket resolved by {role}
                  </div>
                )}
              </div>

              {/* Reply box */}
              {ticket.status !== "closed" && (
                <div style={{ padding:"1rem 1.25rem", borderTop:"1px solid #eee" }}>
                  <div style={{ fontSize:12, color:C.gray, marginBottom:6 }}>Reply to {ticket.farmerName}:</div>
                  {/* Quick reply templates for staff */}
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                    {[
                      "I have received your query and will look into it.",
                      "Please upload the remaining documents to proceed.",
                      "A field visit has been scheduled for next week.",
                      "Your application has been approved. Congratulations!",
                    ].map(t => (
                      <button key={t} onClick={() => setReplyText(t)}
                        style={{ padding:"3px 10px", background:C.infoLight, color:C.info, border:"none", borderRadius:12, fontSize:11, cursor:"pointer", fontWeight:500 }}>
                        {t.slice(0,30)}...
                      </button>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <textarea value={replyText} onChange={e=>setReplyText(e.target.value)}
                      placeholder="Type your response to the farmer..."
                      onKeyDown={e => { if(e.key==="Enter" && e.ctrlKey) sendReply(ticket.id); }}
                      style={{ flex:1, padding:"9px 14px", border:"1.5px solid #ddd", borderRadius:10, fontSize:13, outline:"none", resize:"none", height:70, fontFamily:"inherit" }} />
                    <button onClick={() => sendReply(ticket.id)}
                      style={{ padding:"0 20px", background:C.info, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:13, alignSelf:"stretch" }}>
                      Reply
                    </button>
                  </div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:4 }}>Ctrl + Enter to send quickly</div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}