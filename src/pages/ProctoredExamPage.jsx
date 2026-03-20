import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const EXAM_DURATION = 600;

export default function ProctoredExamPage() {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const studentEmail = localStorage.getItem("email") || "";
  const test         = state || {};
  const questions    = test.questions || {};
  const qEntries     = Object.entries(questions);

  const [answers,    setAnswers]    = useState({});
  const [timeLeft,   setTimeLeft]   = useState(EXAM_DURATION);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [msg,        setMsg]        = useState("");
  const [activeQ,    setActiveQ]    = useState(0);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);
  const [showNav,    setShowNav]    = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const timerRef     = useRef(null);
  const hasSubmitted = useRef(false);
  const answersRef   = useRef({});
  const testRef      = useRef(test);
  const emailRef     = useRef(studentEmail);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { testRef.current = test; }, [test]); // eslint-disable-line
  useEffect(() => { emailRef.current = studentEmail; }, [studentEmail]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const init = {}; Object.keys(questions).forEach(k => { init[k] = ""; }); setAnswers(init); }, []);

  const submitExam = useCallback(async () => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    clearInterval(timerRef.current);
    setSubmitting(true); setMsg("");
    try {
      const t = testRef.current;
      await addDoc(collection(db, "submissions"), {
        testName: t.testName, studentEmail: emailRef.current.toLowerCase().trim(),
        answers: answersRef.current, questions: t.questions || {},
        marksPerQuestion: t.marksPerQuestion?.toString() ?? "0",
        createdBy: (t.createdBy ?? "unknown").toLowerCase().trim(),
        status: "pending", totalMarks: "", maxMarks: "", calculationPath: "",
        adminFeedback: "", submittedAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) { setMsg(err.message || "Submission failed."); hasSubmitted.current = false; setSubmitting(false); }
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); submitExam(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submitExam]);

  const fmt = s => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const isUrgent      = timeLeft <= 60;
  const answeredCount = qEntries.filter(([k]) => answers[k]?.trim()).length;
  const progress      = qEntries.length > 0 ? (answeredCount / qEntries.length) * 100 : 0;

  if (submitted) return (
    <div style={{
      minHeight: "100vh",
      background: "#F1F5F9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Poppins',sans-serif",
      padding: isMobile ? "16px" : "32px",
      boxSizing: "border-box",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: isMobile ? 16 : 24,
        padding: isMobile ? "32px 20px" : "48px 40px",
        textAlign: "center",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        maxWidth: 420,
        width: "100%",
        boxSizing: "border-box",
      }}>
        <div style={{ fontSize: isMobile ? 48 : 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{
          color: "#1E3A8A",
          fontSize: isMobile ? 20 : 24,
          fontWeight: 700,
          margin: "0 0 12px",
          fontFamily: "'Georgia',serif",
        }}>Exam Submitted!</h2>
        <p style={{
          color: "#64748B",
          fontSize: isMobile ? 13 : 14,
          lineHeight: 1.7,
          margin: "0 0 28px",
        }}>
          Your answers have been recorded.<br />
          Your admin will evaluate and publish results soon.
        </p>
        <button
          onClick={() => navigate("/student")}
          style={{
            background: "#1E3A8A",
            border: "none",
            borderRadius: 12,
            color: "#fff",
            fontSize: isMobile ? 13 : 14,
            fontWeight: 600,
            padding: isMobile ? "12px 24px" : "13px 32px",
            cursor: "pointer",
            width: isMobile ? "100%" : "auto",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.logoBox}>T</div>
          <div>
            <div style={s.topbarTitle}>{test.testName || "Exam"}</div>
            {!isMobile && <div style={s.topbarSub}>{studentEmail}</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isMobile && (
            <button onClick={() => setShowNav(!showNav)} style={s.navToggleBtn}>
              {showNav ? "✕" : `Q${activeQ + 1}`}
            </button>
          )}
          <div style={{ ...s.timerBox, background: isUrgent ? "#450A0A" : "#1E40AF", border: `2px solid ${isUrgent ? "#EF4444" : "#3B82F6"}` }}>
            <span style={{ fontSize: 12, marginRight: 4 }}>{isUrgent ? "⚠️" : "⏱️"}</span>
            <span style={{ ...s.timerText, color: isUrgent ? "#FCA5A5" : "#BFDBFE", fontSize: isMobile ? 16 : 20 }}>{fmt(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "#1E293B" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "#D97706", transition: "width 0.4s" }} />
      </div>
      <div style={{ textAlign: "right", fontSize: 11, color: "#64748B", padding: "4px 16px", background: "#fff", borderBottom: "1px solid #E2E8F0", fontWeight: 600 }}>
        {answeredCount} of {qEntries.length} answered
      </div>

      {/* Mobile: question navigator dropdown */}
      {isMobile && showNav && (
        <div style={s.mobileNavPanel}>
          <div style={s.sideLabel}>Jump to Question</div>
          <div style={s.grid}>
            {qEntries.map(([key], i) => {
              const answered = !!answers[key]?.trim();
              const isActive = activeQ === i;
              return (
                <button key={key} onClick={() => {
                  setActiveQ(i);
                  setShowNav(false);
                  setTimeout(() => document.getElementById(`q-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
                }} style={{
                  ...s.qBtn,
                  background: isActive ? "#1E3A8A" : answered ? "#FEF3C7" : "#fff",
                  color:      isActive ? "#fff"    : answered ? "#92400E" : "#475569",
                  border:     `1.5px solid ${isActive ? "#1E3A8A" : answered ? "#D97706" : "#E2E8F0"}`,
                  fontWeight: isActive || answered ? 700 : 400,
                }}>{i + 1}</button>
              );
            })}
          </div>
          <button onClick={() => { submitExam(); setShowNav(false); }} disabled={submitting} style={{ ...s.finishBtn, marginTop: 12, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <span style={s.spinner} /> : "Finish Exam"}
          </button>
        </div>
      )}

      <div style={s.layout}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <div style={s.sidebar}>
            <div style={s.sideLabel}>Questions</div>
            <div style={s.grid}>
              {qEntries.map(([key], i) => {
                const answered = !!answers[key]?.trim();
                const isActive = activeQ === i;
                return (
                  <button key={key} onClick={() => { setActiveQ(i); document.getElementById(`q-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }} style={{
                    ...s.qBtn,
                    background: isActive ? "#1E3A8A" : answered ? "#FEF3C7" : "#fff",
                    color:      isActive ? "#fff"    : answered ? "#92400E" : "#475569",
                    border:     `1.5px solid ${isActive ? "#1E3A8A" : answered ? "#D97706" : "#E2E8F0"}`,
                    fontWeight: isActive || answered ? 700 : 400,
                  }}>{i + 1}</button>
                );
              })}
            </div>
            <div style={s.legend}>
              <div style={s.legendRow}><div style={{ width: 10, height: 10, borderRadius: 3, background: "#FEF3C7", border: "1.5px solid #D97706", flexShrink: 0 }} /> Answered</div>
              <div style={s.legendRow}><div style={{ width: 10, height: 10, borderRadius: 3, background: "#fff", border: "1.5px solid #E2E8F0", flexShrink: 0 }} /> Unanswered</div>
            </div>
            <button onClick={submitExam} disabled={submitting} style={{ ...s.finishBtn, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? <span style={s.spinner} /> : "Finish Exam"}
            </button>
          </div>
        )}

        {/* Main questions area */}
        <div style={{ ...s.main, padding: isMobile ? "16px" : "22px 28px" }}>
          {msg && <div style={{ background: "#450A0A", border: "1px solid #7F1D1D", color: "#FCA5A5", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>{msg}</div>}
          {qEntries.map(([key, text], i) => (
            <div id={`q-${i}`} key={key} onClick={() => setActiveQ(i)} style={{
              ...s.qCard,
              border: `1.5px solid ${activeQ === i ? "#1E3A8A" : "#E2E8F0"}`,
              boxShadow: activeQ === i ? "0 0 0 3px rgba(30,58,138,0.08)" : "0 1px 4px rgba(0,0,0,0.04)"
            }}>
              <div style={s.qHeader}>
                <div style={s.qNum}>Q{i + 1}</div>
                {answers[key]?.trim()
                  ? <span style={s.answeredBadge}>✓ Answered</span>
                  : <span style={s.unansweredBadge}>Not answered</span>
                }
              </div>
              <p style={s.qText}>{text}</p>
              <textarea placeholder="Type your answer here..." value={answers[key] || ""} rows={4} style={s.textarea}
                onChange={e => { setAnswers(prev => ({ ...prev, [key]: e.target.value })); setActiveQ(i); }} />
            </div>
          ))}
          <button onClick={submitExam} disabled={submitting} style={{ ...s.submitBottom, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <><span style={s.spinner} />&nbsp;&nbsp;Submitting...</> : `Submit Exam (${answeredCount}/${qEntries.length} answered)`}
          </button>
          <div style={{ height: 40 }} />
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s = {
  page:           { minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Poppins',sans-serif", display: "flex", flexDirection: "column" },
  topbar:         { background: "#1E3A8A", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  topbarLeft:     { display: "flex", alignItems: "center", gap: 12 },
  logoBox:        { width: 34, height: 34, borderRadius: 9, background: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 },
  topbarTitle:    { color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 0.5 },
  topbarSub:      { color: "#93C5FD", fontSize: 11 },
  navToggleBtn:   { background: "#1E40AF", border: "1px solid #3B82F6", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, padding: "6px 12px", cursor: "pointer" },
  timerBox:       { display: "flex", alignItems: "center", borderRadius: 20, padding: "6px 12px", transition: "all 0.3s" },
  timerText:      { fontWeight: 800, letterSpacing: 2 },
  mobileNavPanel: { background: "#fff", padding: "16px", borderBottom: "2px solid #E2E8F0" },
  layout:         { display: "flex", flex: 1, alignItems: "flex-start" },
  sidebar:        { width: 190, flexShrink: 0, background: "#fff", borderRight: "1px solid #E2E8F0", padding: "20px 14px", position: "sticky", top: 0, minHeight: "calc(100vh - 90px)" },
  sideLabel:      { fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: 1.5, marginBottom: 12 },
  grid:           { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 16 },
  qBtn:           { width: "100%", aspectRatio: "1", borderRadius: 6, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: 12, transition: "all 0.15s" },
  legend:         { borderTop: "1px solid #E2E8F0", paddingTop: 12, marginBottom: 16, display: "flex", flexDirection: "column", gap: 7 },
  legendRow:      { display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#64748B" },
  finishBtn:      { width: "100%", height: 44, background: "#1E3A8A", border: "none", borderRadius: 20, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  main:           { flex: 1, maxWidth: 720, margin: "0 auto", width: "100%" },
  qCard:          { background: "#fff", borderRadius: 14, padding: "18px 16px", marginBottom: 14, cursor: "pointer", transition: "all 0.2s" },
  qHeader:        { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  qNum:           { width: 32, height: 32, borderRadius: "50%", background: "#1E3A8A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 },
  answeredBadge:  { fontSize: 11, fontWeight: 700, background: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: 20 },
  unansweredBadge:{ fontSize: 11, fontWeight: 600, background: "#F1F5F9", color: "#94A3B8", padding: "3px 10px", borderRadius: 20 },
  qText:          { fontWeight: 600, fontSize: 14, color: "#1E293B", lineHeight: 1.6, marginBottom: 12 },
  textarea:       { width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "11px 12px", fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#374151", outline: "none", resize: "vertical", background: "#F8FAFC", boxSizing: "border-box" },
  submitBottom:   { width: "100%", height: 50, background: "#1E3A8A", border: "none", borderRadius: 25, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 },
  spinner:        { width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
};