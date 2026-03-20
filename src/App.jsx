import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage             from "./pages/HomePage.jsx";
import LoginPage            from "./pages/LoginPage.jsx";
import AdminPage            from "./pages/AdminPage.jsx";
import EvaluationDetailPage from "./pages/EvaluationDetailPage.jsx";
import StudentPage          from "./pages/StudentPage.jsx";
import ProctoredExamPage    from "./pages/ProctoredExamPage.jsx";

// Guard: if already logged in, skip home/login and go straight to dashboard
function RedirectIfLoggedIn({ children }) {
  const role = localStorage.getItem("role");
  const uid  = localStorage.getItem("uid");
  if (uid && role) {
    return <Navigate to={`/${role}`} replace />;
  }
  return children;
}

// Guard: if NOT logged in, redirect to home
function RequireAuth({ children }) {
  const uid = localStorage.getItem("uid");
  if (!uid) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — redirect to dashboard if already logged in */}
        <Route path="/" element={
          <RedirectIfLoggedIn><HomePage /></RedirectIfLoggedIn>
        } />
        <Route path="/login" element={
          <RedirectIfLoggedIn><LoginPage /></RedirectIfLoggedIn>
        } />

        {/* Protected routes — redirect to home if not logged in */}
        <Route path="/admin" element={
          <RequireAuth><AdminPage /></RequireAuth>
        } />
        <Route path="/evaluate/:id" element={
          <RequireAuth><EvaluationDetailPage /></RequireAuth>
        } />
        <Route path="/student" element={
          <RequireAuth><StudentPage /></RequireAuth>
        } />
        <Route path="/exam/:id" element={
          <RequireAuth><ProctoredExamPage /></RequireAuth>
        } />

        {/* Catch old routes */}
        <Route path="/login/:role"  element={<Navigate to="/login" replace />} />
        <Route path="/signup/:role" element={<Navigate to="/login" replace />} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}