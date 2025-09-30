import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, defaultRouteForRole } from "./contexts/AuthContext";
import Nav from "./components/Nav.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Children from "./pages/Children.jsx";
import ChildDetail from "./pages/ChildDetail.jsx";
import Games from "./pages/Games.jsx";

import RequireAuth from "./components/RequireAuth.jsx";
import RequireRole from "./components/RequireRole.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import TherapistDashboard from "./pages/TherapistDashboard.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";

function AppRoutes() {
  const { isLogged, role } = useAuth();
  const home = isLogged ? defaultRouteForRole(role) : "/login";

  return (
    <>
      {isLogged ? <Nav /> : null}
      <Routes>
        {/* públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* grupo protegido (qualquer papel) */}
        <Route element={<RequireAuth />}>
          <Route path="/children" element={<Children />} />
          <Route path="/children/:id" element={<ChildDetail />} />
          <Route path="/games" element={<Games />} />
        </Route>

        {/* por papel */}
        <Route element={<RequireRole roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<RequireRole roles={["terapeuta","therapist"]} />}>
          <Route path="/therapist" element={<TherapistDashboard />} />
        </Route>

        <Route element={<RequireRole roles={["professor","teacher"]} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
        </Route>

        <Route element={<RequireRole roles={["responsavel","responsável","parent"]} />}>
          <Route path="/parent" element={<ParentDashboard />} />
        </Route>

        {/* home e fallback */}
        <Route path="/" element={<Navigate to={home} replace />} />
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
