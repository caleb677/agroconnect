import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/badge.jsx";
import Btn from "../components/common/btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { TUTORIALS_DATA } from "../data/mockData.js";
import { callAI, AI_HEADERS, parseAIJson } from "../utils/aihelper.js";
export default function TutorialsPage({ role, certArea=null }) {
  const CERT_AREA_CATS = {
    "Organic Vegetables": ["Farming Basics","Crop Protection","Soil Science","Storage"],
    "Organic Tea":        ["Farming Basics","Soil Science","Business"],
    "Avocado (Hass)":     ["Farming Basics","Irrigation"],
    "Dairy Products":     ["Dairy Farming"],
    "Poultry Products":   ["Poultry"],
    "Horticulture Mix":   ["Farming Basics","Crop Protection","Irrigation","Storage"],
    "Maize/Cereals":      ["Farming Basics","Soil Science","Storage"],
  };
  const relevantCats = certArea ? (CERT_AREA_CATS[certArea] || []) : [];

  const allTutorials = TUTORIALS_DATA;
  // When certArea given: show relevant ones first, then rest
  const sortedTutorials = certArea
    ? [...allTutorials.filter(t=>relevantCats.includes(t.category)), ...allTutorials.filter(t=>!relevantCats.includes(t.category))]
    : allTutorials;

  const [tutorials,  setTutorials]  = useState(sortedTutorials);
  const [showUpload, setShowUpload] = useState(false);
  const [form,       setForm]       = useState({ title:"", duration:"", category:"Farming Basics" });
  const [quizModal,  setQuizModal]  = useState(null);  // tutorial being quizzed
  const [qIndex,     setQIndex]     = useState(0);     // current question index
  const [selected,   setSelected]   = useState(null);  // selected option key "A"/"B"/"C"/"D"
  const [submitted,  setSubmitted]  = useState(false); // whether current Q was submitted
  const [score,      setScore]      = useState(0);     // running score
  const [quizDone,   setQuizDone]   = useState(false); // all questions answered
  const [expandId,   setExpandId]   = useState(null);  // which tutorial shows subtopics
  const isEditor = role === "Extension Officer" || role === "Admin";

  const completed = tutorials.filter(t => t.completed).length;
  const categories = ["Farming Basics","Crop Protection","Soil Science","Storage","Business","Irrigation","Livestock","Dairy Farming","Poultry"];

  const openQuiz = async (t) => {
    // If certArea is set and tutorial has enough questions, generate area-specific questions via AI
    if (certArea && t.questions?.length >= 3) {
      setQuizModal({ ...t, _loading: true });
      setQIndex(0); setSelected(null); setSubmitted(false); setScore(0); setQuizDone(false);
      try {
        const areaText = await callAI(
          `Generate 5 quiz questions specifically for a farmer seeking ${certArea} certification in Murang'a County Kenya, based on the topic "${t.title}" (category: ${t.category}).
Questions must be practical and directly relevant to ${certArea} farming.
Return ONLY a JSON array (no markdown, no backticks):
[{"q":"Question text?","options":["A. Option one","B. Option two","C. Option three","D. Option four"],"answer":"A","explanation":"Why A is correct."}]`,
          "Return ONLY valid JSON array. No markdown. No backticks.",
          false
        );
        const parsed = parseAIJson(areaText);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          setQuizModal({ ...t, questions: parsed, _loading: false });
          return;
        }
      } catch(e) { console.warn("Quiz gen:", e.message); }
      setQuizModal({ ...t, _loading: false });
    } else {
      setQuizModal(t); setQIndex(0); setSelected(null); setSubmitted(false); setScore(0); setQuizDone(false);
    }
  };

  const submitAnswer = () => {
    if (!selected || submitted) return;
    setSubmitted(true);
    if (selected === quizModal.questions[qIndex].answer) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= quizModal.questions.length) {
      setQuizDone(true);
    } else {
      setQIndex(i => i + 1); setSelected(null); setSubmitted(false);
    }
  };

  const finishQuiz = () => {
    const pass = score >= Math.ceil(quizModal.questions.length * 0.6); // 60% to pass
    if (pass) setTutorials(tutorials.map(t => t.id===quizModal.id ? { ...t, completed:true } : t));
    setQuizModal(null);
  };

  const uploadTutorial = () => {
    if (!form.title || !form.duration) return;
    setTutorials([...tutorials, { id:tutorials.length+1, title:form.title, duration:form.duration+" min", category:form.category, completed:false, uploadedBy:"Officer", date:new Date().toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"}), subtopics:[], questions:[] }]);
    setShowUpload(false);
    setForm({ title:"", duration:"", category:"Farming Basics" });
  };

  const catColors = { "Farming Basics":C.primary,"Crop Protection":C.danger,"Soil Science":C.accent,"Storage":C.info,"Business":C.purple,"Irrigation":C.info,"Livestock":C.accent,"Dairy Farming":C.primary,"Poultry":C.accent };

  // ── Quiz Modal ───────────────────────────────────────────────────────────────
  const QuizModal = () => {
    if (!quizModal) return null;
    const qs = quizModal.questions || [];
    const q  = qs[qIndex];
    if (quizDone) {
      const pass = score >= Math.ceil(qs.length * 0.6);
      return (
        <Modal title={`Quiz Complete — ${quizModal.title}`} onClose={finishQuiz} width={520}>
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>{pass?"🏆":"📖"}</div>
            <h3 style={{ fontSize:20, fontWeight:700, color:pass?C.primary:C.danger, marginBottom:8 }}>{pass?"Congratulations! You passed!":"Keep Studying!"}</h3>
            <div style={{ fontSize:16, color:C.dark, marginBottom:6 }}>Score: <strong>{score}/{qs.length}</strong> ({Math.round(score/qs.length*100)}%)</div>
            <div style={{ fontSize:13, color:C.gray, marginBottom:24 }}>{pass?"Module marked complete. Training badge awarded! 🎖️":"You need 60% to pass. Review the material and try again."}</div>
            <Btn onClick={finishQuiz} style={{ minWidth:140 }}>{pass?"Finish ✓":"Try Again"}</Btn>
          </div>
        </Modal>
      );
    }
    if (quizModal?._loading) return (
      <Modal title={`📝 ${quizModal.title}`} onClose={()=>setQuizModal(null)} width={500}>
        <div style={{ textAlign:"center", padding:"2.5rem" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🤖</div>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>Generating questions for your certification area…</div>
          <div style={{ color:C.gray, fontSize:13, marginBottom:20 }}>Tailoring questions for <strong>{certArea}</strong></div>
          <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
            {[0,1,2].map(i=><div key={i} style={{ width:10, height:10, borderRadius:"50%", background:C.primary, animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
          </div>
          <style>{"@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}"}</style>
        </div>
      </Modal>
    );
    if (!q) return null;
    const optionColors = {
      default: { bg:"#fff", border:"#e0e0e0", color:C.dark },
      selected: { bg:C.primaryLight, border:C.primary, color:C.primaryDark },
      correct:  { bg:"#E1F5EE", border:C.primary, color:C.primaryDark },
      wrong:    { bg:"#FCEBEB", border:C.danger, color:C.danger },
    };
    const getStyle = (key) => {
      if (!submitted) return selected===key ? optionColors.selected : optionColors.default;
      if (key === q.answer) return optionColors.correct;
      if (key === selected && key !== q.answer) return optionColors.wrong;
      return optionColors.default;
    };
    return (
      <Modal title={`📝 ${quizModal.title}`} onClose={()=>setQuizModal(null)} width={560}>
        {/* Progress bar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <div style={{ flex:1, background:C.grayLight, borderRadius:6, height:6, overflow:"hidden" }}>
            <div style={{ width:String(((qIndex+1)/qs.length)*100) + "%", background:C.primary, height:"100%", borderRadius:6, transition:"width 0.3s" }}/>
          </div>
          <span style={{ fontSize:12, color:C.gray, whiteSpace:"nowrap" }}>Q {qIndex+1} of {qs.length}</span>
        </div>

        {/* Subtopic badge */}
        {quizModal.subtopics?.[Math.floor(qIndex/(qs.length/Math.max(quizModal.subtopics.length,1)))] && (
          <div style={{ fontSize:11, background:C.grayLight, color:C.gray, borderRadius:20, padding:"2px 12px", display:"inline-block", marginBottom:14, fontWeight:600 }}>
            📌 {quizModal.subtopics[Math.min(Math.floor(qIndex/(qs.length/Math.max(quizModal.subtopics.length,1))), quizModal.subtopics.length-1)]}
          </div>
        )}

        {/* Question */}
        <p style={{ fontWeight:700, fontSize:15, color:C.dark, marginBottom:16, lineHeight:1.5 }}>{q.q}</p>

        {/* Options */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {q.options.map(opt => {
            const key = opt.charAt(0); // "A","B","C","D"
            const s = getStyle(key);
            return (
              <button key={key} onClick={()=>!submitted&&setSelected(key)}
                style={{ padding:"12px 16px", borderRadius:10, border:`2px solid ${s.border}`, background:s.bg, color:s.color, textAlign:"left", cursor:submitted?"default":"pointer", fontSize:13, fontWeight:selected===key||submitted?600:400, transition:"all 0.15s", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ width:24, height:24, borderRadius:"50%", background:submitted&&key===q.answer?"#1D9E75":submitted&&key===selected?"#E24B4A":"rgba(0,0,0,0.06)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>
                  {submitted ? (key===q.answer?"✓":key===selected?"✗":key) : key}
                </span>
                {opt.substring(3)}
              </button>
            );
          })}
        </div>

        {/* Explanation after submit */}
        {submitted && q.explanation && (
          <div style={{ background:selected===q.answer?C.primaryLight:C.dangerLight, border:`1.5px solid ${selected===q.answer?C.primary:C.danger}`, borderRadius:9, padding:"10px 14px", marginBottom:16, fontSize:13, color:selected===q.answer?C.primaryDark:C.danger }}>
            {selected===q.answer?"✅ Correct! ":"❌ "}<strong>Explanation:</strong> {q.explanation}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display:"flex", gap:10 }}>
          {!submitted ? (
            <Btn onClick={submitAnswer} disabled={!selected} style={{ flex:1 }}>Submit Answer →</Btn>
          ) : (
            <Btn onClick={nextQuestion} style={{ flex:1 }}>{qIndex+1 < qs.length ? "Next Question →" : "See Results 🏆"}</Btn>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      <QuizModal />
      {/* Cert-area banner — shown when launched from Certification page */}
      {certArea && (
        <div style={{ background:"linear-gradient(90deg,#0F6E56,#1D9E75)", borderRadius:12, padding:"12px 18px", marginBottom:16, color:"#fff", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:24 }}>🎯</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>Tailored for: <strong>{certArea}</strong> certification</div>
            <div style={{ fontSize:12, opacity:0.85, marginTop:2 }}>AI generates questions specific to your area when you start a quiz.</div>
          </div>
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, margin:0 }}>📚 E-Learning & Training</h2>
        {isEditor && <Btn onClick={() => setShowUpload(!showUpload)}>+ Upload Tutorial</Btn>}
      </div>
      {!isEditor && (
        <>
          <p style={{ color:C.gray, marginBottom:12, fontSize:14 }}>Complete modules to qualify for certification and earn training badges. Progress: {completed}/{tutorials.length}</p>
          <div style={{ background:C.grayLight, borderRadius:8, height:8, marginBottom:16, overflow:"hidden" }}>
            <div style={{ background:C.primary, height:"100%", width:String((completed/tutorials.length)*100) + "%", borderRadius:8, transition:"width 0.5s" }} />
          </div>
          {completed===tutorials.length && (
            <div style={{ background:"linear-gradient(135deg,#0F6E56,#1D9E75)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#fff", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:10 }}>
              🏆 Congratulations! All modules completed. Your Training Certificate has been issued!
              <Btn size="sm" style={{ background:"#fff", color:C.primaryDark, marginLeft:"auto" }}>Download Certificate</Btn>
            </div>
          )}
        </>
      )}
      {isEditor && showUpload && (
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem", marginBottom:20 }}>
          <div style={{ fontWeight:600, marginBottom:14, fontSize:15 }}>Upload New Tutorial</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
            <Field label="Tutorial Title"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Drip Irrigation Basics" style={inp} /></Field>
            <Field label="Duration (min)"><input type="number" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="e.g. 15" style={inp} /></Field>
            <Field label="Category"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={sel}>{categories.map(c=><option key={c}>{c}</option>)}</select></Field>
          </div>
          <div style={{ border:"2px dashed #ddd", borderRadius:10, padding:"1.5rem", textAlign:"center", marginBottom:14, color:C.gray, fontSize:13, cursor:"pointer" }}>
            📎 Click to upload video or PDF file (max 200MB)
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={uploadTutorial}>Publish Tutorial</Btn>
            <Btn variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Btn>
          </div>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {tutorials.map(t => {
          const catColor = catColors[t.category] || C.primary;
          const isExpanded = expandId === t.id;
          return (
            <div key={t.id} style={{ background:"#fff", border:`1.5px solid ${isExpanded?catColor:"#eee"}`, borderRadius:12, overflow:"hidden", transition:"border-color 0.2s" }}>
              {/* Main row */}
              <div style={{ padding:"1rem 1.25rem", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:t.completed?catColor:C.grayLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                  {t.completed ? "✓" : "▶"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:3, color:C.dark }}>{t.title}</div>
                  <div style={{ fontSize:11, color:C.gray, marginBottom:4, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                    <span style={{ background:catColor+"20", color:catColor, padding:"1px 8px", borderRadius:4, fontWeight:600 }}>{t.category}</span>
                    <span>⏱ {t.duration}</span>
                    <span>👤 {t.uploadedBy}</span>
                    {t.questions?.length>0 && <span>❓ {t.questions.length} questions</span>}
                  </div>
                  {t.subtopics?.length > 0 && (
                    <button onClick={()=>setExpandId(isExpanded?null:t.id)} style={{ background:"none", border:"none", color:C.primary, cursor:"pointer", fontSize:11, fontWeight:600, padding:0 }}>
                      {isExpanded?"▲ Hide subtopics":"▼ "+t.subtopics.length+" subtopics"}
                    </button>
                  )}
                </div>
                {isEditor ? (
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn size="sm" variant="info">Edit</Btn>
                    <Btn size="sm" variant="danger">Delete</Btn>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                    {t.completed && <span style={{ fontSize:11, background:"#EAF3DE", color:"#3B6D11", padding:"2px 8px", borderRadius:10 }}>🏅 Badge Earned</span>}
                    <button onClick={() => !t.completed && openQuiz(t)} style={{ padding:"8px 18px", background:t.completed?"#EAF3DE":catColor, color:t.completed?"#3B6D11":"#fff", border:"none", borderRadius:8, cursor:t.completed?"default":"pointer", fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>
                      {t.completed ? "Completed ✓" : t.questions?.length>0?"Take Quiz →":"Mark Done"}
                    </button>
                  </div>
                )}
              </div>
              {/* Subtopics panel */}
              {isExpanded && t.subtopics?.length > 0 && (
                <div style={{ borderTop:"1px solid #f0f0f0", padding:"12px 1.25rem", background:"#fafafa" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.gray, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Subtopics covered</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {t.subtopics.map((s,i) => (
                      <div key={i} style={{ background:"#fff", border:`1px solid ${catColor}40`, borderRadius:8, padding:"6px 12px", fontSize:12, color:catColor, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ background:catColor+"20", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{i+1}</span>
                        {s}
                      </div>
                    ))}
                  </div>
                  {t.questions?.length > 0 && (
                    <div style={{ marginTop:10, fontSize:12, color:C.gray }}>
                      📝 Quiz has <strong>{t.questions.length} questions</strong> aligned to these subtopics. You need 60% to pass and earn the badge.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SUPPORT SYSTEM ────────────────────────────────────────────────────────────
// Shared tickets state lives at App level; these components receive it as props.
// SupportPage  → for Farmer (raise & track tickets)
// SupportInboxPage → for Extension Officer & Admin (manage & reply)

const TICKET_CATEGORIES = ["Certification","Farm Inputs","Weather & Crops","Market & Pricing","Logistics","Account Issue","Fraud Report","Other"];
const PRIORITY_CONFIG = {
  low:    { color:"#3B6D11", bg:"#EAF3DE", label:"Low" },
  medium: { color:"#854F0B", bg:"#FAEEDA", label:"Medium" },
  high:   { color:"#185FA5", bg:"#E6F1FB", label:"High" },
  urgent: { color:"#A32D2D", bg:"#FCEBEB", label:"Urgent" },
};
const STATUS_CONFIG = {
  open:        { color:"#185FA5", bg:"#E6F1FB", label:"Open" },
  "in-progress":{ color:"#854F0B", bg:"#FAEEDA", label:"In Progress" },
  resolved:    { color:"#3B6D11", bg:"#EAF3DE", label:"Resolved" },
  closed:      { color:"#888780", bg:"#F1EFE8", label:"Closed" },
};
