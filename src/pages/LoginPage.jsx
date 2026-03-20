import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

export default function LoginPage() {
  const navigate              = useNavigate();
  const [role, setRole]       = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  async function handleGoogle() {
    setError(""); setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const uid  = cred.user.uid;
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) {
        await setDoc(doc(db, "users", uid), { email: cred.user.email.toLowerCase(), role, createdAt: serverTimestamp() });
        localStorage.setItem("uid", uid);
        localStorage.setItem("email", cred.user.email);
        localStorage.setItem("role", role);
        navigate("/" + role);
      } else {
        const savedRole = snap.data().role;
        localStorage.setItem("uid", uid);
        localStorage.setItem("email", cred.user.email);
        localStorage.setItem("role", savedRole);
        navigate("/" + savedRole);
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") setError("Sign-in failed. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ ...s.bg, flexDirection: isMobile ? "column" : "row" }}>
      <div style={{ ...s.left, padding: isMobile ? "32px 28px 24px" : "60px 56px", flex: isMobile ? "unset" : 1 }}>
        <div style={s.brand}>
          <div style={s.logoBox}>T</div>
          <span style={s.brandName}>TESTIFY</span>
        </div>
        <h1 style={{ ...s.headline, fontSize: isMobile ? 24 : 42 }}>Sign In to Your Account</h1>
        <p style={{ ...s.tagline, fontSize: isMobile ? 13 : 15 }}>Select your role and continue with Google</p>
      </div>

      <div style={{ ...s.right, width: isMobile ? "100%" : 480, padding: isMobile ? "24px 20px 40px" : 40, flex: isMobile ? 1 : "unset" }}>
        <div style={{ ...s.card, padding: isMobile ? "32px 20px" : "44px 36px" }}>
          <h2 style={{ ...s.cardTitle, fontSize: isMobile ? 22 : 26 }}>Welcome</h2>
          <p style={s.cardSub}>Choose your role to get started</p>

          <div style={s.roleRow}>
            {[{ key: "student", icon: "🎓", label: "Student" }, { key: "admin", icon: "🛡️", label: "Admin" }].map(r => (
              <button key={r.key} onClick={() => setRole(r.key)} style={{
                ...s.roleBtn,
                background: role === r.key ? "#1E3A8A" : "#1E293B",
                border: "2px solid " + (role === r.key ? "#D97706" : "#334155"),
                color: role === r.key ? "#fff" : "#94A3B8",
                transform: role === r.key ? "scale(1.03)" : "scale(1)",
              }}>
                <span style={{ fontSize: isMobile ? 20 : 24, marginBottom: 6 }}>{r.icon}</span>
                <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, letterSpacing: 1 }}>{r.label.toUpperCase()}</span>
                {role === r.key && <div style={s.roleDot} />}
              </button>
            ))}
          </div>

          <p style={s.hint}>{role === "student" ? "View your assigned tests and results." : "Create tests and evaluate submissions."}</p>
          {error && <div style={s.error}>{error}</div>}

          <button onClick={handleGoogle} disabled={loading} style={{ ...s.googleBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? <span style={s.spinner} /> : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10, flexShrink: 0 }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p style={s.note}>Returning user? Your saved role is used automatically.</p>
          <button onClick={() => navigate("/")} style={s.backBtn}>← Go Back</button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const s = {
  bg:        { minHeight: "100vh", display: "flex", fontFamily: "'Poppins',sans-serif", background: "#0F172A" },
  left:      { display: "flex", flexDirection: "column", justifyContent: "center", background: "#1E3A8A" },
  brand:     { display: "flex", alignItems: "center", gap: 14, marginBottom: 40 },
  logoBox:   { width: 44, height: 44, borderRadius: 10, background: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 22 },
  brandName: { color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 3 },
  headline:  { color: "#fff", fontWeight: 700, lineHeight: 1.2, margin: "0 0 16px", fontFamily: "'Georgia',serif" },
  tagline:   { color: "#93C5FD", lineHeight: 1.6 },
  right:     { display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" },
  card:      { background: "#1E293B", borderRadius: 24, width: "100%", border: "1px solid #334155", animation: "fadeUp 0.4s ease", boxSizing: "border-box" },
  cardTitle: { color: "#F1F5F9", fontWeight: 700, margin: "0 0 6px", fontFamily: "'Georgia',serif" },
  cardSub:   { color: "#94A3B8", fontSize: 13, margin: "0 0 28px" },
  roleRow:   { display: "flex", gap: 12, marginBottom: 14 },
  roleBtn:   { flex: 1, height: 88, borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", position: "relative" },
  roleDot:   { position: "absolute", bottom: 8, width: 6, height: 6, borderRadius: "50%", background: "#D97706" },
  hint:      { color: "#64748B", fontSize: 11, textAlign: "center", margin: "0 0 20px", lineHeight: 1.6, minHeight: 28 },
  error:     { background: "#450A0A", border: "1px solid #7F1D1D", color: "#FCA5A5", borderRadius: 10, padding: "10px 14px", fontSize: 13, textAlign: "center", marginBottom: 16 },
  googleBtn: { width: "100%", height: 50, background: "#F1F5F9", border: "none", borderRadius: 12, color: "#0F172A", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 16, transition: "opacity 0.2s" },
  spinner:   { width: 20, height: 20, border: "2.5px solid #CBD5E1", borderTop: "2.5px solid #1E3A8A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
  note:      { color: "#475569", fontSize: 11, textAlign: "center", margin: "0 0 16px", lineHeight: 1.6 },
  backBtn:   { background: "none", border: "none", color: "#64748B", fontSize: 13, cursor: "pointer", display: "block", margin: "0 auto" },
};