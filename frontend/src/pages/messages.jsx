import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { PRIVATE_THREADS } from "../data/mockData.js";
export default function MessagesPage({ role, isNewUser=false }) {
  // ── private threads: each user only sees threads where their role is a participant ──
  const EMPTY_THREADS = { Farmer:[], Buyer:[], Agrovet:[], "Extension Officer":[], Admin:[] };
  const [threads, setThreads] = useState(isNewUser ? EMPTY_THREADS : PRIVATE_THREADS);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [newTo, setNewTo] = useState("");
  const msgEndRef = useRef(null);

  // Filter threads visible to this role
  const visibleIds = Object.keys(threads).filter(id => threads[id].participants.includes(role));

  // Default to first visible thread
  const resolvedActive = activeId && visibleIds.includes(activeId) ? activeId : (visibleIds[0] || null);
  const activeThread = resolvedActive ? threads[resolvedActive] : null;

  // Scroll to bottom when messages change
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [activeThread?.messages?.length, resolvedActive]);

  const send = () => {
    if (!input.trim() || !resolvedActive) return;
    const newMsg = { id:Date.now(), sender:role, text:input.trim(), time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
    setThreads(prev => ({
      ...prev,
      [resolvedActive]: { ...prev[resolvedActive], messages:[...prev[resolvedActive].messages, newMsg], lastMsg:input.trim(), lastTime:"Just now", unread:{ ...prev[resolvedActive].unread, [role]:0 } }
    }));
    setInput("");
  };

  // Determine who the current role can message
  const ROLE_CAN_CONTACT = {
    Farmer: ["Buyer","Agrovet","Extension Officer"],
    Buyer: ["Farmer","Agrovet"],
    Agrovet: ["Farmer","Buyer"],
    "Extension Officer": ["Farmer","Admin"],
    Admin: ["Farmer","Extension Officer"],
  };
  const contactableRoles = ROLE_CAN_CONTACT[role] || [];

  const startCompose = () => { setShowCompose(true); setNewTo(""); };
  const sendNewThread = () => {
    if (!newTo.trim()) return;
    const newId = "th-new-" + Date.now();
    const otherRole = contactableRoles[0] || "Farmer";
    setThreads(prev => ({
      ...prev,
      [newId]: {
        participants: [role, otherRole],
        label: { [role]: newTo.trim() + " (" + otherRole + ")", [otherRole]: "Me" },
        avatar: { [role]:"👤", [otherRole]:"👤" },
        lastMsg: "",
        lastTime: "Now",
        unread: { [role]:0, [otherRole]:0 },
        messages:[],
      }
    }));
    setActiveId(newId);
    setShowCompose(false);
  };

  // Privacy badge per thread
  const privacyLabel = (tid) => {
    const p = threads[tid].participants;
    return p.filter(r=>r!==role).join(" & ");
  };

  // New users have no message history
  const allMessages = Object.values(threads).flat();
  if (isNewUser || allMessages.length === 0) return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:"0 0 4px" }}>💬 Messages</h2>
      <p style={{ color:C.gray, fontSize:13, margin:"0 0 24px" }}>Direct messages with buyers, farmers and agrovets.</p>
      <EmptyState
        icon="💬"
        title="No messages yet"
        desc="Your conversations with buyers, farmers and agrovets will appear here. Start by listing your produce or placing an order to connect with others."
        actionLabel={null}
      />
    </div>
  );
  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>💬 Messages</h2>
        <button onClick={startCompose} style={{ padding:"8px 18px", background:C.primary, color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>✏️ New Message</button>
      </div>

      {/* Compose modal */}
      {showCompose && (
        <Modal title="New Message" onClose={()=>setShowCompose(false)} width={400}>
          <p style={{ fontSize:13, color:C.gray, marginBottom:14 }}>
            As a <strong>{role}</strong>, you can message: <strong>{contactableRoles.join(", ")}</strong>.
          </p>
          <Field label="Recipient Name">
            <input value={newTo} onChange={e=>setNewTo(e.target.value)} placeholder="e.g. FreshMart Ltd" style={inp} />
          </Field>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <Btn onClick={sendNewThread}>Start Conversation</Btn>
            <Btn variant="ghost" onClick={()=>setShowCompose(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      <div style={{ display:"flex", background:"#fff", border:"1px solid #eee", borderRadius:12, overflow:"hidden", height:560 }}>

        {/* Sidebar – conversation list */}
        <div style={{ width:270, borderRight:"1px solid #eee", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"10px 14px", background:C.grayLight, borderBottom:"1px solid #eee", fontSize:12, color:C.gray, fontWeight:600, letterSpacing:0.3 }}>
            YOUR CONVERSATIONS
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {visibleIds.length === 0 && (
              <div style={{ padding:20, color:C.gray, fontSize:13, textAlign:"center" }}>No conversations yet. Start one!</div>
            )}
            {visibleIds.map(tid => {
              const t = threads[tid];
              const isActive = tid === resolvedActive;
              const unreadCount = t.unread[role] || 0;
              return (
                <div key={tid} onClick={()=>setActiveId(tid)} style={{ padding:"13px 15px", borderBottom:"1px solid #f5f5f5", cursor:"pointer", background:isActive ? C.primaryLight : "transparent", borderLeft: isActive ? `3px solid ${C.primary}` : "3px solid transparent" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ fontSize:18 }}>{t.avatar[role]}</span>
                      <span style={{ fontWeight:600, fontSize:13, color:C.dark }}>{t.label[role]}</span>
                    </div>
                    <span style={{ fontSize:11, color:C.gray, whiteSpace:"nowrap" }}>{t.lastTime}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingLeft:25 }}>
                    <span style={{ fontSize:12, color:C.gray, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:145 }}>{t.lastMsg || "No messages yet"}</span>
                    {unreadCount>0 && <span style={{ background:C.primary, color:"#fff", borderRadius:10, padding:"1px 7px", fontSize:11, flexShrink:0 }}>{unreadCount}</span>}
                  </div>
                  {/* Privacy indicator */}
                  <div style={{ paddingLeft:25, marginTop:3 }}>
                    <span style={{ fontSize:10, color:C.primaryDark, background:C.primaryLight, borderRadius:4, padding:"1px 6px" }}>🔒 Private: {privacyLabel(tid)} only</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        {activeThread ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
            {/* Chat header */}
            <div style={{ padding:"12px 18px", borderBottom:"1px solid #eee", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:22 }}>{activeThread.avatar[role]}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:C.dark }}>{activeThread.label[role]}</div>
                <div style={{ fontSize:11, color:C.primaryDark }}>
                  🔒 This conversation is private — visible only to {activeThread.participants.join(" & ")}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:"1rem 1.25rem", display:"flex", flexDirection:"column", gap:10 }}>
              {activeThread.messages.length === 0 && (
                <div style={{ textAlign:"center", color:C.gray, fontSize:13, marginTop:40 }}>No messages yet. Say hello! 👋</div>
              )}
              {activeThread.messages.map(m => {
                const mine = m.sender === role;
                return (
                  <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems:mine?"flex-end":"flex-start" }}>
                    {!mine && <span style={{ fontSize:11, color:C.gray, marginBottom:2, marginLeft:4 }}>{activeThread.label[role]}</span>}
                    <div style={{ maxWidth:"70%", background:mine?C.primary:C.grayLight, color:mine?"#fff":C.dark, padding:"10px 14px", borderRadius:mine?"16px 16px 4px 16px":"16px 16px 16px 4px", fontSize:13, lineHeight:1.5 }}>
                      <div>{m.text}</div>
                      <div style={{ fontSize:11, opacity:0.7, marginTop:3, textAlign:mine?"right":"left" }}>{m.time}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={msgEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding:"12px 16px", borderTop:"1px solid #eee", display:"flex", gap:10, alignItems:"center" }}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&send()}
                placeholder={`Message ${activeThread.label[role]}...`}
                style={{ flex:1, padding:"10px 16px", border:"1.5px solid #ddd", borderRadius:24, fontSize:13, outline:"none", fontFamily:"inherit" }}
              />
              <button onClick={send} style={{ padding:"10px 20px", background:C.primary, color:"#fff", border:"none", borderRadius:24, cursor:"pointer", fontWeight:600, fontSize:13 }}>Send ↑</button>
            </div>
          </div>
        ) : (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
            <div style={{ fontSize:40 }}>💬</div>
            <div style={{ color:C.gray, fontSize:14 }}>Select a conversation or start a new one</div>
            <button onClick={startCompose} style={{ padding:"9px 20px", background:C.primaryLight, color:C.primaryDark, border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>✏️ New Message</button>
          </div>
        )}
      </div>

      {/* Privacy info banner */}
      <div style={{ marginTop:14, padding:"10px 16px", background:C.infoLight, borderRadius:10, fontSize:12, color:C.info, display:"flex", alignItems:"center", gap:8 }}>
        🔒 <strong>Message Privacy:</strong>&nbsp;
        {role==="Farmer" && "Your conversations with Buyers are private from Agrovets, and conversations with Agrovets are private from Buyers."}
        {role==="Buyer" && "Your conversations with Farmers are private from Agrovets, and conversations with Agrovets are private from Farmers."}
        {role==="Agrovet" && "Your conversations with Farmers are private from Buyers, and conversations with Buyers are private from Farmers."}
        {(role==="Extension Officer"||role==="Admin") && "Your conversations are private between you and the other participant only."}
      </div>
    </div>
  );
}