import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/Badge.jsx";
import Btn from "../components/common/Btn.jsx";
import Modal from "../components/common/Modal.jsx";
import Field from "../components/common/Field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { WEATHER_DATA } from "../data/mockData.js";
import { callAI, parseAIJson, AI_HEADERS } from "../utils/aihelper.js";
export default function WeatherPage() {
  const [weather,    setWeather]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [lastFetch,  setLastFetch]  = useState(null);

  const fetchWeather = async () => {
    setLoading(true); setError(null);
    try {
      const text = await callAI(
        `Search Kenya Meteorological Department and weather services for today's weather in Murang'a County Kenya. Return ONLY JSON (no markdown, no backticks):
{"current":{"temp":number,"feels":number,"humidity":number,"wind":number,"condition":"string","icon":"emoji"},"forecast":[{"day":"Mon","icon":"emoji","desc":"string","low":number,"high":number,"rain":number}],"alerts":[],"farmingAdvice":[{"title":"string","advice":"string","icon":"emoji","color":"#1D9E75"}],"source":"Kenya Met Dept","fetchedAt":"2026"}
7-day forecast required. Use realistic Murang'a highland climate data.`,
        "Return ONLY valid JSON. No markdown. No backticks. No explanation.",
        true
      );
      const parsed = parseAIJson(text);
      setWeather(parsed);
      setLastFetch(new Date());
    } catch(e) {
      console.warn("Weather API:", e.message);
      setError("Could not load live weather. Using cached data.");
      // Fallback to WEATHER_DATA
      setWeather({
        current:{ temp:WEATHER_DATA.current.temp, feels:WEATHER_DATA.current.feels, humidity:WEATHER_DATA.current.humidity, wind:WEATHER_DATA.current.wind, condition:WEATHER_DATA.current.condition, icon:WEATHER_DATA.current.icon },
        forecast:WEATHER_DATA.forecast.map(d=>({...d})),
        alerts:WEATHER_DATA.alerts,
        farmingAdvice:[
          { title:"Planting Window", advice:"Check tomorrow morning for updated planting advice.", icon:"🌱", color:C.primary },
          { title:"Irrigation",      advice:"Monitor soil moisture closely during dry spells.",    icon:"💧", color:C.info   },
        ],
        source:"Cached data (offline)",
        fetchedAt: new Date().toISOString(),
      });
      setLastFetch(new Date());
    }
    setLoading(false);
  };

  useEffect(() => { fetchWeather(); }, []);

  if (loading) return (
    <div style={{ padding:"3rem 2rem", textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🌦️</div>
      <div style={{ fontSize:16, color:C.gray, marginBottom:8 }}>Fetching live weather from Kenya Met Department…</div>
      <div style={{ width:200, height:4, background:C.grayLight, borderRadius:4, overflow:"hidden", margin:"0 auto" }}>
        <div style={{ height:"100%", width:"60%", background:C.primary, borderRadius:4, animation:"slide 1.5s ease-in-out infinite" }}/>
      </div>
      <style>{"@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}"}</style>
    </div>
  );

  const w = weather;
  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>🌦️ Live Weather Dashboard</h2>
          <p style={{ color:C.gray, fontSize:12, margin:"4px 0 0" }}>
            📡 {w?.source||"Kenya Meteorological Department"} · Updated: {lastFetch?.toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"})||"—"}
          </p>
        </div>
        <button onClick={fetchWeather} style={{ padding:"8px 18px", background:C.primary, color:"#fff", border:"none", borderRadius:9, fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          🔄 Refresh
        </button>
      </div>

      {error && <div style={{ background:"#FFF3CD", border:"1px solid #FFEAA7", borderRadius:9, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#856404" }}>⚠️ {error}</div>}

      {/* Alerts */}
      {(w?.alerts||[]).map((a,i)=>(
        <div key={i} style={{ background:a.type==="warning"?"#FFF3CD":"#E1F5EE", border:`1px solid ${a.type==="warning"?"#FFEAA7":"#A7DEC9"}`, borderRadius:10, padding:"11px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>{a.icon}</span>
          <div style={{ fontSize:13, color:a.type==="warning"?"#856404":C.primaryDark }}>{a.msg}</div>
        </div>
      ))}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Current weather */}
        <div style={{ background:"linear-gradient(135deg,#0F6E56,#1D9E75)", borderRadius:14, padding:"1.75rem", color:"#fff" }}>
          <div style={{ fontSize:12, opacity:0.8, marginBottom:10 }}>📍 Murang'a County · Now</div>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <span style={{ fontSize:64 }}>{w?.current?.icon||"🌤️"}</span>
            <div>
              <div style={{ fontSize:52, fontWeight:700, lineHeight:1 }}>{w?.current?.temp}°C</div>
              <div style={{ fontSize:14, opacity:0.85, marginTop:4 }}>{w?.current?.condition}</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[["Feels Like",`${w?.current?.feels}°C`],["Humidity",`${w?.current?.humidity}%`],["Wind",`${w?.current?.wind} km/h`]].map(([l,v])=>(
              <div key={l} style={{ background:"rgba(255,255,255,0.15)", borderRadius:9, padding:"10px 12px" }}>
                <div style={{ fontSize:11, opacity:0.75 }}>{l}</div>
                <div style={{ fontSize:16, fontWeight:700, marginTop:3 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day forecast */}
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:14, padding:"1.25rem" }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>7-Day Forecast</div>
          {(w?.forecast||[]).map((d,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:i<(w?.forecast?.length||0)-1?"1px solid #f5f5f5":"none" }}>
              <div style={{ width:38, fontSize:12, color:C.gray, fontWeight:i===0?700:400 }}>{d.day}</div>
              <span style={{ fontSize:20, width:26 }}>{d.icon}</span>
              <div style={{ flex:1, fontSize:12, color:C.gray, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.desc}</div>
              <div style={{ fontSize:12, color:C.info, whiteSpace:"nowrap" }}>{d.rain}%🌧</div>
              <div style={{ fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>{d.low}°–{d.high}°</div>
            </div>
          ))}
        </div>
      </div>

      {/* Farming advice from live data */}
      {(w?.farmingAdvice||[]).length > 0 && (
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:14, padding:"1.5rem" }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>🌱 Live Farming Advice — Based on Today's Weather</div>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(w.farmingAdvice.length,3)},1fr)`, gap:14 }}>
            {w.farmingAdvice.map((a,i)=>(
              <div key={i} style={{ background:a.color+"12", border:`1px solid ${a.color}30`, borderRadius:10, padding:"1rem" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{a.icon}</div>
                <div style={{ fontWeight:700, fontSize:13, color:C.dark, marginBottom:4 }}>{a.title}</div>
                <div style={{ fontSize:12, color:C.gray, lineHeight:1.5 }}>{a.advice}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

