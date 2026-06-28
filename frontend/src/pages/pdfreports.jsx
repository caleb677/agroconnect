import { useState } from "react";
import { C } from "../utils/constants.js";
import Alert from "../components/common/Alert.jsx";

// Simple PDF generation using browser print / data URI
function generateCSV(rows, headers) {
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => `"${r[h]||""}"`).join(","))];
  return lines.join("\n");
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function buildHTMLReport(title, sections) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${title}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; margin: 40px; color: #2C2C2A; }
  h1 { color: #0F6E56; border-bottom: 3px solid #0F6E56; padding-bottom: 10px; }
  h2 { color: #0F6E56; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #0F6E56; color: #fff; padding: 10px 12px; text-align: left; font-size: 13px; }
  td { padding: 9px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
  tr:nth-child(even) td { background: #f8f8f6; }
  .meta { color: #888; font-size: 12px; margin-bottom: 30px; }
  .summary { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
  .stat { background: #E1F5EE; border-radius: 10px; padding: 14px 20px; min-width: 140px; }
  .stat .val { font-size: 24px; font-weight: 700; color: #0F6E56; }
  .stat .lbl { font-size: 12px; color: #888; margin-top: 2px; }
  @media print { body { margin: 20px; } }
</style></head><body>
<h1>🌱 AgroConnect — ${title}</h1>
<div class="meta">Generated: ${new Date().toLocaleString("en-KE")} | Murang'a County Agricultural Platform</div>
${sections.map(s => `
  ${s.title ? `<h2>${s.title}</h2>` : ""}
  ${s.summary ? `<div class="summary">${s.summary.map(x=>`<div class="stat"><div class="val">${x.val}</div><div class="lbl">${x.lbl}</div></div>`).join("")}</div>` : ""}
  ${s.table ? `<table><tr>${s.headers.map(h=>`<th>${h}</th>`).join("")}</tr>${s.table.map(row=>`<tr>${s.headers.map(h=>`<td>${row[h]||"-"}</td>`).join("")}</tr>`).join("")}</table>` : ""}
  ${s.text ? `<p>${s.text}</p>` : ""}
`).join("")}
<div style="margin-top:40px;border-top:1px solid #eee;padding-top:12px;font-size:11px;color:#aaa;">
  Printed from AgroConnect Kenya Platform © ${new Date().getFullYear()}
</div>
</body></html>`;
}

const REPORT_TYPES = [
  {
    id:"market",
    icon:"📈",
    title:"Market Prices Report",
    desc:"Current produce prices across Murang'a wards",
    color:C.primary,
    generate() {
      const rows = [
        { Crop:"Maize (90kg)", Ward:"Kandara", Price:"KES 2,800", Trend:"↑ +5%", Date:"Today" },
        { Crop:"Potatoes (90kg)", Ward:"Kiharu", Price:"KES 4,500", Trend:"↓ -2%", Date:"Today" },
        { Crop:"Tomatoes (crate)", Ward:"Maragua", Price:"KES 1,200", Trend:"↑ +8%", Date:"Today" },
        { Crop:"Beans (90kg)", Ward:"Kangema", Price:"KES 9,800", Trend:"→ 0%", Date:"Today" },
        { Crop:"Milk (litre)", Ward:"Gatanga", Price:"KES 55", Trend:"↑ +3%", Date:"Today" },
        { Crop:"Cabbages (bag)", Ward:"Mathioya", Price:"KES 800", Trend:"↓ -10%", Date:"Today" },
      ];
      const html = buildHTMLReport("Market Prices Report", [{
        title:"Current Market Prices — Murang'a County",
        summary:[ {val:"6",lbl:"Crops tracked"},{val:"7",lbl:"Wards covered"},{val:"KES 3.2K",lbl:"Avg price"} ],
        table:rows, headers:["Crop","Ward","Price","Trend","Date"]
      }]);
      const win = window.open("","_blank");
      win.document.write(html); win.document.close(); win.print();
    }
  },
  {
    id:"users",
    icon:"👥",
    title:"Users Report",
    desc:"Registered farmers, buyers and agrovets",
    color:C.info,
    generate() {
      const rows = [
        { Name:"John Kamau",   Role:"Farmer",  Ward:"Kandara",   Status:"Active",  Joined:"Jan 2025" },
        { Name:"Mary Wanjiru", Role:"Farmer",  Ward:"Kiharu",    Status:"Active",  Joined:"Feb 2025" },
        { Name:"Peter Njoroge",Role:"Buyer",   Ward:"Maragua",   Status:"Active",  Joined:"Mar 2025" },
        { Name:"Ann Waweru",   Role:"Agrovet", Ward:"Kangema",   Status:"Active",  Joined:"Jan 2025" },
        { Name:"David Mwangi", Role:"Farmer",  Ward:"Mathioya",  Status:"Pending", Joined:"Jun 2025" },
        { Name:"Grace Njeri",  Role:"Buyer",   Ward:"Gatanga",   Status:"Active",  Joined:"Apr 2025" },
      ];
      const html = buildHTMLReport("Users Report", [{
        title:"Registered Platform Users",
        summary:[ {val:"2,847",lbl:"Total users"},{val:"1,284",lbl:"Farmers"},{val:"892",lbl:"Buyers"},{val:"671",lbl:"Agrovets"} ],
        table:rows, headers:["Name","Role","Ward","Status","Joined"]
      }]);
      const win = window.open("","_blank");
      win.document.write(html); win.document.close(); win.print();
    }
  },
  {
    id:"orders",
    icon:"📦",
    title:"Orders Report",
    desc:"Sales and purchase orders summary",
    color:C.accent,
    generate() {
      const rows = [
        { "Order ID":"ORD-001", Product:"Maize 50kg",    Buyer:"Sarah W.",   Amount:"KES 2,800", Status:"Delivered", Date:"Today" },
        { "Order ID":"ORD-002", Product:"Potatoes 90kg", Buyer:"David M.",   Amount:"KES 4,500", Status:"In Transit", Date:"Today" },
        { "Order ID":"ORD-003", Product:"Tomatoes",      Buyer:"Anne K.",    Amount:"KES 1,200", Status:"Pending",   Date:"Yesterday" },
        { "Order ID":"ORD-004", Product:"Certified Seeds",Buyer:"James N.", Amount:"KES 850",   Status:"Delivered", Date:"Yesterday" },
        { "Order ID":"ORD-005", Product:"Dairy Feed",    Buyer:"Lucy W.",    Amount:"KES 3,600", Status:"Confirmed", Date:"2 days ago" },
      ];
      const html = buildHTMLReport("Orders Report", [{
        title:"Sales Orders Summary",
        summary:[ {val:"94",lbl:"Orders today"},{val:"KES 142K",lbl:"Revenue today"},{val:"78%",lbl:"Delivery rate"} ],
        table:rows, headers:["Order ID","Product","Buyer","Amount","Status","Date"]
      }]);
      const win = window.open("","_blank");
      win.document.write(html); win.document.close(); win.print();
    }
  },
  {
    id:"myfarm",
    icon:"🌾",
    title:"My Farm Report",
    desc:"Your farm diary, listings and income summary",
    color:"#7c3aed",
    generate() {
      const rows = [
        { Activity:"Planted Maize", Date:"Jan 15, 2025", Notes:"Used certified seeds, 2 acres", Cost:"KES 3,200" },
        { Activity:"Applied Fertilizer", Date:"Feb 1, 2025", Notes:"CAN fertilizer, 50kg", Cost:"KES 2,100" },
        { Activity:"Weeding", Date:"Mar 10, 2025", Notes:"Hired 3 laborers", Cost:"KES 1,500" },
        { Activity:"Sprayed pesticide", Date:"Apr 5, 2025", Notes:"Aphid control", Cost:"KES 800" },
        { Activity:"Harvested", Date:"May 20, 2025", Notes:"Yield: 18 bags (90kg each)", Cost:"-" },
        { Activity:"Sold produce", Date:"May 25, 2025", Notes:"Sold 15 bags at KES 2,800", Cost:"KES +42,000" },
      ];
      const html = buildHTMLReport("My Farm Report", [{
        title:"Farm Activity Log — 2025 Season",
        summary:[ {val:"2 acres",lbl:"Farm size"},{val:"18 bags",lbl:"Harvest"},{val:"KES 42K",lbl:"Revenue"},{val:"KES 7.6K",lbl:"Total cost"} ],
        table:rows, headers:["Activity","Date","Notes","Cost"]
      }]);
      const win = window.open("","_blank");
      win.document.write(html); win.document.close(); win.print();
    }
  },
];

export default function PDFReportsPage({ role }) {
  const [flash, setFlash] = useState(null);

  const handleGenerate = (report) => {
    try {
      report.generate();
      setFlash({ type:"success", msg:String(report.title) + " opened for printing/saving as PDF" });
    } catch(e) {
      setFlash({ type:"error", msg:"Could not generate report. Allow popups for this site." });
    }
  };

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, marginBottom:4 }}>📄 PDF Reports</h2>
      <p style={{ color:C.gray, fontSize:13, marginBottom:20 }}>Generate and download platform reports. Choose "Save as PDF" in the print dialog.</p>

      {flash && <Alert type={flash.type} msg={flash.msg} onClose={() => setFlash(null)} />}

      <div style={{ background:"#FEF3C7", borderRadius:10, padding:"12px 16px", marginBottom:24, fontSize:13, color:"#92400E" }}>
        💡 Tip: When the print dialog opens, select <strong>Save as PDF</strong> as the destination to download a PDF file.
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {REPORT_TYPES.map(r => (
          <div key={r.id} style={{ background:"#fff", borderRadius:14, padding:20, border:`1px solid ${r.color}22`, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>{r.icon}</div>
            <div style={{ fontWeight:700, fontSize:15, color:C.dark, marginBottom:4 }}>{r.title}</div>
            <div style={{ fontSize:12, color:C.gray, marginBottom:16 }}>{r.desc}</div>
            <button onClick={()=>handleGenerate(r)} style={{
              background:r.color, color:"#fff", border:"none", borderRadius:8, padding:"9px 18px",
              cursor:"pointer", fontSize:13, fontWeight:600, width:"100%"
            }}>📄 Generate Report</button>
          </div>
        ))}
      </div>
    </div>
  );
}
