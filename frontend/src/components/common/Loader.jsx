import { C } from "../../utils/constants.js";
export default function Loader({ text = "Loading…" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", gap:12 }}>
      <div style={{ width:36, height:36, border:`4px solid ${C.primaryLight}`, borderTop:`4px solid ${C.primary}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <span style={{ color:C.gray, fontSize:13 }}>{text}</span>
    </div>
  );
}