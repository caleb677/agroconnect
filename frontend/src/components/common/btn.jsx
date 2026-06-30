import { C } from "../../utils/constants.js";
export default function Btn({ onClick, children, variant="primary", size="md", style:extra={} }) {
  const base = { border:"none", borderRadius:8, cursor:"pointer", fontWeight:500, fontFamily:"inherit", transition:"all 0.15s" };
  const sizes = { sm:{ padding:"4px 10px", fontSize:12 }, md:{ padding:"8px 18px", fontSize:13 }, lg:{ padding:"11px 24px", fontSize:14 } };
  const variants = {
    primary:  { background:C.primary,   color:"#fff" },
    danger:   { background:C.dangerLight, color:C.danger },
    info:     { background:C.infoLight,   color:C.info },
    success:  { background:"#EAF3DE",     color:"#3B6D11" },
    ghost:    { background:C.grayLight,   color:C.dark },
    accent:   { background:C.accent,      color:"#fff" },
  };
  return <button onClick={onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}>{children}</button>;
}