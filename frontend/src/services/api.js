// src/api.js
const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
let token = localStorage.getItem('token') || '';

export function setToken(t) {
  token = t || '';
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const resp = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(txt || `${resp.status} ${resp.statusText}`);
  }
  return resp.status === 204 ? null : await resp.json();
}

export const api = {
  setToken,
  get: (p) => request(p),
  post: (p, b) => request(p, { method: 'POST', body: b }),
  del: (p) => request(p, { method: 'DELETE' }),
};
