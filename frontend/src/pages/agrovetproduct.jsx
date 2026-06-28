import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/flashresult.jsx";
import { MOCK_AGROVET_PRODUCTS } from "../data/mockData.js";

export default function AgrovetProductsPage({ role }) {
  const [products, setProducts] = useState(MOCK_AGROVET_PRODUCTS);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name:"", price:"", stock:"", unit:"bag", category:"Fertilizers", desc:"" });

  const statusStyle = {
    approved: { bg:"#EAF3DE", color:"#3B6D11", label:"✅ Approved", icon:"✅" },
    pending:  { bg:"#FAEEDA", color:"#854F0B", label:"⏳ Pending Approval", icon:"⏳" },
    rejected: { bg:"#FCEBEB", color:"#A32D2D", label:"❌ Rejected", icon:"❌" },
  };

  const saveProduct = () => {
    if (!form.name || !form.price) return;
    if (editProduct) {
      setProducts(products.map(p => p.id===editProduct.id ? { ...p, ...form, price:+form.price, stock:+form.stock } : p));
      setEditProduct(null);
    } else {
      setProducts([{ id:products.length+100, ...form, price:+form.price, stock:+form.stock, status:"pending", sales:0, img:"📦" }, ...products]);
    }
    setForm({ name:"", price:"", stock:"", unit:"bag", category:"Fertilizers", desc:"" });
    setShowForm(false);
  };

  const startEdit = (p) => {
    setEditProduct(p);
    setForm({ name:p.name, price:String(p.price), stock:String(p.stock), unit:p.unit, category:p.category, desc:p.desc });
    setShowForm(true);
  };

  const deleteProduct = (id) => setProducts(products.filter(p=>p.id!==id));

  const totalRevenue = products.filter(p=>p.status==="approved").reduce((a,p)=>a+(p.price*p.sales),0);

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>💊 My Products</h2>
          <p style={{ fontSize:13, color:C.gray, margin:"4px 0 0" }}>Manage your agro-input listings — approved products appear in the Farm Inputs catalogue</p>
        </div>
        <Btn onClick={()=>{ setShowForm(!showForm); setEditProduct(null); setForm({ name:"", price:"", stock:"", unit:"bag", category:"Fertilizers", desc:"" }); }}>
          + Add Product
        </Btn>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Total Products",   value:products.length,                               icon:"💊", color:C.accent  },
          { label:"Approved",         value:products.filter(p=>p.status==="approved").length,icon:"✅", color:C.primary },
          { label:"Pending Review",   value:products.filter(p=>p.status==="pending").length, icon:"⏳", color:C.info   },
          { label:"Est. Revenue (KES)",value:String((totalRevenue/1000).toFixed(1)) + "K",          icon:"💰", color:C.accent  },
        ].map((s,i)=>(
          <div key={i} style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, color:C.gray, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:700, color:C.dark }}>{s.value}</div>
            </div>
            <div style={{ fontSize:24, opacity:0.7 }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background:"#fff", border:"1.5px solid "+C.accent+"44", borderRadius:12, padding:"1.5rem", marginBottom:20 }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>{editProduct ? "✏️ Edit Product" : "➕ Add New Product"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
            <Field label="Product Name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. DAP Fertilizer 50kg" style={inp} /></Field>
            <Field label="Price (KES)"><input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="e.g. 3800" style={inp} /></Field>
            <Field label="Stock Quantity"><input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder="e.g. 100" style={inp} /></Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <Field label="Unit">
              <select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} style={sel}>
                {["bag","litre","kg","piece","box","carton"].map(u=><option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={sel}>
                {["Fertilizers","Seeds","Animal Feeds","Pesticides","Farm Tools","Veterinary"].map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Product Description">
            <textarea value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="Brief product description..." style={{ ...inp, height:60, resize:"vertical" }} />
          </Field>
          <div style={{ background:"#FAFAF8", border:"1.5px dashed #ddd", borderRadius:8, padding:"10px 14px", fontSize:12, color:C.gray, marginBottom:14, cursor:"pointer" }}>
            📎 Attach certification document (PDF/JPG) — required for approval
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={saveProduct} variant="accent">{editProduct ? "Save Changes" : "Submit for Approval"}</Btn>
            <Btn variant="ghost" onClick={()=>{ setShowForm(false); setEditProduct(null); }}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Product Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {products.map(p => {
          const st = statusStyle[p.status] || statusStyle.pending;
          return (
            <div key={p.id} style={{ background:"#fff", border:`1.5px solid ${p.status==="approved"?"#d4edda":p.status==="rejected"?"#f5c6cb":"#ffeeba"}`, borderRadius:12, overflow:"hidden" }}>
              <div style={{ background:p.status==="approved"?C.primaryLight:p.status==="rejected"?C.dangerLight:C.accentLight, height:72, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 1rem" }}>
                <span style={{ fontSize:36 }}>{p.img}</span>
                <span style={{ fontSize:12, background:"#fff", borderRadius:8, padding:"3px 10px", fontWeight:600, color:p.status==="approved"?"#3B6D11":p.status==="rejected"?C.danger:"#854F0B" }}>
                  {st.icon} {p.status.charAt(0).toUpperCase()+p.status.slice(1)}
                </span>
              </div>
              <div style={{ padding:"1rem" }}>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{p.name}</div>
                <div style={{ fontSize:11, color:C.gray, marginBottom:8, lineHeight:1.4 }}>{p.desc}</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:C.gray }}>📦 {p.category}</span>
                  <span style={{ fontSize:12, color:C.gray }}>Unit: {p.unit}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontWeight:700, fontSize:16, color:C.primaryDark }}>KES {p.price.toLocaleString()}</span>
                  <span style={{ fontSize:12, color:C.gray }}>Stock: {p.stock}</span>
                </div>
                {p.status==="approved" && (
                  <div style={{ background:"#EAF3DE", borderRadius:6, padding:"5px 10px", fontSize:12, color:"#3B6D11", marginBottom:8 }}>
                    📊 {p.sales} units sold · KES {(p.price*p.sales).toLocaleString()} earned
                  </div>
                )}
                {p.status==="rejected" && (
                  <div style={{ background:C.dangerLight, borderRadius:6, padding:"5px 10px", fontSize:12, color:C.danger, marginBottom:8 }}>
                    ⚠️ Rejected — missing safety certification. Edit and resubmit.
                  </div>
                )}
                {p.status==="pending" && (
                  <div style={{ background:C.accentLight, borderRadius:6, padding:"5px 10px", fontSize:12, color:C.accent, marginBottom:8 }}>
                    ⏳ Awaiting admin/officer review
                  </div>
                )}
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>startEdit(p)} style={{ flex:1, padding:"7px", background:C.infoLight, color:C.info, border:"none", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:500 }}>✏️ Edit</button>
                  <button onClick={()=>deleteProduct(p.id)} style={{ padding:"7px 10px", background:C.dangerLight, color:C.danger, border:"none", borderRadius:7, cursor:"pointer", fontSize:12 }}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {products.length===0 && <div style={{ textAlign:"center", color:C.gray, padding:"3rem", fontSize:14 }}>No products yet. Add your first product above.</div>}
    </div>
  );
}