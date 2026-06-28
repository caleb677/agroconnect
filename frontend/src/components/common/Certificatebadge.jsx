import { useState, useEffect, useRef } from "react";
import { C } from "../../utils/constants.js";
import Modal from "./modal.jsx";
import Btn from "./btn.jsx";
import FlashResult from "./flashresult.jsx";
import Field from "./field.jsx";
export default function CertificateBadge({ cert, onClose }) {
  const [qrScanMode, setQrScanMode] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  // Generate a QR-like grid from cert data (deterministic from certId)
  const makeQrGrid = (seed) => {
    const cells = [];
    let hash = 0;
    for (let i=0;i<(seed||"CERT").length;i++) hash = ((hash<<5)-hash)+seed.charCodeAt(i);
    const size = 21;
    for (let r=0;r<size;r++) for (let c=0;c<size;c++) {
      // Finder patterns (corners)
      const inFinder = (r<7&&c<7)||(r<7&&c>=size-7)||(r>=size-7&&c<7);
      if (inFinder) { cells.push((r===0||r===6||c===0||c===6||r===3&&c>0&&c<6||c===3&&r>0&&r<6)?1:0); continue; }
      // Data cells from hash
      const bit = (hash^(r*size+c)*2654435769)&1;
      cells.push(bit);
    }
    return { cells, size };
  };
  const { cells, size } = makeQrGrid(cert.certId||"AGRO-CERT");
  const qrPattern = cert.certId ? cert.certId.split("").map((c,i)=>i%2===0?1:0) : [];

  // Scan simulation — in production this would use a real QR scanner library
  const handleScan = () => {
    setQrScanMode(true);
    setTimeout(()=>{
      setScanResult({ verified:true, certId:cert.certId, name:cert.farmerName||cert.name, produce:cert.produce, issued:cert.issued, expiry:cert.expiry });
      setQrScanMode(false);
    }, 2000);
  };
  return (
    <Modal title="Digital Certificate" onClose={onClose} width={520}>
      <div style={{ textAlign:"center" }}>
        <div style={{
          background:"linear-gradient(135deg, #0F6E56, #1D9E75)",
          borderRadius:16, padding:"2rem", color:"#fff", marginBottom:16, position:"relative", overflow:"hidden"
        }}>
          <div style={{ position:"absolute", top:-20, right:-20, width:120, height:120, background:"rgba(255,255,255,0.06)", borderRadius:"50%" }} />
          <div style={{ position:"absolute", bottom:-30, left:-20, width:100, height:100, background:"rgba(255,255,255,0.06)", borderRadius:"50%" }} />
          <div style={{ fontSize:40, marginBottom:8 }}>🏅</div>
          <div style={{ fontWeight:700, fontSize:20, marginBottom:4 }}>CERTIFIED FARMER</div>
          <div style={{ fontSize:14, opacity:0.85, marginBottom:16 }}>AgroConnect Kenya</div>
          <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:10, padding:"12px 16px", marginBottom:12 }}>
            <div style={{ fontSize:18, fontWeight:700 }}>{cert.farmer}</div>
            <div style={{ fontSize:13, opacity:0.85, marginTop:2 }}>{cert.produce} · {cert.level || "Certified Farmer"}</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12, fontSize:12 }}>
            <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"8px" }}>
              <div style={{ opacity:0.75 }}>Certificate ID</div>
              <div style={{ fontWeight:600, marginTop:2 }}>{cert.certId || "Pending"}</div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"8px" }}>
              <div style={{ opacity:0.75 }}>Issued</div>
              <div style={{ fontWeight:600, marginTop:2 }}>{cert.issued || "—"}</div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"8px" }}>
              <div style={{ opacity:0.75 }}>Expires</div>
              <div style={{ fontWeight:600, marginTop:2 }}>{cert.expiry || "—"}</div>
            </div>
          </div>
          {/* QR Code — deterministic grid from certId */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:8, gap:6 }}>
            <div style={{ background:"#fff", borderRadius:8, padding:8, display:"inline-block" }}>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${size},4px)`, gap:0.5 }}>
                {cells.map((v,i)=><div key={i} style={{ width:4,height:4,background:v?"#0F6E56":"#fff",borderRadius:v?1:0 }}/>)}
              </div>
            </div>
            <div style={{ fontSize:10,opacity:0.7,fontFamily:"monospace" }}>{cert.certId}</div>
            {scanResult ? (
              <div style={{ background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"6px 12px",fontSize:11,textAlign:"center" }}>✅ Verified · {scanResult.name} · {scanResult.produce}</div>
            ) : qrScanMode ? (
              <div style={{ fontSize:11,opacity:0.8 }}>🔍 Scanning…</div>
            ) : (
              <button onClick={handleScan} style={{ background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.4)",color:"#fff",borderRadius:8,padding:"5px 14px",cursor:"pointer",fontSize:11,fontWeight:600 }}>📷 Verify QR</button>
            )}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <Btn>⬇️ Download PDF Certificate</Btn>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
        </div>
        <div style={{ marginTop:12, fontSize:12, color:C.gray }}>
          Blockchain Hash: <span style={{ fontFamily:"monospace", color:C.primary }}>0x{cert.certId?.replace(/\D/g,"").slice(0,16) || "pending..."}</span>
        </div>
      </div>
    </Modal>
  );
}