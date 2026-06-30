import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/flashresult.jsx";
import { PriorityBadge } from "../components/common/prioritybadge.jsx";
import {StatusBadge }  from "../components/common/statusbadge.jsx";
import { TICKET_CATEGORIES } from "../data/mockData.js";
export default function SupportPage({ user, tickets, setTickets }) {
  const myTickets = tickets.filter(t => t.farmerId === (user?.email || "james@farm.ke"));
  const [tab, setTab] = useState("my-tickets");   // "my-tickets" | "new"
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  // New ticket form state
  const [form, setForm] = useState({ subject:"", category:"Certification", message:"", priority:"medium", assignedTo:"Extension Officer" });
  const [submitted, setSubmitted] = useState(false);

  const submitTicket = () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    const newTicket = {
      id: "TKT-" + String(tickets.length + 1).padStart(3,"0"),
      farmerId: user?.email || "james@farm.ke",
      farmerName: user?.name || "James Mwangi",
      county: user?.county || "Nakuru",
      category: form.category,
      subject: form.subject,
      message: form.message,
      status: "open",
      priority: form.priority,
      assignedTo: form.assignedTo,
      createdAt: new Date().toLocaleString("en-KE", { dateStyle:"medium", timeStyle:"short" }),
      replies: [],
    };
    setTickets(prev => [newTicket, ...prev]);
    setForm({ subject:"", category:"Certification", message:"", priority:"medium", assignedTo:"Extension Officer" });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setTab("my-tickets"); }, 2000);
  };

  const sendReply = (ticketId) => {
    if (!replyText.trim()) return;
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      replies: [...t.replies, {
        from: user?.name || "James Mwangi",
        role: "Farmer",
        text: replyText,
        time: new Date().toLocaleString("en-KE", { dateStyle:"medium", timeStyle:"short" }),
        isStaff: false,
      }],
      status: t.status === "resolved" ? "in-progress" : t.status,
    } : t));
    setReplyText("");
  };

  const openTicket = tickets.filter(t => t.farmerId === (user?.email || "james@farm.ke") && t.status === "open").length;
  const inProgressTicket = tickets.filter(t => t.farmerId === (user?.email || "james@farm.ke") && t.status === "in-progress").length;
  const resolvedTicket = tickets.filter(t => t.farmerId === (user?.email || "james@farm.ke") && t.status === "resolved").length;

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>🆘 Support Centre</h2>
          <p style={{ color:C.gray, fontSize:13, margin:"4px 0 0" }}>
            Ask questions, report issues, or get help from your extension officer or admin
          </p>
        </div>
        <button onClick={() => { setTab("new"); setSelectedTicket(null); }} style={{ padding:"9px 20px", background:C.primary, color:"#fff", border:"none", borderRadius:9, fontWeight:600, fontSize:13, cursor:"pointer" }}>
          + New Support Ticket
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display:"flex", gap:14, marginBottom:24 }}>
        {[
          { label:"Open",       value:openTicket,       color:C.info,    bg:C.infoLight    },
          { label:"In Progress",value:inProgressTicket, color:C.accent,  bg:C.accentLight  },
          { label:"Resolved",   value:resolvedTicket,   color:"#3B6D11", bg:"#EAF3DE"      },
          { label:"Total",      value:myTickets.length, color:C.gray,    bg:C.grayLight    },
        ].map(s => (
          <div key={s.label} style={{ flex:1, background:s.bg, borderRadius:10, padding:"12px 16px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:s.color, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, background:C.grayLight, borderRadius:10, padding:4, width:"fit-content", marginBottom:20 }}>
        {[["my-tickets","📋 My Tickets"],["new","✏️ New Ticket"]].map(([id,label]) => (
          <button key={id} onClick={() => { setTab(id); setSelectedTicket(null); }}
            style={{ padding:"8px 20px", background:tab===id?"#fff":"transparent", color:tab===id?C.dark:C.gray, border:"none", borderRadius:8, cursor:"pointer", fontWeight:tab===id?600:400, fontSize:13 }}>{label}</button>
        ))}
      </div>

      {/* New ticket form */}
      {tab === "new" && (
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:14, padding:"1.75rem", maxWidth:680 }}>
          {submitted ? (
            <div style={{ textAlign:"center", padding:"2rem" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:18, fontWeight:700, color:C.primary }}>Ticket Submitted!</div>
              <div style={{ color:C.gray, fontSize:13, marginTop:8 }}>Your extension officer or admin will respond shortly.</div>
            </div>
          ) : (
            <>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:18, color:C.dark }}>Raise a Support Ticket</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:5, fontWeight:500 }}>Subject *</label>
                  <input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}
                    placeholder="e.g. My certification application is pending for 2 weeks"
                    style={{ ...inp, fontSize:14 }} />
                </div>
                <div>
                  <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:5, fontWeight:500 }}>Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={sel}>
                    {TICKET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:5, fontWeight:500 }}>Priority</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={sel}>
                    <option value="low">Low — General question</option>
                    <option value="medium">Medium — Need help soon</option>
                    <option value="high">High — Urgent farm issue</option>
                    <option value="urgent">Urgent — Critical / Fraud</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:5, fontWeight:500 }}>Send to</label>
                  <select value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})} style={sel}>
                    <option value="Extension Officer">Extension Officer</option>
                    <option value="Admin">Platform Admin</option>
                    <option value="Both">Both (Extension Officer & Admin)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:5, fontWeight:500 }}>Your Location</label>
                  <input readOnly value={user?.county || "Nakuru"} style={{ ...inp, background:"#f8f8f8", color:C.gray }} />
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:5, fontWeight:500 }}>Message *</label>
                  <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
                    placeholder="Describe your issue or question in detail. Include any relevant dates, product names, or farm details..."
                    style={{ ...inp, height:120, resize:"vertical", lineHeight:1.6 }} />
                </div>
              </div>

              {/* Quick prompts */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, color:C.gray, marginBottom:8, fontWeight:500 }}>Quick templates:</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[
                    { label:"Cert pending", text:"My certification application has been pending for over 2 weeks. I have uploaded all required documents. Please advise on the current status." },
                    { label:"Fake fertilizer", text:"I received farm inputs from a certified agrovet but the products appear different from genuine ones. I suspect they may be counterfeit. Please investigate urgently." },
                    { label:"Crop disease", text:"My crop is showing unusual symptoms. The leaves are yellowing / I can see spots. Please advise on what disease this could be and the recommended treatment." },
                    { label:"Market price", text:"The prices listed in the market dashboard for my county seem outdated. Can you please update the prices for the current season?" },
                  ].map(p => (
                    <button key={p.label} onClick={() => setForm(f => ({ ...f, message:p.text }))}
                      style={{ padding:"5px 12px", background:C.primaryLight, color:C.primaryDark, border:"none", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:500 }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={submitTicket} style={{ padding:"10px 28px", background:C.primary, color:"#fff", border:"none", borderRadius:9, fontWeight:600, fontSize:14, cursor:"pointer" }}>
                  Submit Ticket
                </button>
                <button onClick={() => setTab("my-tickets")} style={{ padding:"10px 18px", background:C.grayLight, color:C.dark, border:"none", borderRadius:9, fontWeight:500, fontSize:13, cursor:"pointer" }}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* My Tickets list + thread view */}
      {tab === "my-tickets" && (
        <div style={{ display:"grid", gridTemplateColumns: selectedTicket ? "340px 1fr" : "1fr", gap:20 }}>
          {/* Ticket list */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {myTickets.length === 0 ? (
              <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"2.5rem", textAlign:"center", color:C.gray }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
                <div style={{ fontWeight:500 }}>No support tickets yet</div>
                <div style={{ fontSize:13, marginTop:4 }}>Click "+ New Support Ticket" to get started</div>
              </div>
            ) : myTickets.map(t => (
              <div key={t.id} onClick={() => setSelectedTicket(t.id === selectedTicket ? null : t.id)}
                style={{ background:"#fff", border:`2px solid ${selectedTicket===t.id?C.primary:"#eee"}`, borderRadius:12, padding:"1rem 1.25rem", cursor:"pointer", transition:"border-color 0.15s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13, color:C.dark, marginBottom:3 }}>{t.subject}</div>
                    <div style={{ fontSize:11, color:C.gray }}>{t.id} · {t.createdAt}</div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, background:C.grayLight, color:C.gray, borderRadius:5, padding:"2px 8px" }}>{t.category}</span>
                  <PriorityBadge priority={t.priority} />
                  <span style={{ fontSize:11, color:C.gray, marginLeft:"auto" }}>→ {t.assignedTo}</span>
                  {t.replies.length > 0 && <span style={{ fontSize:11, color:C.info, fontWeight:500 }}>💬 {t.replies.length} repl{t.replies.length===1?"y":"ies"}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Ticket thread */}
          {selectedTicket && (() => {
            const ticket = tickets.find(t => t.id === selectedTicket);
            if (!ticket) return null;
            return (
              <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:14, display:"flex", flexDirection:"column", minHeight:480 }}>
                {/* Thread header */}
                <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid #eee" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:C.dark, marginBottom:4 }}>{ticket.subject}</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <span style={{ fontSize:12, color:C.gray }}>{ticket.id} · {ticket.createdAt}</span>
                        <span style={{ fontSize:12, background:C.grayLight, color:C.gray, borderRadius:5, padding:"2px 8px" }}>{ticket.category}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:C.gray }}>×</button>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex:1, overflowY:"auto", padding:"1.25rem", display:"flex", flexDirection:"column", gap:14 }}>
                  {/* Original message */}
                  <div style={{ display:"flex", gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, fontWeight:700, color:C.primaryDark }}>
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
                    <div key={i} style={{ display:"flex", gap:12, flexDirection:r.isStaff?"row":"row-reverse" }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:r.isStaff?"#E6F1FB":C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>
                        {r.isStaff ? (r.role==="Admin"?"🛡️":"🎓") : "👨‍🌾"}
                      </div>
                      <div style={{ flex:1, maxWidth:"80%" }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5, flexDirection:r.isStaff?"row":"row-reverse" }}>
                          <span style={{ fontWeight:600, fontSize:13 }}>{r.from}</span>
                          <span style={{ fontSize:11, background:r.isStaff?"#E6F1FB":C.primaryLight, color:r.isStaff?C.info:C.primaryDark, borderRadius:5, padding:"1px 7px" }}>{r.role}</span>
                          <span style={{ fontSize:11, color:C.gray }}>{r.time}</span>
                        </div>
                        <div style={{ background:r.isStaff?C.infoLight:C.primary, color:r.isStaff?C.dark:"#fff", padding:"12px 16px", borderRadius:r.isStaff?"4px 16px 16px 16px":"16px 4px 16px 16px", fontSize:13, lineHeight:1.6 }}>
                          {r.text}
                        </div>
                      </div>
                    </div>
                  ))}

                  {ticket.status === "resolved" && (
                    <div style={{ textAlign:"center", padding:"12px", background:"#EAF3DE", borderRadius:10, fontSize:13, color:"#3B6D11", fontWeight:500 }}>
                      ✅ This ticket has been resolved
                    </div>
                  )}
                </div>

                {/* Reply box */}
                {ticket.status !== "closed" && (
                  <div style={{ padding:"1rem 1.25rem", borderTop:"1px solid #eee" }}>
                    <div style={{ fontSize:12, color:C.gray, marginBottom:6 }}>Reply to {ticket.assignedTo}:</div>
                    <div style={{ display:"flex", gap:10 }}>
                      <textarea value={replyText} onChange={e=>setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        onKeyDown={e => { if(e.key==="Enter" && e.ctrlKey) sendReply(ticket.id); }}
                        style={{ flex:1, padding:"9px 14px", border:"1.5px solid #ddd", borderRadius:10, fontSize:13, outline:"none", resize:"none", height:60, fontFamily:"inherit" }} />
                      <button onClick={() => sendReply(ticket.id)}
                        style={{ padding:"0 18px", background:C.primary, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:13, alignSelf:"stretch" }}>
                        Send
                      </button>
                    </div>
                    <div style={{ fontSize:11, color:C.gray, marginTop:4 }}>Ctrl + Enter to send</div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
