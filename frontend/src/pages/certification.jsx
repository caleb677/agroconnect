import { useState, useEffect, useRef } from "react";
import { C, inp, sel } from "../utils/constants.js";
import Badge from "../components/common/Badge.jsx";
import Btn from "../components/common/Btn.jsx";
import Modal from "../components/common/modal.jsx";
import Field from "../components/common/Field.jsx";
import FlashResult from "../components/common/FlashResult.jsx";
import { CERTIFICATIONS, MOCK_REVIEW_NOTES } from "../data/mockdata.js";
import CertificateBadge from "../components//common/CertificateBadge.jsx";
import {MURANGA_SUBCOUNTIES } from "../data/mockdata.js";
import { UserDB } from "../data/userDB.js";
import TutorialsPage from './tutorials.jsx';
export default function CertificationPage({ role, user={}, onCertComplete=()=>{} }) {
   const [certApproved, setCertApproved] = useState(false);
  // Map certification produce/area to relevant tutorial categories
  const CERT_AREA_MAP = {
    "Organic Vegetables": ["Farming Basics","Crop Protection","Soil Science","Storage"],
    "Organic Tea":        ["Farming Basics","Soil Science","Business"],
    "Organic Coffee":     ["Farming Basics","Soil Science","Business"],
    "Avocado (Hass)":     ["Farming Basics","Irrigation","Post-Harvest"],
    "Dairy Products":     ["Dairy Farming"],
    "Poultry Products":   ["Poultry"],
    "Horticulture Mix":   ["Farming Basics","Crop Protection","Irrigation","Storage"],
    "Maize/Cereals":      ["Farming Basics","Soil Science","Storage"],
    default:              ["Farming Basics","Crop Protection","Soil Science"],
  };
  const [certs, setCerts] = useState(CERTIFICATIONS);
  const [training, setTraining] = useState(false);
  const [produce, setProduce] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [noteModal, setNoteModal] = useState(null);
  const [certBadge, setCertBadge] = useState(null);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [subcounty, setSubcounty] = useState("");
  const [activeTab, setActiveTab] = useState("status"); // "status" | "docs" | "apply" | "reviews"
  const [dbSaving, setDbSaving] = useState(false);
  const [dbSaved, setDbSaved] = useState(false);

  // Real file upload state — stores File objects + preview info + base64 for DB
  const [uploadedDocs, setUploadedDocs] = useState({
    nationalId:   { file:null, name:null, preview:null, uploaded:false, base64:null },
    farmPhotos:   { file:null, name:null, preview:null, uploaded:false, base64:null },
    trainingCert: { file:null, name:null, preview:null, uploaded:false, base64:null },
    soilReport:   { file:null, name:null, preview:null, uploaded:false, base64:null },
  });

  // Load saved cert + docs from DB on mount
  useEffect(() => {
    if (!user?.email) return;
    UserDB.loadCert(user.email).then(cert => {
      if (cert) {
        if (cert.training) setTraining(true); if (user?.email) UserDB.saveCert(user.email, { training:true, produce, status:"pending", docsComplete: allDocsUploaded }).catch(()=>{});
        if (cert.produce) setProduce(cert.produce);
        if (cert.status === "approved") {
          // Find and mark the cert approved
          setCerts(prev => prev.map(c => c.id === 1 ? {
            ...c, status:"approved",
            certId: cert.certId || "AGC-2026-001",
            issued: cert.issued || "—",
            expiry: cert.expiry || "—",
          } : c));
        }
      }
    }).catch(()=>{});
    // Load doc metadata from profile (fast) + restore uploaded state
    UserDB.getProfile(user.email).then(p => {
      if (p?.docsMeta) {
        setUploadedDocs(prev => {
          const updated = { ...prev };
          for (const [key, meta] of Object.entries(p.docsMeta)) {
            // Map DB key names back to form keys
            const formKey = key === "farmPhoto" ? "farmPhotos" : key;
            if (updated[formKey]) {
              updated[formKey] = {
                ...updated[formKey],
                uploaded: true,
                name: meta.savedAt ? new Date(meta.savedAt).toLocaleDateString("en-KE") : "Saved",
                size: meta.sizeKB ? `${meta.sizeKB} KB` : "Saved",
              };
            }
          }
          return updated;
        });
      }
    }).catch(()=>{});
  }, [user?.email]);
  const fileRefs = {
    nationalId:   useRef(), farmPhotos: useRef(),
    trainingCert: useRef(), soilReport: useRef(),
  };

  const handleFileSelect = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const preview = isImage ? URL.createObjectURL(file) : null;
    // Convert to base64 for DB storage
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result; // data:image/...;base64,...
      setUploadedDocs(prev => ({
        ...prev,
        [key]: { file, name:file.name, preview, uploaded:true, size:`${(file.size/1024).toFixed(1)} KB`, type:file.type, base64 }
      }));
      // Save this doc to DB immediately using per-key storage
      if (user?.email) {
        const dbKey = key === "farmPhotos" ? "farmPhoto" : key;
        UserDB.saveDoc(user.email, dbKey, base64).catch(()=>{});
      }
    };
    reader.readAsDataURL(file);
  };

  // Save all cert progress to DB (all docs + cert record)
  const saveCertProgress = async (extra = {}) => {
    if (!user?.email) return;
    setDbSaving(true);
    try {
      // Save each doc individually to DB (parallel)
      await Promise.all(Object.entries(uploadedDocs).map(async ([k, d]) => {
        if (d.base64) {
          const dbKey = k === "farmPhotos" ? "farmPhoto" : k;
          await UserDB.saveDoc(user.email, dbKey, d.base64).catch(()=>{});
        }
      }));
      await UserDB.saveCert(user.email, {
        training, produce, docsComplete: allDocsUploaded,
        status: extra.status || "pending",
        certId: extra.certId, issued: extra.issued, expiry: extra.expiry,
      });
      setDbSaved(true);
      setTimeout(() => setDbSaved(false), 2500);
    } catch(e) { console.error(e); }
    finally { setDbSaving(false); }
  };

  const removeDoc = (key) => {
    setUploadedDocs(prev => ({ ...prev, [key]: { file:null, name:null, preview:null, uploaded:false } }));
    if (fileRefs[key]?.current) fileRefs[key].current.value = "";
  };

  const docsUploaded = Object.values(uploadedDocs).filter(d=>d.uploaded).length;
  const allDocsUploaded = docsUploaded === 4;

  const steps = [
    { label:"Registration",        done:true,            desc:"Farmer registered on AgroConnect" },
    { label:"Document Upload",     done:docsUploaded>0,  desc:`${docsUploaded}/4 documents uploaded` },
    { label:"Training",            done:training,         desc:"Complete online agricultural training modules" },
    { label:"Officer Verification",done:false,            desc:"Extension officer visits farm and verifies practices" },
    { label:"Admin Approval",      done:false,            desc:"Platform admin reviews and approves" },
    { label:"Digital Certificate", done:false,            desc:"Certificate issued and visible on profile" },
  ];

  const approvedCert = certs.find(c=>c.status==="approved");
  // Certificate is only shown if all steps are fully completed
  const certFullyComplete = allDocsUploaded && training;

  // Officer review notes for this farmer (id=1 = James)
  const myReviews = MOCK_REVIEW_NOTES.filter(n => n.farmerId === 1);

  const approve = async (id) => {
    const certId = "AGC-2026-" + String(id).padStart(3,"0") + Math.floor(Math.random()*9);
    const issued = new Date().toLocaleDateString("en-KE",{day:"numeric",month:"long",year:"numeric"});
    const expiry = new Date(Date.now()+1000*60*60*24*365*2).toLocaleDateString("en-KE",{day:"numeric",month:"long",year:"numeric"});
    setCerts(certs.map(c => c.id === id ? { ...c, status:"approved", certId, issued, expiry } : c));
    // Persist to DB — for admin approving another user we use the cert farmer email if available
    const targetEmail = certs.find(c=>c.id===id)?.farmerEmail || user?.email;
    if (targetEmail) {
      await UserDB.saveCert(targetEmail, { status:"approved", certId, issued, expiry, produce, training });
      // Unlock their dashboard
      await UserDB.updateProfile(targetEmail, { certStatus:"approved", dashboardUnlocked:true });
    }
    // Also update local user if they're approving their own cert (self-service demo)
    if (user?.email === targetEmail) onCertComplete({ certStatus:"approved", dashboardUnlocked:true });
    setApproveSuccess(true);
    setTimeout(()=>setApproveSuccess(false), 3000);
  };
  const reject = (id) => setCerts(certs.map(c => c.id === id ? { ...c, status:"rejected" } : c));

  const docLabels = [
    { key:"nationalId",   label:"National ID",           icon:"🪪", accept:"image/*,.pdf",        hint:"JPG, PNG or PDF · Max 5MB" },
    { key:"farmPhotos",   label:"Farm Photos",           icon:"📷", accept:"image/*",              hint:"JPG or PNG · Recent photos of your farm" },
    { key:"trainingCert", label:"Training Certificate",  icon:"📜", accept:"image/*,.pdf",        hint:"PDF or JPG · From AgroConnect or MOA" },
    { key:"soilReport",   label:"Soil / Farm Report",    icon:"🧪", accept:"image/*,.pdf,.doc,.docx", hint:"PDF, Word or JPG · Soil test or farm report" },
  ];

  const tabBtn = (id, label) => (
    <button onClick={()=>setActiveTab(id)} style={{ padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer", background:activeTab===id?C.primary:C.grayLight, color:activeTab===id?"#fff":C.dark, fontSize:13, fontWeight:activeTab===id?600:400 }}>{label}</button>
  );

  return (
    <div style={{ padding:"1.5rem 2rem" }}>
      {approveSuccess && (
        <div style={{ background:"linear-gradient(135deg,#0F6E56,#1D9E75)", borderRadius:12, padding:"1.25rem 1.5rem", marginBottom:16, color:"#fff", display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:36 }}>🎉</span>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>Certification Approved!</div>
            <div style={{ fontSize:13, opacity:0.9 }}>Digital certificate, QR code, and badge have been generated automatically.</div>
          </div>
        </div>
      )}
      <h2 style={{ fontSize:20, fontWeight:700, color:C.dark, marginBottom:20 }}>🏅 Certification</h2>
      {certBadge && certFullyComplete && <CertificateBadge cert={certBadge} onClose={()=>setCertBadge(null)} />}

      {/* ── FARMER VIEW ── */}
      {role === "Farmer" && (
        <>
          {/* Tab bar */}
          <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
            {tabBtn("status",   "📋 My Status")}
            {tabBtn("docs",     "📁 Upload Documents")}
            {tabBtn("apply",    "📝 Apply")}
            {tabBtn("elearning","📚 E-Learning")}
            {tabBtn("reviews",  `🔍 Officer Reviews${myReviews.length>0?" ("+myReviews.length+")":""}`)}
            {certApproved && tabBtn("renew", "🔒 Renew Cert")}
          </div>

          {/* STATUS TAB */}
          {activeTab==="status" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem" }}>
                <div style={{ fontWeight:600, marginBottom:16 }}>Your Certification Journey</div>
                {steps.map((s,i) => (
                  <div key={i} style={{ display:"flex", gap:12, marginBottom:16, alignItems:"flex-start" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:s.done?C.primary:C.grayLight, color:s.done?"#fff":C.gray, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0, fontWeight:700 }}>
                      {s.done?"✓":i+1}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500, color:s.done?C.dark:C.gray }}>{s.label}</div>
                      <div style={{ fontSize:12, color:C.gray }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
                {approvedCert && (
                  <>
                    {certFullyComplete ? (
                      <>
                        <Btn onClick={()=>setCertBadge({...approvedCert, farmerName:user?.name||"Farmer", phone:user?.phone, county:user?.county, email:user?.email, farmer:user?.name})} variant="accent" style={{ width:"100%", marginTop:8 }}>🏅 View My Certificate & Badge</Btn>
                        <Btn onClick={()=>saveCertProgress({status:"approved",certId:approvedCert?.certId,issued:approvedCert?.issued,expiry:approvedCert?.expiry})} style={{ width:"100%", marginTop:8, background: dbSaved?"#1D9E75":"#0F6E56" }}>
                          {dbSaving?"⏳ Saving…":dbSaved?"✅ Saved to Database!":"💾 Save Certificate to Database"}
                        </Btn>
                      </>
                    ) : (
                      <div style={{ background:"#FAEEDA", border:"1.5px solid #BA7517", borderRadius:9, padding:"10px 14px", marginTop:8, fontSize:12, color:"#BA7517" }}>
                        ⚠️ Complete document upload and training module to unlock your certificate.
                      </div>
                    )}
                  </>
                )}
              </div>
              <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem" }}>
                <div style={{ fontWeight:600, marginBottom:14 }}>Document Progress</div>
                {docLabels.map(doc => {
                  const d = uploadedDocs[doc.key];
                  return (
                    <div key={doc.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f5f5f5" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:18 }}>{doc.icon}</span>
                        <div>
                          <div style={{ fontSize:13, fontWeight:500 }}>{doc.label}</div>
                          {d.uploaded && <div style={{ fontSize:11, color:C.gray }}>{d.name}</div>}
                        </div>
                      </div>
                      {d.uploaded
                        ? <span style={{ fontSize:12, color:C.primary, fontWeight:600 }}>✓ Uploaded</span>
                        : <span style={{ fontSize:12, color:C.gray }}>Not uploaded</span>
                      }
                    </div>
                  );
                })}
                <div style={{ marginTop:12, fontSize:12, color:C.gray }}>
                  {docsUploaded}/4 documents uploaded
                  <div style={{ background:C.grayLight, borderRadius:4, height:6, overflow:"hidden", marginTop:6 }}>
                    <div style={{ background:C.primary, height:"100%", width:`${(docsUploaded/4)*100}%`, borderRadius:4, transition:"width 0.4s" }} />
                  </div>
                </div>
                <button onClick={()=>setActiveTab("docs")} style={{ marginTop:14, width:"100%", padding:"9px", background:C.primaryLight, color:C.primaryDark, border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                  📁 Go to Document Upload →
                </button>
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab==="docs" && (
            <div>
              <div style={{ background:C.infoLight, border:`1px solid ${C.info}33`, borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#185FA5" }}>
                📌 All 4 documents are required before submitting your certification application. Accepted formats: JPG, PNG, PDF, Word. Max 5MB per file.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {docLabels.map(doc => {
                  const d = uploadedDocs[doc.key];
                  return (
                    <div key={doc.key} style={{ background:"#fff", border:`2px solid ${d.uploaded?C.primary:"#ddd"}`, borderRadius:12, padding:"1.25rem", transition:"border-color 0.2s" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <span style={{ fontSize:24 }}>{doc.icon}</span>
                        <div>
                          <div style={{ fontWeight:600, fontSize:14 }}>{doc.label}</div>
                          <div style={{ fontSize:11, color:C.gray }}>{doc.hint}</div>
                        </div>
                        {d.uploaded && <span style={{ marginLeft:"auto", fontSize:18 }}>✅</span>}
                      </div>

                      {/* File preview */}
                      {d.uploaded && (
                        <div style={{ background:"#F8F8F6", borderRadius:8, padding:"10px 12px", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
                          {d.preview
                            ? <img src={d.preview} alt="preview" style={{ width:48, height:48, borderRadius:6, objectFit:"cover", flexShrink:0 }} />
                            : <div style={{ width:48, height:48, borderRadius:6, background:C.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>📄</div>
                          }
                          <div style={{ flex:1, overflow:"hidden" }}>
                            <div style={{ fontSize:12, fontWeight:600, color:C.dark, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                            <div style={{ fontSize:11, color:C.gray }}>{d.size} · {d.type?.split("/")[1]?.toUpperCase()}</div>
                          </div>
                          <button onClick={()=>removeDoc(doc.key)} style={{ background:C.dangerLight, color:C.danger, border:"none", borderRadius:6, padding:"4px 8px", cursor:"pointer", fontSize:11, flexShrink:0 }}>Remove</button>
                        </div>
                      )}

                      {/* Hidden real file input */}
                      <input
                        ref={fileRefs[doc.key]}
                        type="file"
                        accept={doc.accept}
                        style={{ display:"none" }}
                        onChange={e=>handleFileSelect(doc.key, e)}
                      />
                      <button
                        onClick={()=>fileRefs[doc.key].current?.click()}
                        style={{ width:"100%", padding:"10px", background:d.uploaded?C.grayLight:C.primary, color:d.uploaded?C.dark:"#fff", border:`1.5px dashed ${d.uploaded?"#ccc":C.primaryDark}`, borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:500 }}
                      >
                        {d.uploaded ? "🔄 Replace File" : "⬆️ Choose File"}
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* Document count progress */}
              <div style={{ marginTop:20, background:docsUploaded===4?"linear-gradient(135deg,#0F6E56,#1D9E75)":C.grayLight, borderRadius:10, padding:"1rem 1.25rem", color:docsUploaded===4?"#fff":C.dark }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:docsUploaded===4?10:0 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{docsUploaded===4?"✅ All documents uploaded!":"📎 Documents uploaded: "+docsUploaded+"/4"}</div>
                    <div style={{ fontSize:12, opacity:0.85, marginTop:2 }}>
                      {docsUploaded===4 ? "Click Submit Documents to save everything to the database." : `${4-docsUploaded} more document${4-docsUploaded>1?"s":""} required before submission.`}
                    </div>
                  </div>
                </div>
                {docsUploaded===4 && (
                  <button
                    onClick={async () => {
                      await saveCertProgress({ status:"pending" });
                      setActiveTab("apply");
                    }}
                    disabled={dbSaving}
                    style={{ width:"100%", padding:"12px", background:dbSaving?"rgba(255,255,255,0.5)":"#fff", color:C.primaryDark, border:"none", borderRadius:9, fontWeight:700, fontSize:14, cursor:dbSaving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4 }}>
                    {dbSaving ? (
                      <><div style={{ width:16, height:16, border:"3px solid #ccc", borderTop:"3px solid #1D9E75", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Uploading to database…</>
                    ) : (
                      <>📤 Submit Documents & Proceed to Application →</>
                    )}
                    <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* APPLY TAB */}
          {activeTab==="apply" && (
            <div style={{ maxWidth:540 }}>
              <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem" }}>
                <div style={{ fontWeight:600, marginBottom:16, fontSize:15 }}>📝 Certification Application</div>
                {!allDocsUploaded && (
                  <div style={{ background:C.accentLight, border:`1px solid ${C.accent}44`, borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:C.accent }}>
                    ⚠️ Please upload all 4 required documents before submitting. ({docsUploaded}/4 uploaded)
                  </div>
                )}
                <Field label="Produce Category">
                  <select value={produce} onChange={e=>setProduce(e.target.value)} style={sel}>
                    <option value="">Select category...</option>
                    {["Vegetables","Fruits","Grains","Dairy","Livestock"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Sub-County (Murang'a)">
                  <select value={subcounty} onChange={e=>setSubcounty(e.target.value)} style={sel}>
                    <option value="">Select sub-county...</option>
                    {MURANGA_SUBCOUNTIES.map(sc=><option key={sc.id}>{sc.name}</option>)}
                  </select>
                </Field>
                <Field label="Farm Description">
                  <textarea placeholder="Brief description of your farm and farming practices..." style={{ ...inp, height:80, resize:"vertical" }} />
                </Field>
                {!training && (
                  <button onClick={()=>setTraining(true)} style={{ width:"100%", padding:"10px", background:C.grayLight, color:C.dark, border:"none", borderRadius:8, cursor:"pointer", fontSize:13, marginBottom:10 }}>
                    ▶ Complete Training Modules First
                  </button>
                )}
                <button
                  disabled={!allDocsUploaded}
                  onClick={async () => {
                    if (!allDocsUploaded) return;
                    await saveCertProgress({ status:"pending" });
                    onCertComplete({ certStatus:"pending" });
                    setActiveTab("status");
                  }}
                  style={{ width:"100%", padding:"12px", background:allDocsUploaded?C.accent:"#ccc", color:"#fff", border:"none", borderRadius:9, fontWeight:600, fontSize:14, cursor:allDocsUploaded?"pointer":"not-allowed" }}
                >
                  {dbSaving ? "⏳ Submitting…" : allDocsUploaded ? "Submit Application ✓" : `Upload Documents First (${docsUploaded}/4)`}
                </button>
              </div>
            </div>
          )}

          {/* OFFICER REVIEWS TAB */}
          {/* RENEWAL TAB */}
          {activeTab==="renew" && (() => {
            const expDays = cert?.expiry ? Math.ceil((new Date(cert.expiry)-new Date())/(1000*60*60*24)) : null;
            const expired = expDays !== null && expDays <= 0;
            const nearExpiry = expDays !== null && expDays <= 90;
            return (
              <div>
                <div style={{ background:expired?"#FCEBEB":nearExpiry?"#FFF3CD":"#E1F5EE", border:`1.5px solid ${expired?"#E24B4A":nearExpiry?"#F59E0B":"#1D9E75"}`, borderRadius:12, padding:"1.25rem", marginBottom:20 }}>
                  <div style={{ fontWeight:700,fontSize:15,color:expired?"#E24B4A":nearExpiry?"#92400E":"#0F6E56",marginBottom:4 }}>
                    {expired?"❌ Your certificate has expired!":nearExpiry?`⚠️ Expiring in ${expDays} days`:"✅ Certificate is valid"}
                  </div>
                  <div style={{ fontSize:13,color:"#555" }}>
                    {cert?.certId && <span>Cert ID: <strong>{cert.certId}</strong> · </span>}
                    Issued: {cert?.issued||"—"} · Expiry: {cert?.expiry||"—"}
                  </div>
                </div>
                <div style={{ background:"#fff",border:"1px solid #eee",borderRadius:12,padding:"1.5rem" }}>
                  <h3 style={{ fontSize:16,fontWeight:700,marginBottom:4 }}>🔄 Apply for Renewal</h3>
                  <p style={{ color:"#888",fontSize:13,marginBottom:20 }}>Renew your certification every 2 years. Upload any updated documents and confirm your produce details.</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }}>
                    {[["Current Certification",cert?.certId||"—"],["Status",cert?.status||"—"],["Produce",produce],["Sub-County",user?.county||"—"],["Expiry",cert?.expiry||"—"],["Renewal Year","2026"]].map(([l,v])=>(
                      <div key={l} style={{ background:"#fafafa",border:"1px solid #eee",borderRadius:9,padding:"10px 12px" }}>
                        <div style={{ fontSize:11,color:"#888",marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:13,fontWeight:600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:12,fontWeight:600,color:"#555",display:"block",marginBottom:6 }}>Confirm Produce (can update)</label>
                    <select value={produce} onChange={e=>setProduce(e.target.value)} style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #ddd",borderRadius:9,fontSize:13,outline:"none" }}>
                      {CERTIFICATIONS.map(c=><option key={c.produce}>{c.produce}</option>)}
                    </select>
                  </div>
                  <div style={{ background:"#E1F5EE",border:"1.5px solid #1D9E75",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#0F6E56" }}>
                    📋 Renewal checklist: Re-upload any expired documents, complete the training refresh quiz, and confirm your farm details are current.
                  </div>
                  <Btn onClick={async ()=>{
                    const renewId = "CERT-RNW-"+Date.now().toString(36).toUpperCase();
                    const issued = new Date().toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"});
                    const expiry = new Date(Date.now()+2*365*24*60*60*1000).toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"});
                    await saveCertProgress({ status:"approved", certId:renewId, issued, expiry });
                    onCertComplete({ certStatus:"approved", dashboardUnlocked:true });
                    setActiveTab("status");
                  }} style={{ width:"100%" }}>Submit Renewal Application →</Btn>
                </div>
              </div>
            );
          })()}

          {/* E-LEARNING TAB — tutorials filtered to certification area */}
          {activeTab==="elearning" && (
            <div>
              <div style={{ background:"linear-gradient(90deg,#0F6E56,#1D9E75)", borderRadius:12, padding:"1rem 1.25rem", marginBottom:18, color:"#fff", display:"flex", alignItems:"center", gap:14 }}>
                <span style={{ fontSize:28 }}>🎓</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>Training for: {produce}</div>
                  <div style={{ fontSize:12, opacity:0.85, marginTop:2 }}>These modules are selected based on your certification area. Complete all quizzes to unlock your certificate.</div>
                </div>
              </div>
              <TutorialsPage role={role} certArea={produce} />
            </div>
          )}

          {activeTab==="reviews" && (
            <div>
              <div style={{ background:C.infoLight, border:`1px solid ${C.info}33`, borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#185FA5" }}>
                🔍 These are notes and observations written by your assigned extension officer during document review and field visits.
              </div>
              {myReviews.length === 0 && (
                <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"3rem", textAlign:"center", color:C.gray, fontSize:14 }}>
                  No review notes yet. Your extension officer will add notes after reviewing your application.
                </div>
              )}
              {myReviews.map(r => {
                const statusColors = {
                  positive: { bg:"#EAF3DE", border:"#A8D5A2", color:"#3B6D11", icon:"✅" },
                  neutral:  { bg:C.infoLight, border:`${C.info}55`, color:"#185FA5", icon:"ℹ️" },
                  warning:  { bg:"#FFF3CD", border:"#FFEAA7", color:"#856404", icon:"⚠️" },
                };
                const sc = statusColors[r.status] || statusColors.neutral;
                return (
                  <div key={r.id} style={{ background:"#fff", border:`2px solid ${sc.border}`, borderRadius:12, padding:"1.5rem", marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:sc.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{sc.icon}</div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:14 }}>{r.officer}</div>
                          <div style={{ fontSize:12, color:C.gray }}>Extension Officer · {r.type==="field-visit"?"🚗 Field Visit":"📄 Document Review"}</div>
                        </div>
                      </div>
                      <div style={{ fontSize:12, color:C.gray }}>{r.date}</div>
                    </div>
                    <div style={{ background:sc.bg, borderRadius:8, padding:"12px 14px", fontSize:13, color:sc.color, lineHeight:1.6 }}>
                      {r.note}
                    </div>
                    <div style={{ marginTop:10, fontSize:12, color:C.gray }}>
                      {r.status==="positive" && "✅ Your application is on track for approval."}
                      {r.status==="neutral"  && "📋 Action required — please upload the missing documents."}
                      {r.status==="warning"  && "⚠️ Issues found — please address the concerns noted above."}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── EXTENSION OFFICER / ADMIN VIEW ── */}
      {(role === "Extension Officer" || role === "Admin") && (
        <div>
          <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, overflow:"hidden", marginBottom:20 }}>
            <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontWeight:600, fontSize:15 }}>Certification Applications</span>
              <span style={{ background:C.accentLight, color:C.accent, borderRadius:8, padding:"3px 10px", fontSize:12 }}>
                {certs.filter(c => c.status === "pending" || c.status === "in-review").length} pending
              </span>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.grayLight }}>
                  {["Farmer","Produce","Officer","Date","Documents","Status","Actions"].map(h => (
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:C.gray }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id} style={{ borderTop:"1px solid #f5f5f5" }}>
                    <td style={{ padding:"12px 16px", fontSize:13, fontWeight:500 }}>{c.farmer}</td>
                    <td style={{ padding:"12px 16px", fontSize:13 }}>{c.produce}</td>
                    <td style={{ padding:"12px 16px", fontSize:13 }}>{c.officer}</td>
                    <td style={{ padding:"12px 16px", fontSize:12, color:C.gray }}>{c.date}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {Object.entries(c.docs||{}).map(([k,v])=>(
                          <span key={k} style={{ fontSize:10, padding:"2px 6px", borderRadius:4, background:v?"#EAF3DE":"#FFF3CD", color:v?"#3B6D11":"#856404" }}>
                            {k.replace(/([A-Z])/g,' $1').trim()}: {v?"✓":"✗"}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px" }}><Badge status={c.status} /></td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {c.status === "approved" && (
                          <Btn size="sm" variant="success" onClick={()=>setCertBadge(c)}>🏅 Badge</Btn>
                        )}
                        {c.status !== "approved" && c.status !== "rejected" && (
                          <>
                            <Btn size="sm" variant="success" onClick={() => approve(c.id)}>Approve</Btn>
                            <Btn size="sm" variant="danger"  onClick={() => reject(c.id)}>Reject</Btn>
                            {role === "Extension Officer" && (
                              <Btn size="sm" variant="info" onClick={() => setNoteModal(c.id)}>+ Note</Btn>
                            )}
                          </>
                        )}
                        {c.status === "rejected" && (
                          <span style={{ fontSize:12, color:C.gray }}>Reviewed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Officer: All review notes they've written */}
          {role === "Extension Officer" && (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:"1.5rem" }}>
              <div style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>📝 My Review Notes</div>
              {MOCK_REVIEW_NOTES.map(r => (
                <div key={r.id} style={{ padding:"14px", background:C.grayLight, borderRadius:10, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontWeight:600, fontSize:13 }}>Farmer #{r.farmerId} · {r.type==="field-visit"?"🚗 Field Visit":"📄 Document Review"}</span>
                    <span style={{ fontSize:12, color:C.gray }}>{r.date}</span>
                  </div>
                  <div style={{ fontSize:13, color:C.dark, lineHeight:1.5 }}>{r.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {noteModal && (
        <Modal title="Add Review Note" onClose={() => setNoteModal(null)}>
          <div style={{ background:C.infoLight, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#185FA5" }}>
            This note will be visible to the farmer in their "Officer Reviews" tab.
          </div>
          <Field label="Review Note">
            <textarea value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder="Add your field visit observations, document checks, farm conditions..." style={{ ...inp, height:120, resize:"vertical" }} />
          </Field>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={() => { approve(noteModal); setNoteModal(null); setReviewNote(""); }}>Approve & Save Note</Btn>
            <Btn variant="info" onClick={() => { setNoteModal(null); setReviewNote(""); }}>Save Note Only</Btn>
            <Btn variant="ghost" onClick={() => setNoteModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}