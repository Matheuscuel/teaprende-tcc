import { Outlet, Navigate } from "react-router-dom";
import { useAuth, defaultRouteForRole } from "../contexts/AuthContext";

export default function RequireRole({ roles }) {
  const { isLogged, role } = useAuth();
  if (!isLogged) return <Navigate to="/login" replace />;
  if (roles && roles.length > 0 && !roles.map(r=>r.toLowerCase()).includes((role||"").toLowerCase())) {
    // sem permissão: manda pra home padrão do papel atual (ou /children)
    return <Navigate to={defaultRouteForRole(role)} replace />;
  }
  return <Outlet />;
}
