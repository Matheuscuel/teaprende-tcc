import { createContext, useContext, useMemo, useState } from "react";
import api, { setToken } from "../services/api";

// decodifica JWT (sem validar) para pegar o payload
function parseJwt(token) {
  try {
    const base = token.split(".")[1];
    const json = decodeURIComponent(
      atob(base.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function userFromToken(token) {
  const p = parseJwt(token);
  if (!p) return null;
  return {
    id: p.id || p.userId || p.sub,
    name: p.name || "",
    email: p.email || "",
    role: (p.role || p.perfil || "").toLowerCase(),
  };
}

export function defaultRouteForRole(role) {
  switch ((role || "").toLowerCase()) {
    case "admin":        return "/admin";
    case "terapeuta":
    case "therapist":    return "/therapist";
    case "professor":
    case "teacher":      return "/teacher";
    case "responsavel":
    case "responsável":
    case "parent":       return "/parent";
    default:             return "/children";
  }
}

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [tokenState, setTokenState] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => (tokenState ? userFromToken(tokenState) : null));

  const loginWithCredentials = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    acceptToken(data.token);
    return userFromToken(data.token);
  };

  const acceptToken = (token) => {
    setToken(token);
    setTokenState(token);
    const u = userFromToken(token);
    setUser(u);
    return u;
  };

  const logout = () => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    token: tokenState,
    user,
    role: user?.role || null,
    isLogged: !!tokenState,
    hasRole: (roles) => !!user && roles.map(r => r.toLowerCase()).includes((user.role||"").toLowerCase()),
    loginWithCredentials,
    acceptToken,
    logout,
    defaultRouteForRole
  }), [tokenState, user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
