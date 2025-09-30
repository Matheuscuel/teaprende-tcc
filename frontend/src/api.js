export const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:3001").replace(/\/$/, "");

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const ct = res.headers.get("content-type") || "";
  let data = null;
  try {
    data = ct.includes("application/json") ? await res.json() : await res.text();
  } catch {}

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}
