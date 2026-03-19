import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={s.bg}>
      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.logoBox}>T</div>
          <span style={s.brandName}>TESTIFY</span>
        </div>
        <h1 style={s.headline}>The Smart<br />Testing Platform</h1>
        <p style={s.tagline}>Assign, attempt and evaluate — all in one place.</p>
        <div style={s.dots}>
          {["Instant test creation","Real-time submissions","Detailed evaluation"].map(t => (
            <div key={t} style={s.dot}><div style={s.dotCircle}/><span style={s.dotText}>{t}</span></div>
          ))}
        </div>
      </div>
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Welcome back</h2>
          <p style={s.cardSub}>Sign in to continue to your dashboard</p>
          <button
            onClick={() => navigate("/login")}
            style={s.btn}
            onMouseEnter={e => e.currentTarget.style.background="#1E40AF"}
            onMouseLeave={e => e.currentTarget.style.background="#1E3A8A"}
          >
            Sign In
          </button>
          <p style={s.footer}>Powered by Firebase · Secure &amp; Fast</p>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const s = {
  bg:        { minHeight:"100vh", display:"flex", fontFamily:"'Georgia',serif", background:"#0F172A" },
  left:      { flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 56px", background:"#1E3A8A" },
  brand:     { display:"flex", alignItems:"center", gap:14, marginBottom:48 },
  logoBox:   { width:44, height:44, borderRadius:10, background:"#D97706", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:22, fontFamily:"'Georgia',serif" },
  brandName: { color:"#fff", fontSize:20, fontWeight:700, letterSpacing:3, fontFamily:"'Poppins',sans-serif" },
  headline:  { color:"#fff", fontSize:48, fontWeight:700, lineHeight:1.15, margin:"0 0 18px", letterSpacing:-0.5 },
  tagline:   { color:"#93C5FD", fontSize:16, margin:"0 0 40px", lineHeight:1.6, fontFamily:"'Poppins',sans-serif" },
  dots:      { display:"flex", flexDirection:"column", gap:14 },
  dot:       { display:"flex", alignItems:"center", gap:12 },
  dotCircle: { width:8, height:8, borderRadius:"50%", background:"#D97706", flexShrink:0 },
  dotText:   { color:"#BFDBFE", fontSize:14, fontFamily:"'Poppins',sans-serif" },
  right:     { width:460, display:"flex", alignItems:"center", justifyContent:"center", padding:40, background:"#0F172A" },
  card:      { background:"#1E293B", borderRadius:24, padding:"48px 40px", width:"100%", border:"1px solid #334155", animation:"fadeUp 0.5s ease" },
  cardTitle: { color:"#F1F5F9", fontSize:28, fontWeight:700, margin:"0 0 8px", fontFamily:"'Georgia',serif" },
  cardSub:   { color:"#94A3B8", fontSize:14, margin:"0 0 36px", fontFamily:"'Poppins',sans-serif" },
  btn:       { width:"100%", height:52, background:"#1E3A8A", border:"none", borderRadius:12, color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer", transition:"background 0.2s", fontFamily:"'Poppins',sans-serif", letterSpacing:0.5 },
  footer:    { color:"#475569", fontSize:12, textAlign:"center", marginTop:24, fontFamily:"'Poppins',sans-serif" },
};