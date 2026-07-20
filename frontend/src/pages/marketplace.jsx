import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { MOCK_PRODUCTS } from "../data/mockData.js";
function EmptyState({ icon, title, desc, action, actionLabel, setPage, page }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"4rem 2rem", textAlign:"center", minHeight:340 }}>
      <div style={{ fontSize:64, marginBottom:18 }}>{icon}</div>
      <h3 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:"0 0 10px" }}>{title}</h3>
      <p style={{ color:C.gray, fontSize:14, maxWidth:380, lineHeight:1.7, margin:"0 0 24px" }}>{desc}</p>
      {actionLabel && (
        <button
          onClick={()=> page ? setPage(page) : action?.()}
          style={{ padding:"12px 28px", background:C.primary, color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function MarketplacePage({ role, isNewUser=false }) {
  // New users start with empty marketplace — no demo listings shown
  const [products, setProducts]     = useState(
    isNewUser ? [] : MOCK_PRODUCTS.map(p=>({...p, status:p.certified?"approved":"pending"}))
  );
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cart, setCart]             = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ name:"", price:"", qty:"", unit:"kg", category:"Vegetables", mediaUrl:"", mediaType:"" });
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, mediaUrl: url, mediaType: isVideo ? "video" : "image", _fileName: file.name }));
  };
  const [orderModal, setOrderModal] = useState(null);
  const [orderQty, setOrderQty]     = useState("");
  const [editModal, setEditModal]   = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [flash, setFlash]           = useState(null);
  const [viewModal, setViewModal]   = useState(null);

  const categories = ["All","Vegetables","Grains","Fruits","Dairy","Livestock"];
  const isAdmin = role === "Admin";
  const canOrder = role === "Buyer" || role === "Agrovet";
  const canList  = role === "Farmer" || role === "Agrovet";

  // Admin sees all; others see only approved
  const visible = products.filter(p => {
    if (!isAdmin && p.status !== "approved") return false;
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (category !== "All" && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.farmer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusBadge = (status) => {
    const map = { approved:["✅ Approved","#E1F5EE","#1D9E75"], pending:["⏳ Pending","#FFF3CD","#92400E"], rejected:["❌ Rejected","#FCEBEB","#E24B4A"], featured:["⭐ Featured","#EEEDFE","#7F77DD"], suspended:["🚫 Suspended","#F3F4F6","#888780"] };
    const [label, bg, color] = map[status] || map.pending;
    return <span style={{ background:bg, color, fontSize:11, padding:"2px 9px", borderRadius:20, fontWeight:700 }}>{label}</span>;
  };

  // Admin actions
  const adminAction = (id, action, extra={}) => {
    setProducts(prev => prev.map(p => p.id===id ? {...p, ...extra, status:action==="remove"?p.status:action, _actioned:true} : p));
    if (action === "remove") setProducts(prev => prev.filter(p => p.id!==id));
    setFlash({ type:"success", title:{ approved:"Listing approved ✅", rejected:"Listing rejected ❌", featured:"Listing featured ⭐", suspended:"Listing suspended 🚫", remove:"Listing removed 🗑️" }[action]||"Done", sub:`Action applied to listing.` });
    setTimeout(()=>setFlash(null), 3000);
  };

  const submitListing = () => {
    if (!form.name || !form.price) return;
    setProducts(ps => [{ id:Date.now(), name:form.name, farmer:"James Mwangi", price:+form.price, unit:form.unit, qty:+form.qty, category:form.category, certified:false, img:"🌿", mediaUrl:form.mediaUrl, mediaType:form.mediaType, location:"Murang'a", posted:"Just now", status:"pending" }, ...ps]);
    setShowForm(false); setForm({ name:"", price:"", qty:"", unit:"kg", category:"Vegetables", mediaUrl:"", mediaType:"" });
    setFlash({ type:"success", title:"Listing submitted!", sub:"Awaiting Admin approval.", cb:null });
    setTimeout(()=>setFlash(null), 3000);
  };

  const saveEdit = () => {
    setProducts(prev => prev.map(p => p.id===editModal.id ? { ...p, ...editForm } : p));
    setEditModal(null);
    setFlash({ type:"success", title:"Listing updated ✅", sub:"Changes saved.", cb:null });
    setTimeout(()=>setFlash(null), 3000);
  };

  const placeOrder = () => {
    if (!orderQty) return;
    setCart(c => [...c, { ...orderModal, orderedQty:+orderQty }]);
    setOrderModal(null); setOrderQty("");
  };

  const counts = { total:products.length, approved:products.filter(p=>p.status==="approved").length, pending:products.filter(p=>p.status==="pending").length, featured:products.filter(p=>p.status==="featured").length };

  if (isNewUser) return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:"0 0 4px" }}>⭐ Ratings & Reviews</h2>
      <p style={{ color:C.gray, fontSize:13, margin:"0 0 24px" }}>See what buyers and farmers say about each other.</p>
      <EmptyState
        icon="⭐"
        title="No ratings yet"
        desc="Your ratings and reviews from buyers will appear here after your first successful transaction. Complete certification and list your produce to get started."
        actionLabel={null}
      />
    </div>
  );
  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {flash && <FlashResult type={flash.type} title={flash.title} sub={flash.sub} onDone={()=>setFlash(null)} />}

      {/* Order modal */}
      {orderModal && (
        <Modal title={`Order: ${orderModal.name}`} onClose={()=>setOrderModal(null)} width={400}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:C.gray }}>👨‍🌾 {orderModal.farmer} · 📍 {orderModal.location}</div>
            <div style={{ fontSize:13, color:C.gray, marginTop:4 }}>Available: <strong>{orderModal.qty} {orderModal.unit}</strong> · Price: <strong>KES {orderModal.price}/{orderModal.unit}</strong></div>
          </div>
          <Field label="Quantity to Order">
            <input type="number" value={orderQty} onChange={e=>setOrderQty(e.target.value)} placeholder={`Max ${orderModal.qty}`} style={inp} autoFocus />
          </Field>
          {orderQty && <div style={{ background:C.primaryLight, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:14, fontWeight:600, color:C.primaryDark }}>
            Total: KES {(+orderQty * orderModal.price).toLocaleString()}
          </div>}
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={placeOrder} style={{ flex:1 }}>Place Order</Btn>
            <Btn variant="ghost" onClick={()=>setOrderModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Admin edit modal */}
      {editModal && (
        <Modal title="✏️ Edit Listing" onClose={()=>setEditModal(null)} width={480}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <Field label="Produce Name" style={{ gridColumn:"span 2" }}>
              <input value={editForm.name||""} onChange={e=>setEditForm({...editForm,name:e.target.value})} style={inp} />
            </Field>
            <Field label="Price (KES)"><input type="number" value={editForm.price||""} onChange={e=>setEditForm({...editForm,price:+e.target.value})} style={inp} /></Field>
            <Field label="Quantity"><input type="number" value={editForm.qty||""} onChange={e=>setEditForm({...editForm,qty:+e.target.value})} style={inp} /></Field>
            <Field label="Unit"><select value={editForm.unit||"kg"} onChange={e=>setEditForm({...editForm,unit:e.target.value})} style={sel}>{["kg","bunch","crate","bag","litre"].map(u=><option key={u}>{u}</option>)}</select></Field>
            <Field label="Category"><select value={editForm.category||"Vegetables"} onChange={e=>setEditForm({...editForm,category:e.target.value})} style={sel}>{["Vegetables","Grains","Fruits","Dairy","Livestock"].map(c=><option key={c}>{c}</option>)}</select></Field>
            <Field label="Status" style={{ gridColumn:"span 2" }}>
              <select value={editForm.status||"pending"} onChange={e=>setEditForm({...editForm,status:e.target.value})} style={sel}>
                {["pending","approved","featured","rejected","suspended"].map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ background:"#fafafa", border:"1px solid #eee", borderRadius:9, padding:"12px", marginBottom:16 }}>
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13 }}>
              <input type="checkbox" checked={!!editForm.certified} onChange={e=>setEditForm({...editForm,certified:e.target.checked})} style={{ width:16, height:16 }} />
              <span>Mark as <strong>Certified</strong> (admin verified)</span>
            </label>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={saveEdit} style={{ flex:1 }}>Save Changes</Btn>
            <Btn variant="ghost" onClick={()=>setEditModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* View listing detail modal */}
      {viewModal && (
        <Modal title={viewModal.name} onClose={()=>setViewModal(null)} width={420}>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontSize:64, marginBottom:8 }}>{viewModal.img}</div>
            {statusBadge(viewModal.status)}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            {[["Farmer", viewModal.farmer],["Location", viewModal.location],["Category", viewModal.category],["Unit", viewModal.unit],["Price", `KES ${viewModal.price}`],["Qty Available", `${viewModal.qty} ${viewModal.unit}`],["Posted", viewModal.posted],["Certified", viewModal.certified?"Yes":"No"]].map(([l,v])=>(
              <div key={l} style={{ background:"#fafafa", borderRadius:9, padding:"9px 12px" }}>
                <div style={{ fontSize:11, color:C.gray }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>
          {isAdmin && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[["approve","✅ Approve","success"],["featured","⭐ Feature","info"],["rejected","❌ Reject","danger"],["suspended","🚫 Suspend","accent"]].map(([action,label,variant])=>(
                <Btn key={action} size="sm" variant={variant} onClick={()=>{ adminAction(viewModal.id,action); setViewModal(null); }}>{label}</Btn>
              ))}
              <Btn size="sm" variant="ghost" onClick={()=>{ setEditModal(viewModal); setEditForm({...viewModal}); setViewModal(null); }}>✏️ Edit</Btn>
            </div>
          )}
        </Modal>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:isAdmin?12:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>🏪 {isAdmin?"Marketplace Management":"Marketplace"}</h2>
          <p style={{ color:C.gray, fontSize:12, margin:"4px 0 0" }}>{isAdmin?"Review, approve and manage all produce listings":"Browse certified produce from verified farmers"}</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {cart.length>0 && <Btn variant="ghost">🛒 Cart ({cart.length})</Btn>}
          {canList && <Btn onClick={()=>setShowForm(!showForm)}>+ List Produce</Btn>}
        </div>
      </div>

      {/* Admin stat cards */}
      {isAdmin && (
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          {[["Total",counts.total,"📋",C.gray],["Approved",counts.approved,"✅",C.primary],["Pending Review",counts.pending,"⏳","#92400E"],["Featured",counts.featured,"⭐","#7F77DD"]].map(([l,v,icon,color])=>(
            <div key={l} onClick={()=>setStatusFilter(l==="Total"?"All":l.toLowerCase().split(" ")[0])} style={{ background:"#fff", border:`1.5px solid ${color}30`, borderRadius:12, padding:"12px 20px", cursor:"pointer", minWidth:120, flex:1 }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
              <div style={{ fontSize:22, fontWeight:800, color }}>{v}</div>
              <div style={{ fontSize:12, color:C.gray }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Listing form */}
      {showForm && (
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem", marginBottom:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>📦 List New Produce</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
            <Field label="Produce Name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Organic Tomatoes" style={inp} /></Field>
            <Field label="Price (KES)"><input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="Per unit" style={inp} /></Field>
            <Field label="Quantity"><input type="number" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} placeholder="Available qty" style={inp} /></Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <Field label="Unit"><select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} style={sel}>{["kg","bunch","crate","bag","litre"].map(u=><option key={u}>{u}</option>)}</select></Field>
            <Field label="Category"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={sel}>{["Vegetables","Grains","Fruits","Dairy","Livestock"].map(c=><option key={c}>{c}</option>)}</select></Field>
            <Field label="Photo or Video (optional)">
              <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} style={{ fontSize:13, padding:"8px 0" }} />
              {form.mediaUrl && form.mediaType === "image" && <img src={form.mediaUrl} alt="preview" style={{ maxHeight:120, borderRadius:8, marginTop:8, objectFit:"cover", width:"100%" }} />}
              {form.mediaUrl && form.mediaType === "video" && <video src={form.mediaUrl} controls style={{ maxHeight:120, borderRadius:8, marginTop:8, width:"100%" }} />}
            </Field>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={submitListing}>Submit for Review</Btn>
            <Btn variant="ghost" onClick={()=>setShowForm(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search produce or farmer…" style={{ flex:1, minWidth:160, padding:"9px 14px", border:"1px solid #ddd", borderRadius:8, fontSize:13, outline:"none" }} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {categories.map(c=>(
            <button key={c} onClick={()=>setCategory(c)} style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", background:category===c?C.primary:C.grayLight, color:category===c?"#fff":C.dark, fontSize:12, fontWeight:category===c?600:400 }}>{c}</button>
          ))}
        </div>
        {isAdmin && (
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:"7px 12px", border:"1px solid #ddd", borderRadius:8, fontSize:13, outline:"none" }}>
            {["All","approved","pending","featured","rejected","suspended"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        )}
      </div>

      {/* Listing grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
        {visible.map(p => (
          <div key={p.id} style={{ background:"#fff", border:`1.5px solid ${p.status==="pending"?"#F59E0B":p.status==="rejected"?"#E24B4A":p.status==="featured"?"#7F77DD":"#eee"}`, borderRadius:12, overflow:"hidden" }}>
            <div style={{ background:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", height:76, fontSize:44, position:"relative" }}>
              {p.img}
              <div style={{ position:"absolute", top:6, left:6 }}>{statusBadge(p.status)}</div>
              {p.certified && <span style={{ position:"absolute", top:6, right:6, background:"#EAF3DE", color:"#3B6D11", fontSize:11, padding:"2px 8px", borderRadius:10, fontWeight:600 }}>✓ Cert</span>}
            </div>
            <div style={{ padding:"0.9rem" }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{p.name}</div>
              <div style={{ fontSize:12, color:C.gray, marginBottom:6 }}>👨‍🌾 {p.farmer} · 📍 {p.location}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div><span style={{ fontWeight:700, fontSize:16, color:C.primaryDark }}>KES {p.price}</span><span style={{ fontSize:11, color:C.gray }}>/{p.unit}</span></div>
                <span style={{ fontSize:11, color:C.gray }}>{p.qty} {p.unit}</span>
              </div>
              {/* Action buttons by role */}
              {isAdmin ? (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {/* Status action row */}
                  <div style={{ display:"flex", gap:5 }}>
                    {p.status !== "approved"  && <button onClick={()=>adminAction(p.id,"approved")}  style={{ flex:1, padding:"6px 4px", background:"#E1F5EE", color:"#0F6E56", border:"1px solid #A7DEC9", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>✅ Approve</button>}
                    {p.status !== "featured"  && <button onClick={()=>adminAction(p.id,"featured")}  style={{ flex:1, padding:"6px 4px", background:"#EEEDFE", color:"#7F77DD", border:"1px solid #C4C1F5", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>⭐ Feature</button>}
                    {p.status !== "rejected"  && <button onClick={()=>adminAction(p.id,"rejected")}  style={{ flex:1, padding:"6px 4px", background:"#FCEBEB", color:"#E24B4A", border:"1px solid #F5C1C1", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>❌ Reject</button>}
                  </div>
                  {/* Edit / View / Remove row */}
                  <div style={{ display:"flex", gap:5 }}>
                    <button onClick={()=>{ setEditModal(p); setEditForm({...p}); }} style={{ flex:1, padding:"6px", background:"#E6F1FB", color:"#378ADD", border:"1px solid #BFDBFE", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>✏️ Edit</button>
                    <button onClick={()=>setViewModal(p)}              style={{ flex:1, padding:"6px", background:C.grayLight, color:C.dark,   border:"1px solid #e0e0e0", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>👁 View</button>
                    <button onClick={()=>adminAction(p.id,"remove")}  style={{ flex:1, padding:"6px", background:"#FCEBEB", color:"#E24B4A", border:"1px solid #F5C1C1", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>🗑 Remove</button>
                  </div>
                  {p.status==="pending" && <div style={{ background:"#FFF3CD", borderRadius:7, padding:"5px 10px", fontSize:11, color:"#92400E", textAlign:"center" }}>⏳ Awaiting your review</div>}
                </div>
              ) : canOrder ? (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>setOrderModal(p)} style={{ flex:1, padding:"8px", background:C.primary, color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>Order Now</button>
                  <button style={{ padding:"8px 12px", background:C.infoLight, color:C.info, border:"none", borderRadius:8, cursor:"pointer" }}>💬</button>
                </div>
              ) : (
                <span style={{ fontSize:11, color:C.gray }}>Posted {p.posted}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {visible.length===0 && (
        isNewUser ? (
          <EmptyState
            icon="🏪"
            title="Your marketplace is empty"
            desc="Once you complete certification and list your first produce, it will appear here for buyers to find you."
            actionLabel="Complete Certification →"
            setPage={()=>{}} page={null}
            action={()=>document.querySelector('[data-page=certification]')?.click?.()}
          />
        ) : <div style={{ textAlign:"center", color:C.gray, padding:"2.5rem", fontSize:14 }}>No listings found.</div>
      )}
    </div>
  );
}