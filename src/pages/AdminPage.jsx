import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";

export default function AdminPage() {
  const navigate = useNavigate();
  const email    = localStorage.getItem("email") || "";
  const [tab, setTab] = useState("create");

  async function logout() { await signOut(auth); localStorage.clear(); navigate("/"); }

  const tabs = [
    { key:"create",   label:"Create Test", icon:"✏️" },
    { key:"assigned", label:"Assigned",    icon:"📋" },
    { key:"evaluate", label:"Evaluate",    icon:"📊" },
  ];

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.logoBox}>T</div>
          <span style={s.brandName}>TESTIFY</span>
        </div>
        <div style={s.emailBadge}>{email}</div>
        <div style={s.navLabel}>NAVIGATION</div>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            ...s.navBtn,
            background:  tab === t.key ? "#1E40AF" : "transparent",
            color:       tab === t.key ? "#fff"    : "#93C5FD",
            borderLeft:  tab === t.key ? "3px solid #D97706" : "3px solid transparent",
          }}>
            <span style={{ fontSize:16, marginRight:10 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
        <div style={{ flex:1 }}/>
        <button onClick={logout} style={s.logoutBtn}>Sign Out</button>
      </div>

      <div style={s.main}>
        <div style={s.mainHeader}>
          <h1 style={s.pageTitle}>{tabs.find(t=>t.key===tab)?.label}</h1>
          <div style={s.adminBadge}>Admin</div>
        </div>
        <div style={s.content}>
          {tab === "create"   && <CreateTestTab email={email} />}
          {tab === "assigned" && <AssignedTab   email={email} />}
          {tab === "evaluate" && <EvaluateTab   navigate={navigate} />}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function CreateTestTab({ email }) {
  const [testName, setTestName]         = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [marksPerQ, setMarksPerQ]       = useState("");
  const [count, setCount]               = useState("");
  const [questions, setQuestions]       = useState([]);
  const [saving, setSaving]             = useState(false);
  const [msg, setMsg]                   = useState({ text:"", ok:true });

  function generateFields() { setQuestions(Array(Math.min(parseInt(count)||0,50)).fill("")); }
  function setQ(i,val) { setQuestions(prev => { const a=[...prev]; a[i]=val; return a; }); }

  async function saveTest() {
    if (!testName||!studentEmail||!marksPerQ||questions.length===0) { setMsg({text:"Please fill all fields and generate questions.",ok:false}); return; }
    setSaving(true); setMsg({text:"",ok:true});
    const qMap = {}; questions.forEach((q,i)=>{ qMap[`q${i+1}`]=q; });
    try {
      const ex = await getDocs(query(collection(db,"tests"),where("testName","==",testName)));
      if (!ex.empty) { setMsg({text:"Test name already exists.",ok:false}); setSaving(false); return; }
      await addDoc(collection(db,"tests"),{ testName, assignedStudent:studentEmail.trim().toLowerCase(), marksPerQuestion:marksPerQ, questions:qMap, createdBy:email.toLowerCase(), createdAt:serverTimestamp() });
      setMsg({text:"✅ Test published successfully!",ok:true});
      setTestName(""); setStudentEmail(""); setMarksPerQ(""); setCount(""); setQuestions([]);
    } catch(err){ setMsg({text:err.message||"Error.",ok:false}); } finally { setSaving(false); }
  }

  return (
    <div style={s.formWrap}>
      {msg.text && <div style={{ ...s.banner, background:msg.ok?"#F0FDF4":"#450A0A", borderColor:msg.ok?"#86EFAC":"#7F1D1D", color:msg.ok?"#166534":"#FCA5A5" }}>{msg.text}</div>}
      <div style={s.fieldGrid}>
        <Field label="Test Title"           value={testName}     onChange={e=>setTestName(e.target.value)}     placeholder="e.g. Java Midterm" />
        <Field label="Target Student Email" value={studentEmail} onChange={e=>setStudentEmail(e.target.value)} placeholder="student@example.com" />
        <Field label="Marks Per Question"   value={marksPerQ}    onChange={e=>setMarksPerQ(e.target.value)}    placeholder="e.g. 5" type="number" />
        <Field label="Total Questions"      value={count}        onChange={e=>setCount(e.target.value)}        placeholder="e.g. 10" type="number" />
      </div>
      <button onClick={generateFields} style={s.genBtn}>Generate Question Fields</button>
      {questions.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {questions.map((q,i) => (
            <Field key={i} label={`Question ${i+1}`} value={q} onChange={e=>setQ(i,e.target.value)} placeholder="Enter question text..." />
          ))}
        </div>
      )}
      {questions.length > 0 && (
        <button onClick={saveTest} disabled={saving} style={{ ...s.publishBtn, opacity:saving?0.7:1 }}>
          {saving ? <span style={s.spinner}/> : "Publish Test"}
        </button>
      )}
    </div>
  );
}

function AssignedTab({ email }) {
  const [tests, setTests]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const q    = query(collection(db,"tests"),where("createdBy","==",email.toLowerCase()));
        const snap = await getDocs(q);
        const all  = snap.docs.map(d=>({id:d.id,...d.data()}));
        all.sort((a,b)=>(b.createdAt?.seconds??0)-(a.createdAt?.seconds??0));
        setTests(all);
      } catch(e){ console.error(e); } finally { setLoading(false); }
    }
    fetch_();
  }, [email]);

  if (loading) return <div style={s.center}><span style={s.spinner}/></div>;
  if (!tests.length) return <div style={s.empty}><div style={s.emptyIcon}>📭</div><p style={s.emptyText}>No tests created yet</p></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {tests.map(test => (
        <div key={test.id} style={s.listCard}>
          <div style={s.listCardLeft}>
            <div style={s.listIcon}>📋</div>
            <div>
              <div style={s.listTitle}>{test.testName}</div>
              <div style={s.listSub}>→ {test.assignedStudent}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={s.qBadge}>{Object.keys(test.questions||{}).length} Qs</span>
            <span style={s.markBadge}>{test.marksPerQuestion} pts/Q</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EvaluateTab({ navigate }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const snap = await getDocs(collection(db,"submissions"));
        const all  = snap.docs.map(d=>({id:d.id,...d.data()}));
        all.sort((a,b)=>(b.submittedAt?.seconds??0)-(a.submittedAt?.seconds??0));
        setSubmissions(all);
      } catch(e){ console.error(e); } finally { setLoading(false); }
    }
    fetch_();
  }, []);

  if (loading) return <div style={s.center}><span style={s.spinner}/></div>;
  if (!submissions.length) return <div style={s.empty}><div style={s.emptyIcon}>📭</div><p style={s.emptyText}>No submissions yet</p></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {submissions.map(sub => (
        <div key={sub.id} onClick={() => navigate(`/evaluate/${sub.id}`,{state:sub})} style={{ ...s.listCard, cursor:"pointer" }}>
          <div style={s.listCardLeft}>
            <div style={{ ...s.listIcon, background: sub.status==="evaluated" ? "#F0FDF4" : "#FEF9C3" }}>
              {sub.status==="evaluated" ? "✅" : "⏳"}
            </div>
            <div>
              <div style={s.listTitle}>{sub.testName}</div>
              <div style={s.listSub}>{sub.studentEmail}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ ...s.statusBadge, background:sub.status==="evaluated"?"#DCFCE7":"#FEF9C3", color:sub.status==="evaluated"?"#166534":"#854D0E" }}>
              {sub.status==="evaluated" ? "Evaluated" : "Pending"}
            </span>
            <span style={{ color:"#94A3B8", fontSize:18 }}>›</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type="text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:4 }}>
      <label style={s.fieldLabel}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{ ...s.fieldInput, borderColor:focused?"#1E3A8A":"#E2E8F0", boxShadow:focused?"0 0 0 3px rgba(30,58,138,0.1)":"none" }}
      />
    </div>
  );
}

const s = {
  page:       { minHeight:"100vh", display:"flex", fontFamily:"'Poppins',sans-serif", background:"#F1F5F9" },
  sidebar:    { width:240, background:"#1E3A8A", display:"flex", flexDirection:"column", padding:"28px 0", minHeight:"100vh" },
  brand:      { display:"flex", alignItems:"center", gap:12, padding:"0 24px", marginBottom:8 },
  logoBox:    { width:36, height:36, borderRadius:9, background:"#D97706", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:18 },
  brandName:  { color:"#fff", fontSize:16, fontWeight:700, letterSpacing:2 },
  emailBadge: { color:"#93C5FD", fontSize:11, padding:"8px 24px 20px", borderBottom:"1px solid #1E40AF", marginBottom:20, wordBreak:"break-all" },
  navLabel:   { color:"#3B82F6", fontSize:10, fontWeight:700, letterSpacing:2, padding:"0 24px", marginBottom:8 },
  navBtn:     { width:"100%", padding:"12px 24px", background:"transparent", border:"none", borderLeft:"3px solid transparent", color:"#93C5FD", fontSize:13, fontWeight:500, cursor:"pointer", textAlign:"left", transition:"all 0.2s", display:"flex", alignItems:"center" },
  logoutBtn:  { margin:"0 16px", padding:"10px", background:"none", border:"1px solid #1E40AF", borderRadius:10, color:"#93C5FD", fontSize:12, cursor:"pointer" },
  main:       { flex:1, display:"flex", flexDirection:"column" },
  mainHeader: { background:"#fff", padding:"20px 32px", borderBottom:"1px solid #E2E8F0", display:"flex", alignItems:"center", justifyContent:"space-between" },
  pageTitle:  { fontSize:22, fontWeight:700, color:"#1E293B", margin:0, fontFamily:"'Georgia',serif" },
  adminBadge: { background:"#EFF6FF", color:"#1E3A8A", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:20, letterSpacing:1 },
  content:    { padding:"28px 32px", overflowY:"auto" },
  formWrap:   { maxWidth:640 },
  banner:     { border:"1px solid", borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:20, textAlign:"center" },
  fieldGrid:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 },
  fieldLabel: { display:"block", fontSize:11, fontWeight:600, color:"#475569", marginBottom:5, letterSpacing:0.3 },
  fieldInput: { width:"100%", height:44, border:"1.5px solid #E2E8F0", borderRadius:10, padding:"0 14px", fontSize:14, color:"#1E293B", outline:"none", fontFamily:"'Poppins',sans-serif", boxSizing:"border-box", transition:"all 0.2s", background:"#fff" },
  genBtn:     { height:44, background:"#1E293B", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", padding:"0 24px", marginBottom:20, letterSpacing:0.5 },
  publishBtn: { width:"100%", height:50, background:"#1E3A8A", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", letterSpacing:0.5 },
  spinner:    { width:20, height:20, border:"2.5px solid rgba(255,255,255,0.3)", borderTop:"2.5px solid #fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" },
  center:     { display:"flex", justifyContent:"center", alignItems:"center", minHeight:200 },
  empty:      { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:200, gap:10 },
  emptyIcon:  { fontSize:40 },
  emptyText:  { color:"#94A3B8", fontSize:13 },
  listCard:   { background:"#fff", borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"box-shadow 0.15s" },
  listCardLeft:{ display:"flex", alignItems:"center", gap:14 },
  listIcon:   { width:42, height:42, borderRadius:10, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 },
  listTitle:  { fontWeight:600, fontSize:14, color:"#1E293B", marginBottom:2 },
  listSub:    { fontSize:11, color:"#94A3B8" },
  qBadge:     { background:"#EFF6FF", color:"#1E3A8A", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 },
  markBadge:  { background:"#FEF3C7", color:"#92400E", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 },
  statusBadge:{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 },
};