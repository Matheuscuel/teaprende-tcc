import { useEffect, useState } from "react";

export default function ChildGameTimeseries({ childId, gameId, token }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/children/${childId}/performance/${gameId}/timeseries`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setPoints(data.points || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [childId, gameId, token]);

  if (loading) return <div>Carregando…</div>;
  if (!points.length) return <div>Sem sessões registradas para este jogo.</div>;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Evolução de Pontuação</h4>
      <ul className="text-sm list-disc pl-5">
        {points.map(p => (
          <li key={p.id}>
            {new Date(p.completed_at).toLocaleString()} — score: <b>{p.score}</b> (tempo: {p.time_spent || 0}s)
          </li>
        ))}
      </ul>
    </div>
  );
}
