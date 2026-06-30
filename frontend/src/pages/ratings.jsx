import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/flashresult.jsx";
import { MOCK_RATINGS, PENDING_RATINGS } from "../data/mockData.js";
import StarRow from "../components/common/starrow.jsx";
export default function RatingsPage({ role, isNewUser = false, np }) {
  const [ratings]       = useState(MOCK_RATINGS);
  const [pending, setPending] = useState(PENDING_RATINGS);
  const [rateModal, setRateModal] = useState(null); // pending item being rated
  const [score, setScore]         = useState(0);
  const [comment, setComment]     = useState("");
  const [tab, setTab]             = useState("received");
  const [flash, setFlash]         = useState(null);

  const myName = role === "Farmer" ? "James Mwangi" : role === "Buyer" ? "FreshMart Ltd" : "AgriVet Plus";
  const received = ratings.filter(r => r.target === myName);
  const given    = ratings.filter(r => r.from   === myName);
  const avg      = received.length ? (received.reduce((a,r)=>a+r.score,0)/received.length).toFixed(1) : "—";
  const myPending = pending.filter(p => role === "Buyer" ? p.counterpartRole === "Farmer" : p.counterpartRole === "Buyer" || p.counterpartRole === "Agrovet");

  const submitRating = () => {
    if (score === 0) return;
    setPending(prev => prev.filter(p => p.orderId !== rateModal.orderId));
    setRateModal(null);
    setScore(0);
    setComment("");
    setFlash({ type:"success", title:"Review submitted!", sub:"Thank you for your feedback." });
  };

  const scoreColors = { 5:"#1D9E75", 4:"#378ADD", 3:"#BA7517", 2:"#E24B4A", 1:"#E24B4A" };

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {flash && <FlashResult type={flash.type} title={flash.title} sub={flash.sub} onDone={()=>setFlash(null)} />}

      {/* Rate modal */}
      {rateModal && (
        <Modal title={`Rate ${rateModal.counterpart}`} onClose={()=>{setRateModal(null);setScore(0);setComment("");}}>
          <div style={{ background:C.grayLight, borderRadius:10, padding:"12px 14px", marginBottom:18, fontSize:13 }}>
            <strong>Order:</strong> {rateModal.orderId} · {rateModal.product} · {rateModal.date}
          </div>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <p style={{ color:C.gray, fontSize:13, marginBottom:12 }}>How would you rate your experience with <strong>{rateModal.counterpart}</strong>?</p>
            <StarRow value={score} onChange={setScore} size={40} />
            {score > 0 && (
              <div style={{ marginTop:10, fontSize:13, fontWeight:600, color:scoreColors[score] }}>
                {["","Poor","Below Average","Average","Good","Excellent"][score]}
              </div>
            )}
          </div>
          <Field label="Leave a comment (optional)">
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your experience — quality, communication, delivery..." rows={3} style={{ ...inp, resize:"vertical" }} />
          </Field>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button onClick={submitRating} disabled={score===0} style={{ flex:1, padding:"11px", background:score>0?C.primary:"#ccc", color:"#fff", border:"none", borderRadius:9, fontWeight:600, fontSize:14, cursor:score>0?"pointer":"not-allowed" }}>Submit Review</button>
            <Btn variant="ghost" onClick={()=>{setRateModal(null);setScore(0);setComment("");}}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>⭐ Ratings & Reviews</h2>
          <p style={{ color:C.gray, fontSize:13, margin:"4px 0 0" }}>Your reputation on the AgroConnect platform</p>
        </div>
        {/* trust score summary */}
        <div style={{ background:"linear-gradient(135deg,#0F6E56,#1D9E75)", borderRadius:14, padding:"14px 22px", color:"#fff", textAlign:"center", minWidth:130 }}>
          <div style={{ fontSize:32, fontWeight:800, lineHeight:1 }}>{avg}</div>
          <div style={{ marginTop:4 }}><StarRow value={Math.round(Number(avg)||0)} size={14} /></div>
          <div style={{ fontSize:11, opacity:0.8, marginTop:4 }}>{received.length} review{received.length!==1?"s":""}</div>
        </div>
      </div>

      {/* Pending to rate */}
      {myPending.length > 0 && (
        <div style={{ background:C.accentLight, border:`1.5px solid ${C.accent}`, borderRadius:12, padding:"1rem 1.25rem", marginBottom:20 }}>
          <div style={{ fontWeight:700, fontSize:14, color:C.accent, marginBottom:10 }}>⏳ Awaiting Your Review ({myPending.length})</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {myPending.map(p => (
              <div key={p.orderId} style={{ background:"#fff", borderRadius:9, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <span style={{ fontWeight:600, fontSize:13 }}>{p.product}</span>
                  <span style={{ color:C.gray, fontSize:12 }}> · {p.counterpart} · {p.date}</span>
                </div>
                <button onClick={()=>{setRateModal(p);setScore(0);setComment("");}} style={{ padding:"6px 16px", background:C.primary, color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:600, fontSize:12 }}>Rate Now ⭐</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:16, background:"#f1f1ef", borderRadius:9, padding:3, width:"fit-content" }}>
        {[["received","Reviews I Received"],["given","Reviews I Gave"]].map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{ padding:"7px 20px", borderRadius:7, border:"none", cursor:"pointer", fontWeight:600, fontSize:13, background:tab===key?"#fff":        "transparent", color:tab===key?C.dark:C.gray, boxShadow:tab===key?"0 1px 4px rgba(0,0,0,0.1)":"none" }}>{label}</button>
        ))}
      </div>

      {/* Review cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {(tab==="received"?received:given).length===0 && (
          <div style={{ textAlign:"center", padding:"3rem", color:C.gray, fontSize:14 }}>No reviews {tab==="received"?"received":"given"} yet.</div>
        )}
        {(tab==="received" ? received : given).map(r => (
          <div key={r.id} style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1rem 1.25rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:38, height:38, background:C.primaryLight, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:15, color:C.primaryDark }}>
                  {(tab==="received"?r.from:r.target).charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.dark }}>{tab==="received"?r.from:r.target}</div>
                  <div style={{ fontSize:11, color:C.gray }}>{r.role} · {r.produce} · {r.order}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <StarRow value={r.score} size={16} />
                <div style={{ fontSize:11, color:C.gray, marginTop:3 }}>{r.date}</div>
              </div>
            </div>
            {r.comment && <p style={{ fontSize:13, color:"#444", margin:0, lineHeight:1.6, background:C.grayLight, borderRadius:8, padding:"8px 12px" }}>"{r.comment}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
