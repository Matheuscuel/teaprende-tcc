import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import AssignGame from "../components/AssignGame";
import ProgressForm from "../components/ProgressForm";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function ChildDetail() {
  const { id } = useParams();
  const childId = Number(id);
  const [child, setChild] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selGame, setSelGame] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function loadAll() {
    setLoading(true); setErr("");
    try {
      const [c, g, s] = await Promise.all([
        api(`/api/children/${childId}`),
        api(`/api/children/${childId}/games`),
        api(`/api/children/${childId}/performance`),
      ]);
      setChild(c);
      setAssigned(Array.isArray(g) ? g : []);
      setSummary(Array.isArray(s?.summary) ? s.summary : []);
    } catch (e) {
      setErr(e.message || "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function loadSeries(gameId) {
    if (!gameId) return;
    try {
      const ts = await api(`/api/children/${childId}/performance/${gameId}/timeseries?from=2020-01-01&to=2030-01-01`);
      const pts = Array.isArray(ts?.points) ? ts.points : [];
      setSeries(pts.map(p => ({
        t: new Date(p.completed_at).toLocaleString(),
        score: Number(p.score),
      })));
    } catch {}
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [childId]);
  useEffect(() => { if (selGame) loadSeries(selGame.game_id || selGame.id); }, [selGame]);

  const canShowChart = useMemo(() => series.length > 0, [series]);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!child) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto grid gap-6">
      <div className="rounded-2xl bg-white/95 shadow p-5">
        <div className="text-2xl font-bold text-sky-900">{child.name}</div>
        <div className="text-slate-600 mt-1">Idade: {child.age} · Gênero: {child.gender}</div>
        {child.notes && <div className="text-slate-500 mt-2">{child.notes}</div>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/95 shadow p-5">
          <div className="font-semibold text-sky-900 mb-3">Jogos atribuídos</div>
          {!assigned.length && <div>Nenhum jogo atribuído.</div>}
          <div className="grid gap-3">
            {assigned.map(g => (
              <button
                key={g.game_id}
                onClick={() => setSelGame(g)}
                className={`text-left rounded-xl border p-3 hover:bg-sky-50 ${selGame?.game_id===g.game_id ? "border-sky-500" : "border-slate-200"}`}
              >
                <div className="font-medium text-sky-900">{g.title}</div>
                <div className="text-sm text-slate-600">{g.category} · {g.level}</div>
              </button>
            ))}
          </div>
        </div>

        <AssignGame childId={childId} onDone={loadAll} />
      </div>

      {selGame && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/95 shadow p-5">
            <div className="font-semibold text-sky-900 mb-3">
              Desempenho — {selGame.title}
            </div>
            {canShowChart ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div>Nenhum ponto ainda para este jogo.</div>
            )}
          </div>

          <ProgressForm
            childId={childId}
            gameId={selGame.game_id || selGame.id}
            onSaved={() => loadSeries(selGame.game_id || selGame.id)}
          />
        </div>
      )}

      <div className="rounded-2xl bg-white/95 shadow p-5">
        <div className="font-semibold text-sky-900 mb-3">Resumo por jogo</div>
        {!summary.length && <div>Sem dados ainda.</div>}
        {!!summary.length && (
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Jogo</th>
                  <th className="py-2 pr-4">Sessões</th>
                  <th className="py-2 pr-4">Média</th>
                  <th className="py-2 pr-4">Mediana</th>
                  <th className="py-2 pr-4">Tempo total (s)</th>
                  <th className="py-2 pr-4">Última jogada</th>
                </tr>
              </thead>
              <tbody>
                {summary.map(r => (
                  <tr key={r.game_id} className="border-t">
                    <td className="py-2 pr-4">{r.title}</td>
                    <td className="py-2 pr-4">{r.sessions}</td>
                    <td className="py-2 pr-4">{Number(r.avg_score).toFixed(2)}</td>
                    <td className="py-2 pr-4">{Number(r.median_score)}</td>
                    <td className="py-2 pr-4">{r.total_time_spent}</td>
                    <td className="py-2 pr-4">
                      {r.last_play ? new Date(r.last_play).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
