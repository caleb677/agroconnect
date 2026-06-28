import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/flashresult.jsx";
import { MOCK_TRANSPORT, MOCK_SHIPMENTS } from "../data/mockData.js";
export default function TransportPage({ role }) {
  const [companies, setCompanies] = useState(MOCK_TRANSPORT);
  const [shipments, setShipments] = useState(MOCK_SHIPMENTS);
  const [tab, setTab] = useState("companies");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company:"", contact:"", phone:"", counties:"", vehicles:"" });
  const [selectModal, setSelectModal] = useState(null);

  const addCompany = () => {
    if (!form.company || !form.contact) return;
    setCompanies([...companies, { id:`TRP-00${companies.length+1}`, company:form.company, contact:form.contact, phone:form.phone, counties:form.counties.split(",").map(s=>s.trim()), vehicles:+form.vehicles||0, status:"active", rating:0 }]);
    setForm({ company:"", contact:"", phone:"", counties:"", vehicles:"" });
    setShowForm(false);
  };

  const isAdmin = role === "Admin";
  const isFarmerOrAgrovet = role === "Farmer" || role === "Agrovet";

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>🚛 Transport & Logistics</h2>
          <p style={{ color:C.gray, fontSize:13, margin:"4px 0 0" }}>
            {isFarmerOrAgrovet ? "Select a transport company for your order" : "Manage transport companies and shipments"}
          </p>
        </div>
        {isAdmin && tab==="companies" && <Btn onClick={() => setShowForm(!showForm)}>+ Add Company</Btn>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Transport Partners", value:companies.length,                                    icon:"🏢", color:C.primary },
          { label:"Active Companies",   value:companies.filter(c=>c.status==="active").length,     icon:"✅", color:"#3B6D11" },
          { label:"Total Vehicles",     value:companies.reduce((a,c)=>a+c.vehicles,0),             icon:"🚚", color:C.info   },
          { label:"Active Shipments",   value:shipments.filter(s=>s.status==="in-transit").length, icon:"📦", color:C.accent },
        ].map((s,i) => (
          <div key={i} style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1rem 1.25rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:11, color:C.gray, marginBottom:6 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:C.dark }}>{s.value}</div>
              </div>
              <div style={{ fontSize:22 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>
      {showForm && isAdmin && (
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem", marginBottom:20 }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>Register New Transport Company</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
            {[["Company Name","company","text","e.g. Swifthaul Logistics"],["Contact Person","contact","text","Full name"],["Phone","phone","tel","0700 000 000"],["Service Counties","counties","text","Nairobi, Nakuru"],["Fleet Size","vehicles","number","Num vehicles"]].map(([label,key,type,placeholder])=>(
              <div key={key}><label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:4 }}>{label}</label><input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder} style={inp} /></div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={addCompany}>Save Company</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </div>
      )}
      <div style={{ display:"flex", gap:4, background:C.grayLight, borderRadius:10, padding:4, width:"fit-content", marginBottom:20 }}>
        {[["companies","🏢 Companies"],["shipments","📦 Shipments"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:"8px 20px", background:tab===id?"#fff":"transparent", color:tab===id?C.dark:C.gray, border:"none", borderRadius:8, cursor:"pointer", fontWeight:tab===id?600:400, fontSize:13 }}>{label}</button>
        ))}
      </div>
      {tab === "companies" && (
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.grayLight }}>
                {["Company","Contact","Phone","Counties Served","Fleet","Rating","Status","Action"].map(h=><th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:600, color:C.gray }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id} style={{ borderTop:"1px solid #f5f5f5" }}>
                  <td style={{ padding:"12px 14px" }}><div style={{ fontWeight:600, fontSize:13 }}>{c.company}</div><div style={{ fontSize:11, color:C.gray }}>{c.id}</div></td>
                  <td style={{ padding:"12px 14px", fontSize:13 }}>{c.contact}</td>
                  <td style={{ padding:"12px 14px", fontSize:13 }}>{c.phone}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {c.counties.slice(0,3).map(cn=><span key={cn} style={{ background:C.primaryLight, color:C.primaryDark, borderRadius:5, padding:"2px 7px", fontSize:11 }}>{cn}</span>)}
                      {c.counties.length>3 && <span style={{ fontSize:11, color:C.gray }}>+{c.counties.length-3}</span>}
                    </div>
                  </td>
                  <td style={{ padding:"12px 14px", fontSize:13, fontWeight:600 }}>{c.vehicles} 🚚</td>
                  <td style={{ padding:"12px 14px", fontSize:13 }}>{c.rating>0?<span style={{ color:"#BA7517",fontWeight:600 }}>★ {c.rating}</span>:<span style={{ color:C.gray }}>—</span>}</td>
                  <td style={{ padding:"12px 14px" }}><Badge status={c.status} /></td>
                  <td style={{ padding:"12px 14px" }}>
                    {isFarmerOrAgrovet ? (
                      <Btn size="sm" variant={c.status==="active"?"primary":"ghost"} onClick={() => c.status==="active" && setSelectModal(c)} style={{ opacity:c.status!=="active"?0.5:1 }}>
                        {c.status==="active" ? "Select" : "Inactive"}
                      </Btn>
                    ) : isAdmin && (
                      <Btn size="sm" variant={c.status==="active"?"danger":"success"} onClick={()=>setCompanies(companies.map(x=>x.id===c.id?{...x,status:x.status==="active"?"inactive":"active"}:x))}>
                        {c.status==="active"?"Deactivate":"Activate"}
                      </Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "shipments" && (
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.grayLight }}>
                {["Shipment ID","Order","Company","Route","Produce","Driver","ETA","Status","Action"].map(h=><th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:600, color:C.gray }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {shipments.map(s => (
                <tr key={s.id} style={{ borderTop:"1px solid #f5f5f5" }}>
                  <td style={{ padding:"12px 14px", fontSize:13, fontWeight:600, color:C.info }}>{s.id}</td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:C.gray }}>{s.order}</td>
                  <td style={{ padding:"12px 14px", fontSize:13 }}>{s.company}</td>
                  <td style={{ padding:"12px 14px", fontSize:13 }}><span style={{ color:C.primaryDark }}>{s.from}</span><span style={{ color:C.gray, margin:"0 4px" }}>→</span><span style={{ color:C.dark }}>{s.to}</span></td>
                  <td style={{ padding:"12px 14px", fontSize:13 }}>{s.produce}</td>
                  <td style={{ padding:"12px 14px", fontSize:13 }}>{s.driver}</td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:C.gray }}>{s.eta}</td>
                  <td style={{ padding:"12px 14px" }}><Badge status={s.status} /></td>
                  <td style={{ padding:"12px 14px" }}>
                    {s.status==="pending" && <Btn size="sm" variant="info" onClick={()=>setShipments(shipments.map(x=>x.id===s.id?{...x,status:"in-transit",driver:"Peter Njenga"}:x))}>Dispatch</Btn>}
                    {s.status==="in-transit" && <Btn size="sm" variant="success" onClick={()=>setShipments(shipments.map(x=>x.id===s.id?{...x,status:"delivered"}:x))}>Delivered</Btn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectModal && (
        <Modal title="Confirm Transport Selection" onClose={() => setSelectModal(null)} width={400}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:8 }}>{selectModal.company}</div>
            <div style={{ fontSize:13, color:C.gray }}>Contact: {selectModal.contact} · {selectModal.phone}</div>
            <div style={{ fontSize:13, color:C.gray, marginTop:4 }}>Covers: {selectModal.counties.join(", ")}</div>
            <div style={{ fontSize:13, color:C.gray, marginTop:4 }}>Fleet: {selectModal.vehicles} vehicles · ★ {selectModal.rating}</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={() => setSelectModal(null)}>Confirm Selection</Btn>
            <Btn variant="ghost" onClick={() => setSelectModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}