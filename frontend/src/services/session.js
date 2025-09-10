/* src/services/session.js */
function parseJwt(token) {
  try {
    if (!token) return null;
    const base = token.split(".")[1];
    const json = atob(base.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}

export function getRole() {
  const u = getUser();
  if (u?.role) return u.role;
  const payload = parseJwt(localStorage.getItem("token"));
  return payload?.role ?? null;
}

export function setUserFromLogin(data = {}) {
  const t = localStorage.getItem("token");
  const payload = parseJwt(t) || {};
  const user = {
    id: data.id ?? payload.id ?? null,
    email: data.email ?? payload.email ?? null,
    role: data.role ?? payload.role ?? null,
  };
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
