import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage             from "./pages/HomePage.jsx";
import LoginPage            from "./pages/LoginPage.jsx";
import AdminPage            from "./pages/AdminPage.jsx";
import EvaluationDetailPage from "./pages/EvaluationDetailPage.jsx";
import StudentPage          from "./pages/StudentPage.jsx";
import ProctoredExamPage    from "./pages/ProctoredExamPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<HomePage />} />
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/admin"        element={<AdminPage />} />
        <Route path="/evaluate/:id" element={<EvaluationDetailPage />} />
        <Route path="/student"      element={<StudentPage />} />
        <Route path="/exam/:id"     element={<ProctoredExamPage />} />
        {/* Catch old signup/login routes and redirect */}
        <Route path="/login/:role"  element={<Navigate to="/login" replace />} />
        <Route path="/signup/:role" element={<Navigate to="/login" replace />} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}