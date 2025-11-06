/* eslint-disable no-restricted-globals */
export const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:3001/api").replace(/\/+$/, "");

export function getToken(){ try { return localStorage.getItem("token") || ""; } catch { return ""; } }
export function setToken(t){ try { localStorage.setItem("token", t||""); } catch {} }
export function clearToken(){ try { localStorage.removeItem("token"); } catch {} }

export async function api(path, { method="GET", headers={}, body } = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/")?"":"/"}${path}`;
  const token = getToken();
  const res = await fetch(url, {
    method,
    headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) , ...headers },
    body: body ? (typeof body==="string" ? body : JSON.stringify(body)) : undefined
  });

  // tratamento global de 401
  if (res.status === 401) {
    clearToken();
    try { console.warn("401: redirecionando para /login"); } catch {}
    if (window.location.pathname.toLowerCase() !== "/login") window.location.href = "/login";
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type")||"";
  return ct.includes("application/json") ? res.json() : res.text();
}

