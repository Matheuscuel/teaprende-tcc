import React, { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);
const API = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("tea_token");
    const u = localStorage.getItem("tea_user");
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("auth");
      const data = await res.json();
      const t = data.token || "token";
      setToken(t); setUser({ email });
      localStorage.setItem("tea_token", t);
      localStorage.setItem("tea_user", JSON.stringify({ email }));
      return true;
    } catch {
      // DEMO: aceita *@demo.com
      if (email?.endsWith("@demo.com")) {
        const t = "demo-token";
        setToken(t); setUser({ email });
        localStorage.setItem("tea_token", t);
        localStorage.setItem("tea_user", JSON.stringify({ email }));
        return true;
      }
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error("reg");
    } catch {}
    return login(email, password);
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem("tea_token");
    localStorage.removeItem("tea_user");
  };

  return (
    <AuthCtx.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
