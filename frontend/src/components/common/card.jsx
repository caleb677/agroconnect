import { C } from "../../utils/constants.js";
export default function StatCard({ label, value, icon, change, color }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.2rem 1.25rem", flex:1, minWidth:150 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:12, color:C.gray, marginBottom:8 }}>{label}</div>
          <div style={{ fontSize:24, fontWeight:700, color:C.dark }}>{value}</div>
          {change!=null && <div style={{ fontSize:12, color:change>0?C.primary:C.danger, marginTop:4 }}>{change>0?"↑":"↓"} {Math.abs(change)}% this week</div>}
        </div>
        <div style={{ width:40, height:40, background:color+"20", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
      </div>
    </div>
  );
}