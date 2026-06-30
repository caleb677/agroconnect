import { C } from "../../utils/constants.js";
export default function Modal({ title, onClose, children, width=520 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:width, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.25rem 1.5rem", borderBottom:"1px solid #eee" }}>
          <span style={{ fontWeight:700, fontSize:16, color:C.dark }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.gray, lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:"1.5rem" }}>{children}</div>
      </div>
    </div>
  );
}