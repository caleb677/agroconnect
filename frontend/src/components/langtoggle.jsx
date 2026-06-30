import { useLang } from "../utils/lang.js";
import { C } from "../utils/constants.js";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "sw" : "en")}
      title={lang === "en" ? "Switch to Kiswahili" : "Switch to English"}
      style={{
        background: "rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)",
        color:"#fff", borderRadius:20, padding:"5px 13px", fontSize:12, fontWeight:700,
        cursor:"pointer", display:"flex", alignItems:"center", gap:5
      }}
    >
      🌐 {lang === "en" ? "EN | SW" : "SW | EN"}
    </button>
  );
}
