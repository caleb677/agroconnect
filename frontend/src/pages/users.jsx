import { useState, useEffect } from "react";
import { C, inp } from "../utils/constants.js";
import { HIERARCHY, SUBCOUNTIES, getWards, getLocations, scopeMatch } from "../data/hierarchy.js";
import Alert from "../components/common/alert.jsx";

const ROLES_ORDER = ["Extension Officer","Farmer","Buyer","Agrovet"];
const ROLE_ICONS  = { "Extension Officer":"🎓", Farmer:"👨‍🌾", Buyer:"🏢", Agrovet:"💊", Admin:"🛡️" };

function seedUsers() {
  try { return JSON.parse(localStorage.getItem("ac_users_v2") || "[]"); } catch { return []; }
}
function saveUsers(u) { localStorage.setItem("ac_users_v2", JSON.stringify(u)); }

const DEMO_USERS = [
  { id:1,  name:"James Mwangi",    role:"Farmer",            subcounty:"Kandara",  ward:"Muruka",      location:"Muruka Location",      phone:"0712345678", email:"james@farm.ke",   status:"active" },
  { id:2,  name:"Mary Wanjiru",    role:"Farmer",            subcounty:"Kiharu",   ward:"Wangu",       location:"Wangu Location",       phone:"0723456789", email:"mary@farm.ke",    status:"active" },
  { id:3,  name:"Dr. Sam Otieno",  role:"Extension Officer", subcounty:"Kandara",  ward:"Muruka",      location:"Muruka Location",      phone:"0744556677", email:"sam@agri.go.ke",  status:"active" },
  { id:4,  name:"Peter Njoroge",   role:"Buyer",             subcounty:"Kigumo",   ward:"Kangari",     location:"Kangari Location",     phone:"0733445566", email:"peter@buy.ke",    status:"active" },
  { id:5,  name:"Anne Waweru",     role:"Agrovet",           subcounty:"Mathioya", ward:"Gitugi",      location:"Gitugi Location",      phone:"0755667788", email:"anne@vet.ke",     status:"active" },
  { id:6,  name:"Grace Njeri",     role:"Farmer",            subcounty:"Maragwa",  ward:"Makuyu",      location:"Makuyu Location",      phone:"0766778899", email:"grace@farm.ke",   status:"active" },
  { id:7,  name:"John Kamau",      role:"Extension Officer", subcounty:"Kigumo",   ward:"Kinyona",     location:"Kinyona Location",     phone:"0799112233", email:"john@agri.go.ke", status:"active" },
  { id:8,  name:"Sarah Kimani",    role:"Farmer",            subcounty:"Gatanga",  ward:"Gatanga",     location:"Gatanga Location",     phone:"0711223344", email:"sarah@farm.ke",   status:"pending" },
];

export default function UsersPage({ role: actorRole, user: actor }) {
  const [users,    setUsers]    = useState(() => { const s = seedUsers(); return s.length ? s : DEMO_USERS; });
  const [search,   setSearch]   = useState("");
  const [filterSC, setFilterSC] = useState("");
  const [filterW,  setFilterW]  = useState("");
  const [filterR,  setFilterR]  = useState("");
  const [flash,    setFlash]    = useState(null);
  const [confirm,  setConfirm]  = useState(null); // user id to delete

  const isAdmin = actorRole === "Admin";
  const isExtension = actorRole === "Extension Officer";

  // Scope of the current officer
  const actorScope = {
    subcounty: actor?.county || actor?.subcounty || "",
    ward:      actor?.ward   || "",
    location:  actor?.location || "",
  };

  // What the current user is allowed to see
  const visible = users.filter(u => {
    if (isAdmin) return true;
    if (isExtension) return u.subcounty === actorScope.subcounty;
    return false; // normal users don't see user list
  });

  const filtered = visible.filter(u => {
    const q = search.toLowerCase();
    const matchQ  = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    const matchSC = !filterSC || u.subcounty === filterSC;
    const matchW  = !filterW  || u.ward === filterW;
    const matchR  = !filterR  || u.role === filterR;
    return matchQ && matchSC && matchW && matchR;
  });

  const canDelete = (target) => {
    if (isAdmin) return true;
    if (isExtension && ["Farmer","Buyer","Agrovet"].includes(target.role)) {
      return target.subcounty === actorScope.subcounty;
    }
    return false;
  };

  const deleteUser = (id) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
    setFlash({ type:"success", msg:"User removed successfully." });
    setConfirm(null);
  };

  const toggleStatus = (id) => {
    if (!isAdmin) return;
    const updated = users.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u);
    setUsers(updated);
    saveUsers(updated);
    setFlash({ type:"success", msg:"User status updated." });
  };

  const wardsForFilter = filterSC ? getWards(filterSC) : [];

  const stats = {
    total:     visible.length,
    farmers:   visible.filter(u => u.role === "Farmer").length,
    buyers:    visible.filter(u => u.role === "Buyer").length,
    agrovets:  visible.filter(u => u.role === "Agrovet").length,
    extension: visible.filter(u => u.role === "Extension Officer").length,
    active:    visible.filter(u => u.status === "active").length,
  };

  if (!isAdmin && !isExtension) {
    return (
      <div style={{ padding:"3rem", textAlign:"center", color:"#888" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🔒</div>
        <div style={{ fontSize:16, fontWeight:600 }}>Access Restricted</div>
        <div style={{ fontSize:13, marginTop:6 }}>Only Extension Officers and Admins can view this page.</div>
      </div>
    );
  }

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>
          {isAdmin ? "👥 All Platform Users" : "👥 " + actorScope.subcounty + " Sub-County Users"}
        </h2>
        <p style={{ color:C.gray, fontSize:13, marginTop:4 }}>
          {isAdmin ? "Full platform access — Murang'a County" : "Showing users in your sub-county only"}
        </p>
      </div>

      {flash && <Alert type={flash.type} msg={flash.msg} onClose={() => setFlash(null)} />}

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:10, marginBottom:20 }}>
        {[
          { label:"Total Users",  val:stats.total,     icon:"👥", color:C.primary },
          { label:"Farmers",      val:stats.farmers,   icon:"👨‍🌾", color:"#1D9E75" },
          { label:"Buyers",       val:stats.buyers,    icon:"🏢", color:C.info },
          { label:"Agrovets",     val:stats.agrovets,  icon:"💊", color:"#BA7517" },
          { label:"Extension",    val:stats.extension, icon:"🎓", color:"#7F77DD" },
          { label:"Active",       val:stats.active,    icon:"✅", color:C.primary },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", borderRadius:10, padding:"12px 14px", border:"1px solid #eee", textAlign:"center" }}>
            <div style={{ fontSize:20 }}>{s.icon}</div>
            <div style={{ fontWeight:700, fontSize:18, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:11, color:C.gray }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search name, email, phone…" style={{ ...inp, flex:2, minWidth:180 }} />
        {isAdmin && (
          <select value={filterSC} onChange={e => { setFilterSC(e.target.value); setFilterW(""); }} style={{ ...inp, flex:1, minWidth:140, background:"#fff" }}>
            <option value="">All Sub-Counties</option>
            {SUBCOUNTIES.map(sc => <option key={sc}>{sc}</option>)}
          </select>
        )}
        <select value={filterW} onChange={e => setFilterW(e.target.value)} style={{ ...inp, flex:1, minWidth:120, background:"#fff" }}>
          <option value="">All Wards</option>
          {(isAdmin ? wardsForFilter : getWards(actorScope.subcounty)).map(w => <option key={w}>{w}</option>)}
        </select>
        <select value={filterR} onChange={e => setFilterR(e.target.value)} style={{ ...inp, flex:1, minWidth:130, background:"#fff" }}>
          <option value="">All Roles</option>
          {ROLES_ORDER.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Hierarchy tree (admin only) */}
      {isAdmin && !search && !filterSC && !filterR && (
        <div style={{ background:"#fff", borderRadius:12, padding:"1rem 1.25rem", marginBottom:16, border:"1px solid #eee" }}>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>🏛️ Administrative Hierarchy — Murang'a County</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {SUBCOUNTIES.map(sc => {
              const count = visible.filter(u => u.subcounty === sc).length;
              return (
                <button key={sc} onClick={() => setFilterSC(sc)} style={{ background:C.primaryLight, border:"none", borderRadius:20, padding:"5px 14px", cursor:"pointer", fontSize:12, color:C.primary, fontWeight:600 }}>
                  {sc} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Users table */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #eee", overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#f8f8f6" }}>
                <th style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:C.gray, fontSize:12 }}>User</th>
                <th style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:C.gray, fontSize:12 }}>Role</th>
                <th style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:C.gray, fontSize:12 }}>Sub-County</th>
                <th style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:C.gray, fontSize:12 }}>Ward</th>
                <th style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:C.gray, fontSize:12 }}>Location</th>
                <th style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:C.gray, fontSize:12 }}>Status</th>
                <th style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:C.gray, fontSize:12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding:"3rem", textAlign:"center", color:C.gray }}>No users found</td></tr>
              )}
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderTop:"1px solid #f0f0ee", background: i % 2 === 0 ? "#fff" : "#fafaf9" }}>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ fontWeight:600, color:C.dark }}>{u.name}</div>
                    <div style={{ fontSize:11, color:C.gray }}>{u.email} · {u.phone}</div>
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#f0f0ee", borderRadius:20, padding:"3px 10px", fontSize:12 }}>
                      {ROLE_ICONS[u.role]} {u.role}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:C.dark }}>{u.subcounty}</td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:C.dark }}>{u.ward}</td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:C.gray }}>{u.location}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{
                      background: u.status === "active" ? "#E1F5EE" : u.status === "pending" ? "#FEF3C7" : "#FEE2E2",
                      color:      u.status === "active" ? C.primary  : u.status === "pending" ? "#92400E" : C.danger,
                      borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:600,
                    }}>
                      {u.status === "active" ? "✅ Active" : u.status === "pending" ? "⏳ Pending" : "🚫 Suspended"}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      {isAdmin && (
                        <button onClick={() => toggleStatus(u.id)} style={{ background:"#f0f0ee", border:"none", borderRadius:6, padding:"5px 10px", cursor:"pointer", fontSize:12, color:C.dark }}>
                          {u.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      )}
                      {canDelete(u) && (
                        <button onClick={() => setConfirm(u.id)} style={{ background:"#FEE2E2", border:"none", borderRadius:6, padding:"5px 10px", cursor:"pointer", fontSize:12, color:C.danger }}>
                          🗑️ Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#fff", borderRadius:14, padding:"2rem", maxWidth:380, width:"90%", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <div style={{ fontWeight:700, fontSize:16, color:C.dark, marginBottom:8 }}>Confirm Removal</div>
            <div style={{ color:C.gray, fontSize:13, marginBottom:24 }}>
              Are you sure you want to remove <strong>{users.find(u => u.id === confirm)?.name}</strong>? This cannot be undone.
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setConfirm(null)} style={{ padding:"10px 24px", background:"#f0f0ee", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>Cancel</button>
              <button onClick={() => deleteUser(confirm)} style={{ padding:"10px 24px", background:C.danger, color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
