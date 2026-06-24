import { useState } from "react";
import { C, inp } from "../utils/constants.js";

const DEMO_ORDERS = [
  {
    id:"ORD-2025-001", product:"Maize 50kg", seller:"John Kamau", buyer:"Sarah Waweru",
    status:"in_transit", eta:"Today 4:00 PM", driver:"Moses Kibet", driverPhone:"0712345678",
    steps:[
      { label:"Order Placed",     done:true,  time:"8:00 AM" },
      { label:"Seller Confirmed", done:true,  time:"8:45 AM" },
      { label:"Picked Up",        done:true,  time:"10:30 AM" },
      { label:"In Transit",       done:true,  time:"11:15 AM" },
      { label:"Out for Delivery", done:true,  time:"1:30 PM" },
      { label:"Delivered",        done:false, time:"Expected 4:00 PM" },
    ],
  },
  {
    id:"ORD-2025-002", product:"Tomatoes (2 crates)", seller:"Mary Wanjiru", buyer:"David Mwangi",
    status:"delivered", eta:"Delivered", driver:"Anne Njeri", driverPhone:"0723456789",
    steps:[
      { label:"Order Placed",     done:true, time:"Yesterday 9:00 AM" },
      { label:"Seller Confirmed", done:true, time:"Yesterday 9:30 AM" },
      { label:"Picked Up",        done:true, time:"Yesterday 11:00 AM" },
      { label:"In Transit",       done:true, time:"Yesterday 12:00 PM" },
      { label:"Out for Delivery", done:true, time:"Yesterday 2:00 PM" },
      { label:"Delivered",        done:true, time:"Yesterday 3:45 PM" },
    ],
  },
];

export default function DeliveryPage() {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = DEMO_ORDERS.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.product.toLowerCase().includes(search.toLowerCase())
  );

  const order = selected || (filtered.length === 1 ? filtered[0] : null);

  return (
    <div style={{ padding:"1.5rem 2rem", maxWidth:800, margin:"0 auto" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, marginBottom:4 }}>🚚 Delivery Tracking</h2>
      <p style={{ color:C.gray, fontSize:13, marginBottom:20 }}>Track your orders in real-time</p>

      <div style={{ marginBottom:20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Order ID or product name…"
          style={inp}
        />
      </div>

      {!order && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(o => (
            <div
              key={o.id}
              onClick={() => setSelected(o)}
              style={{
                background:"#fff", borderRadius:12, padding:"14px 18px", cursor:"pointer",
                border:(o.status === "delivered" ? "2px solid " + C.primary : "2px solid #eee"),
                display:"flex", alignItems:"center", gap:14,
                boxShadow:"0 1px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize:28 }}>{o.status === "delivered" ? "✅" : "🚚"}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13, color:C.dark }}>{o.product}</div>
                <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>{o.id} • {o.seller} → {o.buyer}</div>
              </div>
              <span style={{
                background: o.status === "delivered" ? C.primaryLight : "#FEF3C7",
                color:      o.status === "delivered" ? C.primary      : "#92400E",
                borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:600,
              }}>
                {o.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ background:"#fff", borderRadius:12, padding:"3rem", textAlign:"center", color:C.gray }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🔍</div>
              <div>No orders found for "{search}"</div>
            </div>
          )}
        </div>
      )}

      {order && (
        <div style={{ background:"#fff", borderRadius:14, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:C.dark }}>{order.product}</div>
              <div style={{ fontSize:12, color:C.gray, marginTop:3 }}>{order.id}</div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background:"#f0f0ee", border:"none", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13 }}
            >
              ← Back
            </button>
          </div>

          <div style={{
            background: order.status === "delivered" ? C.primaryLight : "#FEF3C7",
            borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12,
          }}>
            <span style={{ fontSize:22 }}>{order.status === "delivered" ? "✅" : "⏱️"}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:C.dark }}>
                {order.status === "delivered" ? "Successfully Delivered!" : "ETA: " + order.eta}
              </div>
              <div style={{ fontSize:12, color:C.gray }}>Driver: {order.driver} • {order.driverPhone}</div>
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            {order.steps.map((s, i) => (
              <div key={i} style={{ display:"flex", gap:12 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{
                    width:28, height:28, borderRadius:14,
                    border:(s.done ? "2px solid " + C.primary : "2px solid #ddd"),
                    background: s.done ? C.primary : "#fff",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, color:"#fff", flexShrink:0,
                  }}>
                    {s.done ? "✓" : ""}
                  </div>
                  {i < order.steps.length - 1 && (
                    <div style={{ width:2, flex:1, minHeight:24, background: s.done ? C.primary : "#ddd", margin:"2px 0" }} />
                  )}
                </div>
                <div style={{ paddingBottom:20 }}>
                  <div style={{ fontWeight: s.done ? 600 : 400, fontSize:13, color: s.done ? C.dark : C.gray }}>{s.label}</div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>{s.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:C.grayLight, borderRadius:10, padding:"12px 16px", fontSize:13 }}>
            <div style={{ fontWeight:600, marginBottom:6 }}>📍 Route</div>
            <div style={{ color:C.gray }}>
              <span style={{ color:C.danger }}>📌 {order.seller}</span>
              {" → "}
              <span style={{ color:C.primary }}>🏠 {order.buyer}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
