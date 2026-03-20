import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";

export default function StudentPage() {
  const navigate = useNavigate();
  const email    = localStorage.getItem("email") || "";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activePanel, setActivePanel] = useState("assigned");

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  async function logout() { await signOut(auth); localStorage.clear(); navigate("/"); }

  return (
    <div style={s.page}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.logoBox}>T</div>
          <div>
            <div style={s.topbarTitle}>TESTIFY</div>
            <div style={s.topbarSub}>{email}</div>
          </div>
        </div>
        <button onClick={logout} style={s.logoutBtn}>Sign Out</button>
      </div>

      {/* Mobile tab switcher */}
      {isMobile && (
        <div style={s.mobileTabs}>
          <button onClick={() => setActivePanel("assigned")} style={{
            ...s.mobileTab,
            background: activePanel === "assigned" ? "#1E3A8A" : "transparent",
            color:      activePanel === "assigned" ? "#fff"    : "#64748B",
            borderBottom: activePanel === "assigned" ? "2px solid #D97706" : "2px solid transparent",
          }}>
            📋 Assigned Tests
          </button>
          <button onClick={() => setActivePanel("results")} style={{
            ...s.mobileTab,
            background: activePanel === "results" ? "#1E3A8A" : "transparent",
            color:      activePanel === "results" ? "#fff"   : "#64748B",
            borderBottom: activePanel === "results" ? "2px solid #D97706" : "2px solid transparent",
          }}>
            📊 My Results
          </button>
        </div>
      )}

      {/* Body */}
      <div style={{ ...s.body, flexDirection: isMobile ? "column" : "row" }}>
        {/* LEFT — Assigned Tests */}
        {(!isMobile || activePanel === "assigned") && (
          <div style={{ ...s.panel, borderRight: isMobile ? "none" : "1px solid #E2E8F0" }}>
            {!isMobile && (
              <div style={s.panelHeader}>
                <div style={s.panelIcon}>📋</div>
                <div>
                  <div style={s.panelTitle}>Assigned Tests</div>
                  <div style={s.panelSub}>Tests waiting for you</div>
                </div>
              </div>
            )}
            {!isMobile && <div style={s.divider} />}
            <AssignedSection email={email} navigate={navigate} />
          </div>
        )}

        {/* RIGHT — My Results */}
        {(!isMobile || activePanel === "results") && (
          <div style={s.panel}>
            {!isMobile && (
              <div style={s.panelHeader}>
                <div style={{ ...s.panelIcon, background: "#FEF3C7" }}>📊</div>
                <div>
                  <div style={s.panelTitle}>My Results</div>
                  <div style={s.panelSub}>Evaluated submissions</div>
                </div>
              </div>
            )}
            {!isMobile && <div style={s.divider} />}
            <ResultsSection email={email} />
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function AssignedSection({ email, navigate }) {
  const [tests, setTests]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const q    = query(collection(db, "tests"), where("assignedStudent", "==", email.toLowerCase().trim()));
        const snap = await getDocs(q);
        setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetch_();
  }, [email]);

  if (loading) return <div style={s.center}><span style={s.spinner} /></div>;
  if (!tests.length) return <div style={s.empty}><div style={s.emptyIcon}>📭</div><p style={s.emptyText}>No tests assigned yet</p></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {tests.map(test => (
        <div key={test.id} style={s.testCard}>
          <div style={{ minWidth: 0 }}>
            <div style={s.testName}>{test.testName}</div>
            <div style={s.testMeta}>{test.marksPerQuestion} marks / question</div>
          </div>
          <button onClick={() => navigate(`/exam/${test.id}`, { state: test })} style={s.startBtn}>
            ▶ Start
          </button>
        </div>
      ))}
    </div>
  );
}

function ResultsSection({ email }) {
  const [results, setResults]  = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const q    = query(collection(db, "submissions"), where("studentEmail", "==", email.toLowerCase().trim()));
        const snap = await getDocs(q);
        const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setResults(all.filter(r => r.status === "evaluated").sort((a, b) => (b.submittedAt?.seconds ?? 0) - (a.submittedAt?.seconds ?? 0)));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetch_();
  }, [email]);

  if (loading) return <div style={s.center}><span style={s.spinner} /></div>;
  if (!results.length) return <div style={s.empty}><div style={s.emptyIcon}>📊</div><p style={s.emptyText}>No results yet</p></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {results.map(r => (
        <div key={r.id} style={s.resultCard}>
          <div style={s.resultTop}>
            <div style={{ ...s.testName, flex: 1, minWidth: 0 }}>{r.testName}</div>
            <div style={s.scorePill}>{r.totalMarks} / {r.maxMarks}</div>
          </div>
          <div style={s.resultDivider} />
          <div style={s.feedbackLabel}>Feedback</div>
          <div style={s.feedbackText}>{r.adminFeedback || "No feedback provided."}</div>
        </div>
      ))}
    </div>
  );
}

const s = {
  page:         { minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Poppins',sans-serif", display: "flex", flexDirection: "column" },
  topbar:       { background: "#1E3A8A", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  topbarLeft:   { display: "flex", alignItems: "center", gap: 12 },
  logoBox:      { width: 38, height: 38, borderRadius: 9, background: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 },
  topbarTitle:  { color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: 2 },
  topbarSub:    { color: "#93C5FD", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 },
  logoutBtn:    { background: "none", border: "1.5px solid #3B82F6", borderRadius: 20, color: "#93C5FD", fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap" },
  mobileTabs:   { display: "flex", background: "#fff", borderBottom: "1px solid #E2E8F0" },
  mobileTab:    { flex: 1, padding: "12px 8px", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  body:         { display: "flex", flex: 1 },
  panel:        { flex: 1, padding: "20px 16px", overflowY: "auto" },
  panelHeader:  { display: "flex", alignItems: "center", gap: 14, marginBottom: 20 },
  panelIcon:    { width: 44, height: 44, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  panelTitle:   { fontWeight: 700, fontSize: 16, color: "#1E293B" },
  panelSub:     { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  divider:      { height: 1, background: "#E2E8F0", marginBottom: 20 },
  center:       { display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 },
  spinner:      { width: 26, height: 26, border: "3px solid #E2E8F0", borderTop: "3px solid #1E3A8A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
  empty:        { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 10 },
  emptyIcon:    { fontSize: 40 },
  emptyText:    { color: "#94A3B8", fontSize: 13 },
  testCard:     { background: "#fff", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", gap: 12 },
  testName:     { fontWeight: 600, fontSize: 14, color: "#1E293B", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  testMeta:     { fontSize: 11, color: "#94A3B8" },
  startBtn:     { background: "#1E3A8A", border: "none", borderRadius: 20, color: "#fff", fontSize: 12, fontWeight: 600, padding: "8px 16px", cursor: "pointer", letterSpacing: 0.5, whiteSpace: "nowrap", flexShrink: 0 },
  resultCard:   { background: "#fff", borderRadius: 12, padding: "16px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  resultTop:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, gap: 8 },
  scorePill:    { background: "#1E3A8A", color: "#fff", fontWeight: 700, fontSize: 13, padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 },
  resultDivider:{ height: 1, background: "#F1F5F9", margin: "12px 0" },
  feedbackLabel:{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.5, marginBottom: 4 },
  feedbackText: { fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 1.6 },
};