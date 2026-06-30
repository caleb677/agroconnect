import { useState } from "react";
export default function StarRow({ value, onChange, size=24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:"flex", gap:4 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} onMouseEnter={()=>onChange&&setHover(s)} onMouseLeave={()=>onChange&&setHover(0)}
          onClick={()=>onChange&&onChange(s)}
          style={{ fontSize:size, cursor:onChange?"pointer":"default", color:(hover||value)>=s?"#F59E0B":"#d1d5db", transition:"color 0.1s" }}>★</span>
      ))}
    </div>
  );
}