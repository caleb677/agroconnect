import { C } from "../../utils/constants.js";
export default function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:5, fontWeight:500 }}>{label}</label>
      {children}
    </div>
  );
}