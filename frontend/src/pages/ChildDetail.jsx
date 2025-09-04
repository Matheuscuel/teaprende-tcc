// frontend/src/pages/ChildDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { api } from "@/services/api";

export default function ChildDetail() {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const c = await api.get(`/api/children/${id}`);
        const g = await api.get(`/api/children/${id}/games`).catch(() => []);
        if (!cancelled) {
          setChild(c?.data || c);
          const list = Array.isArray(g?.data) ? g.data : (Array.isArray(g) ? g : []);
          setGames(list);
        }
      } catch {
        if (!cancelled) setErr("Não foi possível carregar os dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="p-6">Carregando...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!child) return <div className="p-6">Criança não encontrada.</div>;

  return (
    <div className="p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-brand-700">
            {child.name} — {child.age} anos {child.gender ? `(${child.gender})` : ""}
          </h1>
          <Link to="/children">
            <Button>Voltar</Button>
          </Link>
        </CardHeader>

        <CardBody>
          <h2 className="text-sm font-medium text-slate-600 mb-2">Jogos atribuídos</h2>
          {games.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum jogo atribuído.</p>
          ) : (
            <ul className="space-y-2">
              {games.map((g, i) => (
                <li key={g.id || g.game_id || i} className="rounded-lg border p-3">
                  <div className="font-medium">{g.title || `Jogo #${g.game_id}`}</div>
                  {(g.category || g.level) && (
                    <div className="text-xs text-slate-500">
                      {[g.category, g.level].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
