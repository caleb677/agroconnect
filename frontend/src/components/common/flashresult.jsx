import { useEffect } from "react";
import { C } from "../../utils/constants.js";
// ─── ANIMATED RESULT OVERLAY ───────────────────────────────────────────────────
export default function FlashResult({ type, title, sub, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, []);
  const ok = type === "success";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.52)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fr-pop { 0%{transform:scale(0.35);opacity:0} 65%{transform:scale(1.09)} 100%{transform:scale(1);opacity:1} }
        @keyframes fr-shake { 0%,100%{transform:scale(1) translateX(0)} 20%,60%{transform:scale(1) translateX(-9px)} 40%,80%{transform:scale(1) translateX(9px)} }
        @keyframes fr-circle { 0%{stroke-dashoffset:226} 100%{stroke-dashoffset:0} }
        @keyframes fr-draw { 0%{stroke-dashoffset:60} 100%{stroke-dashoffset:0} }
        @keyframes fr-fade-up { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes fr-bg-success { 0%{opacity:0} 100%{opacity:1} }
        .fr-card-ok   { animation: fr-pop   0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .fr-card-fail { animation: fr-pop 0.4s ease forwards; }
        .fr-card-fail .fr-icon-wrap { animation: fr-shake 0.5s 0.42s ease both; }
        .fr-circle    { stroke-dasharray:226; stroke-dashoffset:226; animation: fr-circle 0.65s 0.05s ease forwards; }
        .fr-check     { stroke-dasharray:60;  stroke-dashoffset:60;  animation: fr-draw   0.4s  0.6s  ease forwards; }
        .fr-x1        { stroke-dasharray:50;  stroke-dashoffset:50;  animation: fr-draw   0.3s  0.5s  ease forwards; }
        .fr-x2        { stroke-dasharray:50;  stroke-dashoffset:50;  animation: fr-draw   0.3s  0.72s ease forwards; }
        .fr-text      { animation: fr-fade-up 0.4s 0.72s ease both; }
        .fr-ring-ok   { fill: #e8faf3; animation: fr-bg-success 0.5s 0.55s ease both; opacity:0; }
        .fr-ring-fail { fill: #fdecea; animation: fr-bg-success 0.5s 0.45s ease both; opacity:0; }
      `}</style>
      <div className={ok ? "fr-card-ok" : "fr-card-fail"} style={{ background:"#fff", borderRadius:28, padding:"2.75rem 3rem", textAlign:"center", boxShadow:"0 32px 90px rgba(0,0,0,0.28)", minWidth:290, maxWidth:370 }}>
        <div className="fr-icon-wrap" style={{ display:"inline-block", marginBottom:18 }}>
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className={ok ? "fr-ring-ok" : "fr-ring-fail"} cx="45" cy="45" r="45" />
            <circle className="fr-circle" cx="45" cy="45" r="36" stroke={ok ? C.primary : C.danger} strokeWidth="4.5" fill="none" strokeLinecap="round" />
            {ok ? (
              <polyline className="fr-check" points="27,47 40,60 63,33" stroke={C.primary} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <>
                <line className="fr-x1" x1="30" y1="30" x2="60" y2="60" stroke={C.danger} strokeWidth="5" strokeLinecap="round" />
                <line className="fr-x2" x1="60" y1="30" x2="30" y2="60" stroke={C.danger} strokeWidth="5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </div>
        <div className="fr-text">
          <div style={{ fontSize:21, fontWeight:700, color: ok ? C.primaryDark : C.danger, marginBottom:7 }}>{title}</div>
          {sub && <div style={{ fontSize:13, color:C.gray, lineHeight:1.6 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}