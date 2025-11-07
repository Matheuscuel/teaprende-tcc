export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Login falhou");
  }
  return res.json();
}

export async function getMyChildren(token) {
  const res = await fetch(`${API_BASE}/api/children/mine`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Falha ao buscar crianças");
  }
  return res.json();
}
