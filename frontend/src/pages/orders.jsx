import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/Badge.jsx";
import Btn from "../components/common/Btn.jsx";
import Modal from "../components/common/Modal.jsx";
import Field from "../components/common/Field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { MOCK_ORDERS_BUYER, MOCK_ORDERS_FARMER, MOCK_ORDERS_AGROVET, MOCK_TRANSPORT } from "../data/mockdata.js";
export default function OrdersPage({ role, orders=[], setOrders=()=>{}, pushOrder=()=>{}, isNewUser=false }) {
  // Filter orders relevant to this role
  const myOrders = isNewUser ? [] : orders.filter(o => {
    if (role === "Farmer") return o._type === "produce";
    if (role === "Agrovet") return o._type === "input";
    if (role === "Buyer") return o.buyer === "Me" || o._type === "produce";
    return true; // Admin sees all
  });
  const [showCreate, setShowCreate] = useState(false);
  const [logisticsModal, setLogisticsModal] = useState(null);
  const [form, setForm] = useState({ product:"", qty:"", farmer:"", type:"produce" });
  const [orderSuccess, setOrderSuccess] = useState(null);

  const cancel = (id) => setOrders(orders.map(o => o.id === id ? { ...o, status:"cancelled" } : o));
  const confirm = (id) => setOrders(orders.map(o => o.id === id ? { ...o, status:"confirmed" } : o));
  const delivered = (id) => setOrders(orders.map(o => o.id === id ? { ...o, status:"delivered" } : o));
  const selectLogistics = (orderId, company) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, logistics:company } : o));
    setLogisticsModal(null);
  };

  const createOrder = () => {
    if (!form.product || !form.qty) return;
    const isInput = role === "Buyer" && form.type === "input";
    const newOrder = {
      id: `ORD-N${Date.now().toString().slice(-4)}`,
      product: form.product,
      farmer: form.farmer || (isInput ? "AgriVet Plus" : "Selected Farmer"),
      buyer: "Me",
      qty: +form.qty,
      total: +form.qty * 80,
      status: "pending",
      date: new Date().toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"}),
      logistics: null,
      _type: isInput ? "input" : "produce",
    };
    pushOrder(newOrder);
    setShowCreate(false);
    setForm({ product:"", qty:"", farmer:"", type:"produce" });
    setOrderSuccess(newOrder.id);
    setTimeout(() => setOrderSuccess(null), 4000);
  };

  const canCreate = role === "Buyer" || role === "Farmer";
  const canChooseLogistics = role === "Farmer" || role === "Agrovet";
  const canConfirmReceived = role === "Buyer";
  const showFarmerCol = role === "Buyer";

  const cols = ["Order ID", "Product", showFarmerCol ? "Farmer" : "Buyer", "Qty", "Total (KES)", "Status", "Logistics", "Date", "Actions"];

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {logisticsModal && (
        <Modal title="Select Logistics Company" onClose={() => setLogisticsModal(null)}>
          <p style={{ fontSize:13, color:C.gray, marginBottom:16 }}>Choose a transport company for order <strong>{logisticsModal}</strong>:</p>
          {MOCK_TRANSPORT.filter(t => t.status === "active").map(t => (
            <div key={t.id} onClick={() => selectLogistics(logisticsModal, t.company)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", border:"1.5px solid #eee", borderRadius:10, marginBottom:10, cursor:"pointer" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{t.company}</div>
                <div style={{ fontSize:12, color:C.gray }}>{t.counties.slice(0,3).join(", ")} · {t.vehicles} vehicles</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ color:"#BA7517", fontWeight:600, fontSize:13 }}>★ {t.rating}</span>
                <Btn size="sm">Select</Btn>
              </div>
            </div>
          ))}
        </Modal>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>📦 Orders</h2>
        {canCreate && <Btn onClick={() => setShowCreate(!showCreate)}>+ Create Order</Btn>}
      </div>
      {orderSuccess && (
        <div style={{ background:"#E1F5EE", border:"1.5px solid #1D9E75", borderRadius:10, padding:"12px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:22 }}>✅</span>
          <div><div style={{ fontWeight:700, color:"#0F6E56", fontSize:14 }}>Order placed successfully!</div><div style={{ fontSize:12, color:"#1D9E75" }}>Order {orderSuccess} has been sent to the supplier and they have been notified.</div></div>
        </div>
      )}
      {showCreate && (
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem", marginBottom:20 }}>
          <div style={{ fontWeight:600, marginBottom:14, fontSize:15 }}>New Order</div>
          {role==="Buyer" && (
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              {[{k:"produce",label:"🌾 Farm Produce",desc:"Order from a farmer"},{k:"input",label:"💊 Farm Input",desc:"Order from an agrovet"}].map(t=>(
                <button key={t.k} type="button" onClick={()=>setForm({...form,type:t.k})} style={{ flex:1, padding:"10px", borderRadius:9, border:`2px solid ${form.type===t.k?C.primary:"#e0e0e0"}`, background:form.type===t.k?C.primaryLight:"#fff", cursor:"pointer", fontWeight:600, fontSize:13, color:form.type===t.k?C.primary:C.dark }}>
                  <div>{t.label}</div><div style={{ fontSize:11, color:C.gray, fontWeight:400 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
            <Field label="Product"><input value={form.product} onChange={e=>setForm({...form,product:e.target.value})} placeholder="e.g. Organic Tomatoes" style={inp} /></Field>
            <Field label="Quantity (kg)"><input type="number" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} placeholder="e.g. 100" style={inp} /></Field>
            <Field label={role==="Buyer"?(form.type==="input"?"Agrovet Name":"Farmer Name"):"Buyer Name"}><input value={form.farmer} onChange={e=>setForm({...form,farmer:e.target.value})} placeholder="Contact name" style={inp} /></Field>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={createOrder}>Place Order</Btn>
            <Btn variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Btn>
          </div>
        </div>
      )}
      <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.grayLight }}>
              {cols.map(h => <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:600, color:C.gray }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {myOrders.map(o => (
              <tr key={o.id} style={{ borderTop:"1px solid #f5f5f5" }}>
                <td style={{ padding:"12px 14px", fontSize:13, fontWeight:500, color:C.info }}>{o.id}</td>
                <td style={{ padding:"12px 14px", fontSize:13 }}>{o.product}</td>
                <td style={{ padding:"12px 14px", fontSize:13 }}>{showFarmerCol ? o.farmer : o.buyer}</td>
                <td style={{ padding:"12px 14px", fontSize:13 }}>{o.qty}kg</td>
                <td style={{ padding:"12px 14px", fontSize:13, fontWeight:600 }}>{o.total?.toLocaleString()}</td>
                <td style={{ padding:"12px 14px" }}><Badge status={o.status} /></td>
                <td style={{ padding:"12px 14px", fontSize:12 }}>
                  {o.logistics ? (
                    <span style={{ color:C.primary, fontWeight:500, fontSize:12 }}>🚛 {o.logistics}</span>
                  ) : canChooseLogistics && o.status !== "cancelled" && o.status !== "delivered" ? (
                    <Btn size="sm" variant="info" onClick={() => setLogisticsModal(o.id)}>Choose</Btn>
                  ) : <span style={{ color:C.gray, fontSize:12 }}>—</span>}
                </td>
                <td style={{ padding:"12px 14px", fontSize:12, color:C.gray }}>{o.date}</td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {o.status === "pending" && !showFarmerCol && <Btn size="sm" variant="success" onClick={() => confirm(o.id)}>Confirm</Btn>}
                    {o.status === "confirmed" && !showFarmerCol && <Btn size="sm" variant="success" onClick={() => delivered(o.id)}>Delivered</Btn>}
                    {o.status === "confirmed" && canConfirmReceived && <Btn size="sm" variant="success" onClick={() => delivered(o.id)}>Received</Btn>}
                    {(o.status === "pending" || o.status === "confirmed") && (
                      <Btn size="sm" variant="danger" onClick={() => cancel(o.id)}>Cancel</Btn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {myOrders.length === 0 && <div style={{ textAlign:"center", padding:"2rem", color:C.gray }}>No orders yet.</div>}
      </div>
    </div>
  );
}