import { useEffect, useState } from "react";
import api from "../services/api";

function GameCard({ game }) {
  return (
    <div className="rounded-2xl bg-white/95 shadow p-5 hover:shadow-md transition">
      <div className="text-xl font-semibold text-sky-900">{game.title}</div>
      <div className="text-sky-700/80 mt-1">{game.category} · {game.level}</div>
      <p className="text-slate-600 mt-3">{game.description}</p>

      <div className="mt-4 flex items-center gap-3">
        <button
          className="px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:brightness-110 active:scale-95"
          onClick={() => alert("Em breve: jogar/preview do jogo")}
        >
          Jogar
        </button>
        <button
          className="px-4 py-2 rounded-xl border border-sky-300 text-sky-800 hover:bg-sky-50"
          onClick={() => alert("Em breve: atribuir a uma criança")}
        >
          Atribuir
        </button>
      </div>
    </div>
  );
}

export default function Games() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/api/games");
        setRows(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
      } catch (e) {
        setErr(e.message || "Falha ao carregar jogos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Carregando jogos…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!rows.length) return <div className="p-6">Nenhum jogo cadastrado.</div>;

  return (
    <div className="p-6 grid gap-5 md:grid-cols-2">
      {rows.map(g => <GameCard key={g.id} game={g} />)}
    </div>
  );
}
