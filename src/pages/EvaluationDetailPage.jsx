import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function EvaluationDetailPage() {
  const { id }    = useParams();
  const { state } = useLocation();
  const navigate  = useNavigate();
  const data      = state || {};
  const questions = data.questions || {};
  const answers   = data.answers   || {};
  const qEntries  = Object.entries(questions);
  const marksPerQ   = parseFloat(data.marksPerQuestion) || 1;
  const maxPossible = qEntries.length * marksPerQ;

  const [marks,      setMarks]      = useState(Array(qEntries.length).fill("0"));
  const [feedback,   setFeedback]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg,        setMsg]        = useState("");

  const total      = marks.reduce((sum,m) => sum+(parseFloat(m)||0), 0);
  const calcString = marks.map(m=>parseFloat(m)||0).join(" + ");

  async function submitEvaluation() {
    if (total > maxPossible) { setMsg("❌ Cannot exceed max marks!"); return; }
    setSubmitting(true); setMsg("");
    try {
      await updateDoc(doc(db,"submissions",id), { totalMarks:total.toString(), maxMarks:maxPossible.toString(), calculationPath:calcString, adminFeedback:feedback.trim(), status:"evaluated" });
      setMsg("✅ Evaluation submitted!");
      setTimeout(() => navigate("/admin"), 1200);
    } catch(err) { setMsg(err.message||"Error."); } finally { setSubmitting(false); }
  }

  const pct = maxPossible > 0 ? Math.round((total/maxPossible)*100) : 0;

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <button onClick={() => navigate("/admin")} style={s.backBtn}>← Back to Admin</button>
        <span style={s.topbarTitle}>Evaluate Submission</span>
        <div style={s.adminBadge}>Admin</div>
      </div>

      <div style={s.layout}>
        {/* Left: questions */}
        <div style={s.left}>
          <div style={s.infoBar}>
            <InfoChip label="Student" value={data.studentEmail||"N/A"} />
            <InfoChip label="Test"    value={data.testName||"N/A"} />
            <InfoChip label="Max"     value={`${maxPossible} pts`} />
          </div>

          {qEntries.map(([key,question],i) => (
            <div key={key} style={s.qCard}>
              <div style={s.qTop}>
                <div style={s.qNum}>Q{i+1}</div>
                <div style={s.qText}>{question}</div>
                <div style={s.markBox}>
                  <input type="number" value={marks[i]} min="0" max={marksPerQ}
                    onChange={e => { const a=[...marks]; a[i]=e.target.value; setMarks(a); }}
                    style={s.markInput}
                  />
                  <span style={s.markOf}>/{marksPerQ}</span>
                </div>
              </div>
              <div style={s.answer}>
                {answers[key] || <span style={{ color:"#94A3B8", fontStyle:"italic" }}>No answer provided</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Right: score + feedback */}
        <div style={s.right}>
          <div style={s.scoreCard}>
            <div style={s.scoreTitle}>Score Summary</div>
            <div style={{ ...s.scoreBig, color: total>maxPossible?"#EF4444":"#1E3A8A" }}>{total}<span style={{ fontSize:18, color:"#94A3B8" }}>/{maxPossible}</span></div>
            <div style={s.pctBar}><div style={{ height:"100%", width:`${Math.min(pct,100)}%`, background: pct>=80?"#16A34A":pct>=50?"#D97706":"#EF4444", borderRadius:6, transition:"width 0.4s" }}/></div>
            <div style={s.pctLabel}>{pct}% score</div>
            <div style={s.calcStr}>{calcString}</div>
          </div>

          <div style={s.feedbackCard}>
            <label style={s.feedbackLabel}>Admin Feedback</label>
            <textarea value={feedback} onChange={e=>setFeedback(e.target.value)}
              placeholder="Write feedback for the student..." rows={5} style={s.textarea}/>
          </div>

          {msg && <div style={{ ...s.msg, color:msg.startsWith("✅")?"#166534":"#991B1B", background:msg.startsWith("✅")?"#F0FDF4":"#FEF2F2", border:`1px solid ${msg.startsWith("✅")?"#86EFAC":"#FCA5A5"}` }}>{msg}</div>}

          <button onClick={submitEvaluation} disabled={submitting} style={{ ...s.submitBtn, opacity:submitting?0.7:1 }}>
            {submitting ? <span style={s.spinner}/> : "Submit Evaluation"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
      <span style={{ fontSize:10, color:"#94A3B8", fontWeight:600, letterSpacing:0.5 }}>{label.toUpperCase()}</span>
      <span style={{ fontSize:13, color:"#1E293B", fontWeight:600 }}>{value}</span>
    </div>
  );
}

const s = {
  page:       { minHeight:"100vh", background:"#F1F5F9", fontFamily:"'Poppins',sans-serif" },
  topbar:     { background:"#1E3A8A", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  backBtn:    { background:"none", border:"1px solid #3B82F6", borderRadius:20, color:"#93C5FD", fontSize:12, fontWeight:600, padding:"6px 16px", cursor:"pointer" },
  topbarTitle:{ color:"#fff", fontWeight:700, fontSize:15, letterSpacing:1 },
  adminBadge: { background:"#1E40AF", color:"#93C5FD", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 },
  layout:     { display:"flex", gap:0, minHeight:"calc(100vh - 52px)", alignItems:"flex-start" },
  left:       { flex:1, padding:"28px 24px", overflowY:"auto" },
  right:      { width:300, padding:"28px 20px", display:"flex", flexDirection:"column", gap:16, borderLeft:"1px solid #E2E8F0", background:"#fff", minHeight:"calc(100vh - 52px)" },
  infoBar:    { background:"#1E3A8A", borderRadius:14, padding:"18px 20px", marginBottom:20, display:"flex", gap:24 },
  qCard:      { background:"#fff", borderRadius:12, padding:"18px 20px", marginBottom:12, border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  qTop:       { display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 },
  qNum:       { width:30, height:30, borderRadius:"50%", background:"#1E3A8A", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, flexShrink:0 },
  qText:      { flex:1, fontWeight:600, fontSize:14, color:"#1E293B", lineHeight:1.5 },
  markBox:    { display:"flex", alignItems:"center", gap:6, flexShrink:0 },
  markInput:  { width:56, height:36, border:"2px solid #1E3A8A", borderRadius:8, textAlign:"center", fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:15, color:"#1E3A8A", outline:"none" },
  markOf:     { fontSize:12, color:"#94A3B8", fontWeight:600 },
  answer:     { background:"#F8FAFC", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#475569", lineHeight:1.6 },
  scoreCard:  { background:"#F8FAFC", borderRadius:14, padding:"20px", border:"1px solid #E2E8F0" },
  scoreTitle: { fontSize:11, fontWeight:700, color:"#64748B", letterSpacing:1, marginBottom:12 },
  scoreBig:   { fontSize:42, fontWeight:700, color:"#1E3A8A", lineHeight:1, marginBottom:14 },
  pctBar:     { height:6, background:"#E2E8F0", borderRadius:6, marginBottom:6, overflow:"hidden" },
  pctLabel:   { fontSize:11, color:"#64748B", marginBottom:12 },
  calcStr:    { fontSize:12, color:"#94A3B8", wordBreak:"break-all" },
  feedbackCard:{ display:"flex", flexDirection:"column", gap:8 },
  feedbackLabel:{ fontSize:11, fontWeight:700, color:"#475569", letterSpacing:0.5 },
  textarea:   { width:"100%", border:"1.5px solid #E2E8F0", borderRadius:10, padding:"10px 12px", fontFamily:"'Poppins',sans-serif", fontSize:13, color:"#1E293B", outline:"none", resize:"vertical", boxSizing:"border-box" },
  msg:        { borderRadius:10, padding:"10px 14px", fontSize:13, textAlign:"center", fontWeight:600 },
  submitBtn:  { width:"100%", height:48, background:"#1E3A8A", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", letterSpacing:0.5 },
  spinner:    { width:20, height:20, border:"2.5px solid rgba(255,255,255,0.3)", borderTop:"2.5px solid #fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" },
};