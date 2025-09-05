const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:3001").replace(/\/$/, "");

export default async function api(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res  = await fetch(API + path, { ...opts, headers });
  const ctyp = res.headers.get("content-type") || "";
  const data = ctyp.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) throw new Error(data?.message || data?.error || res.statusText);
  return data;
}

export { API };
