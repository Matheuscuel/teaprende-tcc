import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth, defaultRouteForRole } from "../contexts/AuthContext";

export default function RequireAuth() {
  const { isLogged } = useAuth();
  const location = useLocation();
  if (!isLogged) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
