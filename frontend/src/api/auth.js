export const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:3001/api").replace(/\/+$/, "");
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { token, ... }
}
