import { useState, useEffect, useRef } from "react";
import { C } from "../utils/constants.js";
import { AI_HEADERS, AI_ENDPOINT, IS_ARTIFACT, callAI } from "../utils/aiHelper.js";
export default function AIAdvisoryChat({ onClose }) {
  const [messages, setMessages] = useState([
    { from:"ai", text:"Hello! I'm your AgroConnect AI Advisor 🌱 — powered by Claude AI with live web search.\n\nAsk me about:\n• Crop diseases & pest control\n• Fertilizer recommendations\n• Live weather & planting windows\n• Market prices & selling tips\n• Farm certification guidance\n\nWhat can I help you with today?" }
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel]   = useState("claude"); // claude | gpt | deepseek
  const endRef = useRef(null);

  const MODEL_LABELS = {
    claude:   { label:"Claude AI",  icon:"🤖", color:"#1D9E75" },
    gpt:      { label:"GPT-4",      icon:"💬", color:"#10A37F" },
    deepseek: { label:"DeepSeek",   icon:"🔍", color:"#4F46E5" },
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { from:"user", text:input };
    const userInput = input;
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `You are AgroConnect AI Advisor — an expert agricultural assistant for farmers, buyers, and agrovets in Murang'a County, Kenya. You have live web search access.

When answering:
- Search for live Kenya market prices, weather from Kenya Meteorological Department, and current farming news when relevant
- Give practical, actionable advice specific to Murang'a County highland conditions
- Include product names, prices in KES, local suppliers where relevant
- Use emojis to highlight key points
- Be concise but thorough
- Current model persona: ${MODEL_LABELS[model].label} ${MODEL_LABELS[model].icon}

Focus on: organic farming, horticulture, dairy, poultry, avocado, tea, maize, beans in Central Kenya.`;

      const aiText = await callAI(userInput, systemPrompt, true);
      setMessages(m => [...m, { from:"ai", text: aiText || "I couldn't get a response. Please try again.", model }]);
    } catch(err) {
      // Smart fallback responses when API unavailable
      const q = userInput.toLowerCase();
      let fallback = "";
      if (q.includes("maize") || q.includes("corn")) {
        fallback = "🌽 **Maize Advice (Murang'a)**\n\n• **Best varieties**: DK8031, H614D, WH505 for highlands\n• **Planting**: March–April (long rains) or October–November (short rains)\n• **Spacing**: 75cm × 25cm, 1 seed per hole\n• **Fertilizer**: Basal DAP (50kg/acre), top-dress CAN at 6 weeks\n• **Common pests**: Fall Army Worm — spray Ampligo 150ZC\n• **Current price**: ~KES 2,800–3,200 per 90kg bag";
      } else if (q.includes("tomato")) {
        fallback = "🍅 **Tomato Farming Tips**\n\n• **Varieties**: Rambo F1, Tylka F1 (blight-resistant)\n• **Nursery**: 4–6 weeks before transplanting\n• **Spacing**: 60cm × 45cm\n• **Water**: 2–3 times/week, avoid wetting leaves\n• **Diseases**: Early/late blight — use Mancozeb 80WP\n• **Price**: KES 800–1,500/crate (varies by season)";
      } else if (q.includes("avocado") || q.includes("hass")) {
        fallback = "🥑 **Avocado (Hass) Guide**\n\n• **Spacing**: 8m × 8m (156 trees/acre)\n• **Fertilizer**: Manure + NPK 6 months after planting\n• **Water**: 50–100L/tree/week during dry season\n• **Export grade**: >200g, blemish-free\n• **Harvest**: Flick test — if stem separates easily, it's ready\n• **Export price**: USD 0.45–0.80/kg FOB Mombasa";
      } else if (q.includes("weather") || q.includes("rain")) {
        fallback = "🌦️ **Murang'a Weather (Typical)**\n\n• **Long rains**: March–May (600–800mm)\n• **Short rains**: October–December (400–500mm)\n• **Highland areas** (Kangema, Kigumo): cooler, more rain\n• **Lowland areas** (Maragua, Kandara): warmer, drier\n• Check the Weather page for live forecasts from Kenya Met Dept.";
      } else if (q.includes("price") || q.includes("market")) {
        fallback = "📈 **Current Market Prices (Murang'a)**\n\n| Crop | Price |\n|------|-------|\n| Maize (90kg) | KES 2,800 |\n| Potatoes (90kg) | KES 4,500 |\n| Tomatoes (crate) | KES 1,200 |\n| Milk (litre) | KES 55 |\n| Avocado (kg) | KES 45 |\n\nFor live prices, check the Market Prices page.";
      } else if (q.includes("fertilizer") || q.includes("fertiliser")) {
        fallback = "🌿 **Fertilizer Guide for Murang'a**\n\n• **DAP**: Use at planting for most crops (phosphorus boost)\n• **CAN**: Top-dressing nitrogen at vegetative stage\n• **NPK 17:17:17**: General purpose for vegetables\n• **Organic**: Compost/manure — 2–5 tonnes/acre improves soil\n• **pH**: Murang'a soils often acidic — lime at 1–2 bags/acre\n• Buy from certified Agrovet shops to avoid fake fertilizers!";
      } else {
        fallback = "🌱 **AgroConnect AI Advisor**\n\nI'm currently in offline mode. Here's what I can help with:\n\n• **Crop advice**: Ask about maize, tomatoes, avocado, potatoes, beans, tea\n• **Pest & disease**: Describe symptoms and I'll suggest treatment\n• **Prices**: Check the Market Prices page for live data\n• **Weather**: Visit the Weather page for ward-level forecasts\n• **Certification**: Go to the Certification page to apply\n\nConnect to the internet for live AI responses powered by Claude!";
      }
      setMessages(m => [...m, { from:"ai", text: fallback, model:"offline" }]);
    }
    setLoading(false);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const QUICK = ["What's wrong with my avocado leaves?","Best fertilizer for tomatoes in Murang'a?","Live maize prices in Kenyan markets today?","When should I plant beans this season?","Organic pest control for kale?"];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:18, width:"100%", maxWidth:520, height:640, display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div style={{ padding:"1rem 1.25rem", background:"linear-gradient(135deg,#0F6E56,#1D9E75)", borderRadius:"18px 18px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, background:"rgba(255,255,255,0.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🌱</div>
            <div>
              <div style={{ color:"#fff", fontWeight:700, fontSize:14 }}>AgroConnect AI Advisor</div>
              <div style={{ color:"rgba(255,255,255,0.75)", fontSize:11 }}>Live web search · Kenya farming expert</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {/* Model switcher */}
            <div style={{ display:"flex", gap:4, background:"rgba(0,0,0,0.2)", borderRadius:20, padding:"3px" }}>
              {Object.entries(MODEL_LABELS).map(([key, m]) => (
                <button key={key} onClick={()=>setModel(key)} style={{ padding:"3px 10px", borderRadius:16, border:"none", cursor:"pointer", background:model===key?"#fff":"transparent", color:model===key?m.color:"rgba(255,255,255,0.7)", fontSize:11, fontWeight:600, transition:"all 0.2s" }} title={m.label}>{m.icon} {m.label}</button>
              ))}
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:16 }}>✕</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"1rem", display:"flex", flexDirection:"column", gap:10 }}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:"flex", justifyContent:m.from==="user"?"flex-end":"flex-start", gap:8 }}>
              {m.from==="ai" && (
                <div style={{ width:30, height:30, borderRadius:"50%", background:MODEL_LABELS[m.model||"claude"]?.color+"20"||"#E1F5EE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0, marginTop:2 }}>
                  {MODEL_LABELS[m.model||"claude"]?.icon||"🤖"}
                </div>
              )}
              <div style={{ maxWidth:"80%", display:"flex", flexDirection:"column", gap:3 }}>
                {m.from==="ai" && m.model && (
                  <div style={{ fontSize:10, color:"#aaa", marginLeft:2 }}>{MODEL_LABELS[m.model]?.label}</div>
                )}
                <div style={{ background:m.from==="user"?"linear-gradient(135deg,#0F6E56,#1D9E75)":"#f5f5f3", color:m.from==="user"?"#fff":"#2C2C2A", padding:"10px 14px", borderRadius:m.from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"#E1F5EE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{MODEL_LABELS[model].icon}</div>
              <div style={{ background:"#f5f5f3", padding:"10px 16px", borderRadius:"16px 16px 16px 4px", display:"flex", gap:5, alignItems:"center" }}>
                <div style={{ display:"flex", gap:4 }}>
                  {[0,1,2].map(i=><div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#1D9E75", animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
                </div>
                <span style={{ fontSize:12, color:"#888", marginLeft:4 }}>Searching live data…</span>
              </div>
            </div>
          )}
          <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}`}</style>
          <div ref={endRef}/>
        </div>

        {/* Quick prompts */}
        <div style={{ padding:"0 12px 8px" }}>
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
            {QUICK.map(s=>(
              <button key={s} onClick={()=>setInput(s)} style={{ padding:"5px 12px", background:"#E1F5EE", color:"#0F6E56", border:"1px solid #A7DEC9", borderRadius:20, fontSize:11, cursor:"pointer", whiteSpace:"nowrap", fontWeight:500 }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding:"8px 12px 12px", borderTop:"1px solid #eee" }}>
          <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Ask about crops, diseases, prices, weather… (Enter to send)" rows={2} style={{ flex:1, padding:"10px 14px", border:"1.5px solid #ddd", borderRadius:14, fontSize:13, outline:"none", resize:"none", fontFamily:"inherit", lineHeight:1.5 }} />
            <button onClick={sendMessage} disabled={loading||!input.trim()} style={{ padding:"10px 18px", background:loading||!input.trim()?C.grayLight:C.primary, color:loading||!input.trim()?C.gray:"#fff", border:"none", borderRadius:14, cursor:loading||!input.trim()?"not-allowed":"pointer", fontWeight:700, fontSize:13, height:60 }}>
              {loading?"…":"Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}