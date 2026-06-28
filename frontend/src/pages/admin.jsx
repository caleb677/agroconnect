import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/flashresult.jsx";
export default function AdminUserViewer({ user, onClose, onVerify, onToggle, onRemove, isAdmin }) {
  const [docs, setDocs] = useState(null);
  const [cert, setCert] = useState(null);
  const [tab, setTab]   = useState("profile"); // profile | docs | cert
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    Promise.all([
      UserDB.loadAllDocs(user.email),
      UserDB.loadCert(user.email),
    ]).then(([d, c]) => { setDocs(d); setCert(c); }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.email]);

  const tabs = [{ k:"profile", label:"👤 Profile" }, { k:"docs", label:"📎 Documents" }, { k:"cert", label:"🏅 Certification" }];
  const statusColor = { approved:C.primary, pending:C.accent, none:C.gray }[user?.certStatus || "none"] || C.gray;

  const DocCard = ({ label, icon, src }) => (
    <div style={{ border:"1.5px solid #eee", borderRadius:10, overflow:"hidden", background:"#fafafa" }}>
      <div style={{ padding:"8px 12px", background:C.grayLight, fontSize:12, fontWeight:600, color:C.dark }}>{icon} {label}</div>
      {src ? (
        src.startsWith("data:image") ? (
          <img src={src} alt={label} style={{ width:"100%", maxHeight:180, objectFit:"cover", display:"block" }} />
        ) : (
          <div style={{ padding:"1rem", textAlign:"center", color:C.primary, fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:6 }}>📄</div>
            <a href={src} download={label} style={{ color:C.primary }}>Download {label}</a>
          </div>
        )
      ) : (
        <div style={{ padding:"1.5rem", textAlign:"center", color:C.gray, fontSize:12 }}>Not uploaded</div>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"0 0 16px", borderBottom:"1px solid #f0f0f0", marginBottom:16 }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, overflow:"hidden", flexShrink:0 }}>
          {docs?.profilePhoto ? <img src={docs.profilePhoto} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="photo" /> : "👤"}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:16, color:C.dark }}>{user?.name}</div>
          <div style={{ fontSize:12, color:C.gray }}>{user?.role} · {user?.county||user?.location}, Kenya</div>
          <div style={{ fontSize:12, color:C.gray }}>{user?.email} · {user?.phone}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:statusColor+"20", color:statusColor, fontWeight:600, marginBottom:4 }}>
            {user?.certStatus === "approved" ? "✅ Certified" : user?.certStatus === "pending" ? "⏳ Pending" : "⭕ Not certified"}
          </div>
          <div style={{ fontSize:11, color:C.gray }}>Joined {user?.joined||user?.joinedAt||"—"}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {tabs.map(t => (
          <button key={t.k} onClick={()=>setTab(t.k)} style={{ padding:"6px 14px", borderRadius:7, border:"none", cursor:"pointer", background:tab===t.k?C.primary:C.grayLight, color:tab===t.k?"#fff":C.dark, fontSize:12, fontWeight:600 }}>{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign:"center", padding:"2rem", color:C.gray, fontSize:13 }}>Loading data…</div>}

      {!loading && tab === "profile" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            ["Full Name",  user?.name],
            ["Role",       user?.role],
            ["Email",      user?.email],
            ["Phone",      user?.phone],
            ["Sub-County", user?.county||user?.location],
            ["Joined",     user?.joined||user?.joinedAt],
            ["Status",     user?.status],
            ["Produce/Type", user?.produce||user?.bizType||user?.dept||"—"],
          ].map(([label,val]) => (
            <div key={label} style={{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:8, padding:"10px 12px" }}>
              <div style={{ fontSize:11, color:C.gray, marginBottom:2 }}>{label}</div>
              <div style={{ fontSize:13, fontWeight:600, color:C.dark, wordBreak:"break-all" }}>{val||"—"}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "docs" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <DocCard label="National ID"        icon="🪪" src={docs?.nationalId} />
          <DocCard label="Farm Photo"         icon="📷" src={docs?.farmPhoto} />
          <DocCard label="Training Certificate" icon="📜" src={docs?.trainingCert} />
          <DocCard label="Soil/Farm Report"   icon="🧪" src={docs?.soilReport} />
        </div>
      )}

      {!loading && tab === "cert" && (
        <div>
          {cert ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                ["Cert Status",  cert.status],
                ["Cert ID",      cert.certId||"Pending"],
                ["Produce",      cert.produce||"—"],
                ["Issued",       cert.issued||"—"],
                ["Expiry",       cert.expiry||"—"],
                ["Training Done",cert.training?"Yes":"No"],
                ["Docs Complete",cert.docsComplete?"Yes":"No"],
                ["Last Updated", cert.updatedAt ? new Date(cert.updatedAt).toLocaleDateString("en-KE") : "—"],
              ].map(([label,val]) => (
                <div key={label} style={{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:11, color:C.gray, marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.dark }}>{val||"—"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"2rem", color:C.gray, fontSize:13 }}>No certification record found for this user.</div>
          )}
        </div>
      )}

      {/* Admin actions */}
      {isAdmin && (
        <div style={{ display:"flex", gap:8, marginTop:20, paddingTop:16, borderTop:"1px solid #f0f0f0", flexWrap:"wrap" }}>
          {!user?.verified && <button onClick={onVerify} style={{ padding:"8px 16px", borderRadius:8, background:C.primary, color:"#fff", border:"none", cursor:"pointer", fontSize:13, fontWeight:600 }}>✅ Verify</button>}
          <button onClick={onToggle} style={{ padding:"8px 16px", borderRadius:8, background:C.accentLight, color:C.accent, border:"none", cursor:"pointer", fontSize:13, fontWeight:600 }}>{user?.status==="active"?"⏸ Suspend":"▶ Activate"}</button>
          <button onClick={onRemove} style={{ padding:"8px 16px", borderRadius:8, background:C.dangerLight, color:C.danger, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, marginLeft:"auto" }}>🗑️ Remove</button>
        </div>
      )}
    </div>
  );
}