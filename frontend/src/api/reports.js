export const API = (process.env.REACT_APP_API_BASE || "http://localhost:3001/api").replace(/\/+$/, "");

async function tryGet(urls, init) {
  for (const u of urls) {
    try {
      const r = await fetch(u, init);
      if (r.ok) return r.json();
      if (r.status === 404) continue;      // tenta o prÃ³ximo
    } catch (e) { /* ignora e tenta o prÃ³ximo */ }
  }
  return null;
}

export async function fetchReportAll({ childId, from, to }) {
  const q = `childId=${encodeURIComponent(childId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  const progress = await tryGet([`${API}/reports/progress?${q}`,        `${API}/game-progress?${q}`])
                  ?? { childId, from, to, progress: [] };

  const skills   = await tryGet([`${API}/reports/skills?${q}`,          `${API}/skills/summary?${q}`, `${API}/skills?${q}`])
                  ?? { childId, from, to, skills: [] };

  const time     = await tryGet([`${API}/reports/time?${q}`,            `${API}/usage/time?${q}`, `${API}/time?${q}`])
                  ?? { childId, from, to, timeSpent: [] };

  const recs     = await tryGet([`${API}/reports/recommendations?${q}`, `${API}/recommendations?${q}`])
                  ?? { childId, from, to, recommendations: [] };

  return { progress, skills, timeSpent: time.timeSpent ?? time.timeSpent ?? [], recommendations: recs.recommendations ?? [] };
}