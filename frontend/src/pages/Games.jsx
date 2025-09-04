// frontend/src/pages/Games.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// 🔁 USE **UM** DOS BLOCOS DE IMPORT A SEGUIR:

// Se você tem alias @ → src no vite.config.js:
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { api } from "@/services/api";

// // OU (sem alias), comente os de cima e descomente estes:
// // import Button from "../components/ui/Button";
// // import { Card, CardHeader, CardBody } from "../components/ui/Card";
// // import { api } from "../services/api";

export default function Games() {
  const [searchParams] = useSearchParams();
  const childId = searchParams.get("child"); // se vier ?child=2, habilita "Atribuir"
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const g = await api.get("/api/games");
        const arr = Array.isArray(g) ? g : Array.isArray(g?.data) ? g.data : [];
        setList(arr);
      } catch (e) {
        console.error(e);
        setErr("Não foi possível carregar os jogos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((g) =>
      [g.title, g.category, g.level]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [list, q]);

  async function handleAssign(gameId) {
    if (!childId) return;
    setAssigningId(gameId);
    setErr("");
    setOk("");
    try {
      await api.post(`/api/children/${childId}/games`, { game_id: gameId });
      setOk("Jogo atribuído com sucesso!");
    } catch (e) {
      let msg = "Erro ao atribuir jogo.";
      try {
        const parsed = JSON.parse(e.message);
        msg = parsed?.message || msg;
      } catch {
        if (typeof e.message === "string" && e.message.length < 300) msg = e.message;
      }
      setErr(msg);
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Jogos</h1>
              {childId ? (
                <p className="text-sm text-slate-500">
                  Modo atribuição para a criança <span className="font-medium">#{childId}</span>
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  Dica: abra <span className="font-mono">/games?child=ID</span> para atribuir jogos.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por título, categoria, nível..."
                className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              />
              <Link to="/children">
                <Button variant="ghost">← Voltar</Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {loading && (
            <div className="py-10 text-center text-slate-500">Carregando...</div>
          )}

          {!loading && (err || ok) && (
            <div className="mb-4">
              {err && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {err}
                </div>
              )}
              {ok && (
                <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  {ok}
                </div>
              )}
            </div>
          )}

          {!loading && !err && (
            <>
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  Nenhum jogo encontrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col"
                    >
                      <div className="mb-2">
                        <div className="text-lg font-semibold text-slate-800">
                          {g.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          Categoria: <span className="font-medium">{g.category}</span>
                          {" · "}
                          Nível: <span className="font-medium">{g.level}</span>
                        </div>
                      </div>

                      {g.description && (
                        <p className="text-sm text-slate-600 line-clamp-3">{g.description}</p>
                      )}

                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <Link to={childId ? `/children/${childId}/games/${g.id}` : `/games/${g.id}`}>
                          <Button variant="secondary" size="sm">Detalhes</Button>
                        </Link>

                        {childId && (
                          <Button
                            size="sm"
                            onClick={() => handleAssign(g.id)}
                            disabled={assigningId === g.id}
                          >
                            {assigningId === g.id ? "Atribuindo..." : "Atribuir"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
