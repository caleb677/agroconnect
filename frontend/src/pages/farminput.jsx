import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/Badge.jsx";
import Btn from "../components/common/Btn.jsx";
import Modal from "../components/common/Modal.jsx";
import Field from "../components/common/Field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { MOCK_AGRO_INPUTS } from "../data/mockData.js";
export default function FarmInputsPage({ role, isNewUser=false }) {
  const [inputs, setInputs]         = useState(
    isNewUser ? [] : MOCK_AGRO_INPUTS.map(p=>({...p, status:p.certified?"approved":"pending", supplier:p.supplier||"AgriVet Plus"}))
  );
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm]             = useState({ name:"", price:"", stock:"", category:"Fertilizers", supplier:"" });
  const [orderModal, setOrderModal] = useState(null);
  const [orderQty, setOrderQty]     = useState("");
  const [editModal, setEditModal]   = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [viewModal, setViewModal]   = useState(null);
  const [flash, setFlash]           = useState(null);
  const [fraudWarning, setFraudWarning] = useState(false);

  const cats = ["All","Fertilizers","Seeds","Animal Feeds","Pesticides","Farm Tools","Herbicides"];
  const isAdmin   = role === "Admin";
  const canUpload = role === "Agrovet" || role === "Admin";
  const canBuy    = role === "Farmer";

  const visible = inputs.filter(p => {
    if (!isAdmin && !canUpload && p.status !== "approved") return false;
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (category !== "All" && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.supplier||"").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: inputs.length,
    approved: inputs.filter(p=>p.status==="approved").length,
    pending:  inputs.filter(p=>p.status==="pending").length,
    rejected: inputs.filter(p=>p.status==="rejected").length,
  };

  const statusBadge = (s) => {
    const map = { approved:["✅ Approved","#E1F5EE","#1D9E75"], pending:["⏳ Pending","#FFF3CD","#92400E"], rejected:["❌ Rejected","#FCEBEB","#E24B4A"], suspended:["🚫 Suspended","#F3F4F6","#888780"] };
    const [label, bg, color] = map[s] || map.pending;
    return <span style={{ background:bg, color, fontSize:11, padding:"2px 9px", borderRadius:20, fontWeight:700 }}>{label}</span>;
  };

  const adminAction = (id, action) => {
    if (action === "remove") {
      setInputs(prev => prev.filter(p => p.id !== id));
    } else {
      const certify = action === "approved";
      setInputs(prev => prev.map(p => p.id===id ? { ...p, status:action, certified:certify, badge:certify?"✅ Certified":"⚠️ "+action, quality:certify?"Certified & Verified":"Pending Review" } : p));
    }
    setViewModal(null);
    setFlash({ type:"success", title:{ approved:"Input approved ✅", rejected:"Input rejected ❌", suspended:"Input suspended 🚫", remove:"Input removed 🗑️" }[action]||"Done", sub:"Action applied to farm input." });
    setTimeout(()=>setFlash(null), 3000);
  };

  const uploadInput = () => {
    if (!form.name || !form.price) return;
    const newInput = {
      id: Date.now(), name:form.name, supplier:form.supplier||"AgriVet Plus",
      price:+form.price, category:form.category, certified:false,
      img:"📦", stock:+form.stock||0, quality:"Pending Admin Review",
      badge:"⏳ Pending Approval", status:"pending"
    };
    setInputs(prev => [newInput, ...prev]);
    setShowUpload(false);
    setForm({ name:"", price:"", stock:"", category:"Fertilizers", supplier:"" });
    setFlash({ type:"success", title:"Product submitted!", sub:"Awaiting Admin approval before going live.", cb:null });
    setTimeout(()=>setFlash(null), 3000);
  };

  const saveEdit = () => {
    setInputs(prev => prev.map(p => p.id===editModal.id ? { ...p, ...editForm } : p));
    setEditModal(null);
    setFlash({ type:"success", title:"Input updated ✅", sub:"Changes saved.", cb:null });
    setTimeout(()=>setFlash(null), 3000);
  };

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {flash && <FlashResult type={flash.type} title={flash.title} sub={flash.sub} onDone={()=>setFlash(null)} />}

      {fraudWarning && (
        <div style={{ background:"#FFF3CD", border:"1.5px solid #F59E0B", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div style={{ flex:1, fontSize:13, color:"#856404" }}><strong>Fraud Warning:</strong> This product has not been verified. Only purchase ✅ Approved inputs to avoid counterfeit products.</div>
          <button onClick={()=>setFraudWarning(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#856404" }}>×</button>
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <Modal title="✏️ Edit Farm Input" onClose={()=>setEditModal(null)} width={500}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <Field label="Product Name" style={{ gridColumn:"span 2" }}>
              <input value={editForm.name||""} onChange={e=>setEditForm({...editForm,name:e.target.value})} style={inp} />
            </Field>
            <Field label="Supplier"><input value={editForm.supplier||""} onChange={e=>setEditForm({...editForm,supplier:e.target.value})} style={inp} /></Field>
            <Field label="Category"><select value={editForm.category||"Fertilizers"} onChange={e=>setEditForm({...editForm,category:e.target.value})} style={sel}>{["Fertilizers","Seeds","Animal Feeds","Pesticides","Farm Tools","Herbicides"].map(c=><option key={c}>{c}</option>)}</select></Field>
            <Field label="Price (KES)"><input type="number" value={editForm.price||""} onChange={e=>setEditForm({...editForm,price:+e.target.value})} style={inp} /></Field>
            <Field label="Stock Qty"><input type="number" value={editForm.stock||""} onChange={e=>setEditForm({...editForm,stock:+e.target.value})} style={inp} /></Field>
            <Field label="Status" style={{ gridColumn:"span 2" }}>
              <select value={editForm.status||"pending"} onChange={e=>setEditForm({...editForm,status:e.target.value, certified:e.target.value==="approved", badge:e.target.value==="approved"?"✅ Certified":"⏳ "+e.target.value})} style={sel}>
                {["pending","approved","rejected","suspended"].map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13, marginBottom:16, padding:"10px 14px", background:"#fafafa", borderRadius:9, border:"1px solid #eee" }}>
            <input type="checkbox" checked={!!editForm.certified} onChange={e=>setEditForm({...editForm,certified:e.target.checked})} style={{ width:16,height:16 }} />
            <span>Mark as <strong>Certified & Approved</strong> by Admin</span>
          </label>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={saveEdit} style={{ flex:1 }}>Save Changes</Btn>
            <Btn variant="ghost" onClick={()=>setEditModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* View modal */}
      {viewModal && (
        <Modal title={viewModal.name} onClose={()=>setViewModal(null)} width={440}>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontSize:56, marginBottom:8 }}>{viewModal.img}</div>
            {statusBadge(viewModal.status)}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            {[["Supplier",viewModal.supplier],["Category",viewModal.category],["Price",`KES ${(viewModal.price||0).toLocaleString()}`],["Stock",`${viewModal.stock} units`],["Quality",viewModal.quality],["Certified",viewModal.certified?"✅ Yes":"❌ No"]].map(([l,v])=>(
              <div key={l} style={{ background:"#fafafa", borderRadius:9, padding:"9px 12px" }}>
                <div style={{ fontSize:11, color:C.gray }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>
          {isAdmin && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {viewModal.status!=="approved"  && <button onClick={()=>adminAction(viewModal.id,"approved")}  style={{ flex:1, padding:"9px", background:"#E1F5EE", color:"#0F6E56", border:"1.5px solid #A7DEC9", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12 }}>✅ Approve</button>}
              {viewModal.status!=="rejected"  && <button onClick={()=>adminAction(viewModal.id,"rejected")}  style={{ flex:1, padding:"9px", background:"#FCEBEB", color:"#E24B4A", border:"1.5px solid #F5C1C1", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12 }}>❌ Reject</button>}
              {viewModal.status!=="suspended" && <button onClick={()=>adminAction(viewModal.id,"suspended")} style={{ flex:1, padding:"9px", background:"#F3F4F6", color:"#888780", border:"1.5px solid #e0e0e0", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12 }}>🚫 Suspend</button>}
              <button onClick={()=>{ setEditModal(viewModal); setEditForm({...viewModal}); setViewModal(null); }} style={{ flex:1, padding:"9px", background:"#E6F1FB", color:"#378ADD", border:"1.5px solid #BFDBFE", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12 }}>✏️ Edit</button>
              <button onClick={()=>adminAction(viewModal.id,"remove")} style={{ padding:"9px 14px", background:"#FCEBEB", color:"#E24B4A", border:"1.5px solid #F5C1C1", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12 }}>🗑 Remove</button>
            </div>
          )}
        </Modal>
      )}

      {/* Order modal */}
      {orderModal && (
        <Modal title={`Order: ${orderModal.name}`} onClose={()=>setOrderModal(null)} width={400}>
          <div style={{ fontSize:13, color:C.gray, marginBottom:14 }}>Supplier: <strong>{orderModal.supplier}</strong> · Stock: <strong>{orderModal.stock} units</strong></div>
          <Field label="Quantity">
            <input type="number" value={orderQty} onChange={e=>setOrderQty(e.target.value)} placeholder="Enter quantity" style={inp} autoFocus />
          </Field>
          {orderQty && <div style={{ background:C.primaryLight, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:14, fontWeight:600, color:C.primaryDark }}>
            Estimated: KES {(+orderQty * orderModal.price).toLocaleString()}
          </div>}
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>{ setOrderModal(null); setOrderQty(""); }} style={{ flex:1 }}>Place Order</Btn>
            <Btn variant="ghost" onClick={()=>{ setOrderModal(null); setOrderQty(""); }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:isAdmin?12:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>🌿 {isAdmin?"Farm Inputs Management":"Certified Farm Inputs"}</h2>
          <p style={{ color:C.gray, fontSize:12, margin:"4px 0 0" }}>{isAdmin?"Review, approve and manage all agrovet product listings":"Only certified, quality-approved inputs from verified suppliers"}</p>
        </div>
        {canUpload && <Btn onClick={()=>setShowUpload(!showUpload)}>+ Upload Product</Btn>}
      </div>

      {/* Admin stat cards */}
      {isAdmin && (
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          {[["Total",counts.total,"📋",C.gray],["Approved",counts.approved,"✅",C.primary],["Pending",counts.pending,"⏳","#92400E"],["Rejected",counts.rejected,"❌",C.danger]].map(([l,v,icon,color])=>(
            <div key={l} onClick={()=>setStatusFilter(l==="Total"?"All":l.toLowerCase())} style={{ background:"#fff", border:`1.5px solid ${color}30`, borderRadius:12, padding:"12px 20px", cursor:"pointer", flex:1 }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
              <div style={{ fontSize:22, fontWeight:800, color }}>{v}</div>
              <div style={{ fontSize:12, color:C.gray }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      {canUpload && showUpload && (
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem", marginBottom:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>📦 Upload New Farm Input</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:12 }}>
            <Field label="Product Name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. CAN Fertilizer" style={inp} /></Field>
            <Field label="Supplier"><input value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} placeholder="Your business name" style={inp} /></Field>
            <Field label="Price (KES)"><input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="Per unit" style={inp} /></Field>
            <Field label="Stock Qty"><input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder="Available qty" style={inp} /></Field>
          </div>
          <Field label="Category">
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{ ...sel, maxWidth:240 }}>
              {["Fertilizers","Seeds","Animal Feeds","Pesticides","Farm Tools","Herbicides"].map(c=><option key={c}>{c}</option>)}
            </select>
          </Field>
          <div style={{ border:"2px dashed #ddd", borderRadius:10, padding:"1rem", textAlign:"center", color:C.gray, fontSize:13, cursor:"pointer", marginBottom:14, marginTop:12 }}>
            📎 Upload certification documents (PDF/JPG)
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={uploadInput}>Submit for Approval</Btn>
            <Btn variant="ghost" onClick={()=>setShowUpload(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search inputs or supplier…" style={{ flex:1, minWidth:160, padding:"9px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:13, outline:"none" }} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCategory(c)} style={{ padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", background:category===c?C.primary:C.grayLight, color:category===c?"#fff":C.dark, fontSize:12, fontWeight:category===c?600:400 }}>{c}</button>
          ))}
        </div>
        {isAdmin && (
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:"7px 12px", border:"1px solid #ddd", borderRadius:8, fontSize:13, outline:"none" }}>
            {["All","approved","pending","rejected","suspended"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        )}
      </div>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
        {visible.map(p => (
          <div key={p.id} style={{ background:"#fff", border:`1.5px solid ${p.status==="pending"?"#F59E0B":p.status==="rejected"?"#E24B4A":p.certified?"#d4edda":"#eee"}`, borderRadius:12, overflow:"hidden" }}>
            <div style={{ background:p.certified?C.primaryLight:C.accentLight, display:"flex", alignItems:"center", justifyContent:"center", height:68, fontSize:38, position:"relative" }}>
              {p.img}
              <div style={{ position:"absolute", top:6, left:6 }}>{statusBadge(p.status)}</div>
            </div>
            <div style={{ padding:"0.9rem" }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{p.name}</div>
              <div style={{ fontSize:12, color:C.gray, marginBottom:2 }}>🏪 {p.supplier}</div>
              <div style={{ fontSize:11, color:C.gray, marginBottom:8 }}>📦 {p.stock} units · {p.category}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontWeight:700, fontSize:16, color:C.primaryDark }}>KES {(p.price||0).toLocaleString()}</span>
                <span style={{ fontSize:11, background:p.certified?"#EAF3DE":"#FFF3CD", color:p.certified?"#3B6D11":"#856404", padding:"2px 8px", borderRadius:6 }}>
                  {p.certified?"✅ Certified":"⚠️ Unverified"}
                </span>
              </div>

              {isAdmin ? (
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {p.status!=="approved"  && <button onClick={()=>adminAction(p.id,"approved")}  style={{ flex:1, padding:"6px 4px", background:"#E1F5EE", color:"#0F6E56", border:"1px solid #A7DEC9", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>✅ Approve</button>}
                    {p.status!=="rejected"  && <button onClick={()=>adminAction(p.id,"rejected")}  style={{ flex:1, padding:"6px 4px", background:"#FCEBEB", color:"#E24B4A", border:"1px solid #F5C1C1", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>❌ Reject</button>}
                    {p.status!=="suspended" && <button onClick={()=>adminAction(p.id,"suspended")} style={{ flex:1, padding:"6px 4px", background:"#F3F4F6", color:"#888780", border:"1px solid #e0e0e0", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>🚫 Suspend</button>}
                  </div>
                  <div style={{ display:"flex", gap:5 }}>
                    <button onClick={()=>{ setEditModal(p); setEditForm({...p}); }} style={{ flex:1, padding:"6px", background:"#E6F1FB", color:"#378ADD", border:"1px solid #BFDBFE", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>✏️ Edit</button>
                    <button onClick={()=>setViewModal(p)}          style={{ flex:1, padding:"6px", background:C.grayLight, color:C.dark, border:"1px solid #e0e0e0", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>👁 View</button>
                    <button onClick={()=>adminAction(p.id,"remove")} style={{ flex:1, padding:"6px", background:"#FCEBEB", color:"#E24B4A", border:"1px solid #F5C1C1", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>🗑 Del</button>
                  </div>
                  {p.status==="pending" && <div style={{ background:"#FFF3CD", borderRadius:7, padding:"5px", fontSize:11, color:"#92400E", textAlign:"center" }}>⏳ Awaiting your review</div>}
                </div>
              ) : canBuy ? (
                <button onClick={()=>p.certified?setOrderModal(p):setFraudWarning(true)} style={{ width:"100%", padding:"8px", background:p.certified?C.primary:"#f0f0ef", color:p.certified?"#fff":C.gray, border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                  {p.certified?"Order Now":"⚠️ Not Certified"}
                </button>
              ) : (
                <div style={{ fontSize:12, color:p.certified?C.primary:C.accent, fontWeight:500 }}>{p.badge}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {visible.length===0 && (
        isNewUser ? (
          <EmptyState
            icon="🌿"
            title="No farm inputs yet"
            desc="Certified agrovets will list approved fertilizers, seeds and pesticides here once available."
            actionLabel={null}
          />
        ) : <div style={{ textAlign:"center", color:C.gray, padding:"2.5rem", fontSize:14 }}>No inputs found.</div>
      )}
    </div>
  );
}
