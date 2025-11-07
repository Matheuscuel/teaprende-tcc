export const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:3001/api").replace(/\/+$/, "");

export async function getGameProgress({ childId, from, to, token }) {
  const url = new URL(`${API_BASE}/game-progress`);
  if (childId) url.searchParams.set("childId", childId);
  if (from)    url.searchParams.set("from", from);
  if (to)      url.searchParams.set("to", to);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
