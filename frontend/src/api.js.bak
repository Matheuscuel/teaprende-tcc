export const API_URL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, "")) || "";

const KEY = "teaprende.token";
export const setToken   = (t) => localStorage.setItem(KEY, t);
export const getToken   = () => localStorage.getItem(KEY) || "";
export const clearToken = () => localStorage.removeItem(KEY);

async function request(path, { method = "GET", body, headers } = {}) {
  const h = { "Content-Type": "application/json", ...(headers || {}) };
  const token = getToken();
  if (token) h.Authorization = `Bearer ${token}`;

  const res = await fetch(API_URL + path, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = new Error(data?.message || data?.error || res.statusText);
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get:  (p)    => request(p),
  post: (p,b)  => request(p, { method: "POST", body: b }),
};
