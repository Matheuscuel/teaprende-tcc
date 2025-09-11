// frontend/src/pages/GameDetail.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// 🔁 USE **UM** DOS BLOCOS DE IMPORT A SEGUIR:

// Se você tem alias @ → src no vite.config.js:
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { api } from "@/services/api";

// // OU (sem alias), comente os de cima e descomente estes:
// // import Button from "../components/ui/Button";
// // import { Card, CardHeader, CardBody } from "../components/ui/Card";
// // import { api } from "../services/api";

export default function GameDetail() {
  const { id: childId, gameId } = useParams();
  const [child, setChild] = useState(null);
  const [game, setGame] = useState(null); // do array de jogos atribuídos
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // formulário de progresso
  const [score, setScore] = useState(90);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      setOkMsg("");
      try {
        // 1) criança
        const c = await api.get(`/api/children/${childId}`);
        setChild(c);

        // 2) jogos atribuídos p/ criança
        const gList = await api.get(`/api/children/${childId}/games`);
        // a API retorna objetos no formato { child_id, game_id, title, category, level, ... }
        const found =
          Array.isArray(gList)
            ? gList.find((g) => Number(g.game_id) === Number(gameId))
            : Array.isArray(gList?.data)
            ? gList.data.find((g) => Number(g.game_id) === Number(gameId))
            : null;

        if (!found) {
          setErr("Jogo não encontrado para esta criança.");
        }
        setGame(found || null);
      } catch (e) {
        setErr("Falha ao carregar dados.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [childId, gameId]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      if (Number.isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
        setErr("Score deve ser um número entre 0 e 100.");
        setSaving(false);
        return;
      }
      const body = { score: Number(score), notes };
      await api.post(`/api/children/${childId}/games/${gameId}/progress`, body);
      setOkMsg("Progresso registrado com sucesso!");
      setNotes("");
    } catch (e) {
      let msg = "Erro ao registrar progresso.";
      try {
        const parsed = JSON.parse(e.message);
        msg = parsed?.message || msg;
      } catch {
        // e.message já pode vir com o texto do backend
        if (typeof e.message === "string" && e.message.length < 300) msg = e.message;
      }
      setErr(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4">
        <Link to={`/children/${childId}`}>
          <Button variant="ghost">← Voltar</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-slate-800">Detalhe do Jogo</h1>
            {child && (
              <p className="text-sm text-slate-500">
                Criança: <span className="font-medium text-slate-700">{child.name}</span>
              </p>
            )}
          </div>
        </CardHeader>

        <CardBody>
          {loading && <div className="py-10 text-center text-slate-500">Carregando...</div>}

          {!loading && err && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 mb-4">
              {err}
            </div>
          )}

          {!loading && !err && game && (
            <>
              <div className="mb-6">
                <div className="text-lg font-medium text-slate-800">{game.title}</div>
                <div className="mt-1 text-sm text-slate-600">
                  Categoria: <span className="font-medium">{game.category}</span> · Nível:{" "}
                  <span className="font-medium">{game.level}</span>
                </div>
                {game.instructions && (
                  <p className="mt-3 text-sm text-slate-700">{game.instructions}</p>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {okMsg && (
                  <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                    {okMsg}
                  </div>
                )}

                <div className="flex gap-4 flex-wrap">
                  <div className="grow min-w-[140px]">
                    <label className="text-sm font-medium text-slate-700">Score (0-100)</label>
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      min={0}
                      max={100}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                      required
                    />
                  </div>
                  <div className="grow-[2] min-w-[220px]">
                    <label className="text-sm font-medium text-slate-700">Notas</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observações..."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Registrar progresso"}
                </Button>

                <p className="text-xs text-slate-500 mt-2">
                  * Apenas terapeutas podem registrar progresso. Se aparecer “Sem permissão”, entre com a conta do terapeuta.
                </p>
              </form>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
