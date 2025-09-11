import { useEffect, useState } from "react";
import api from "../services/api";

export default function AssignGame({ childId, onDone }) {
  const [games, setGames] = useState([]);
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/api/games");
        setGames(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
      } catch {}
    })();
  }, []);

  async function submit() {
    if (!gameId) return;
    setLoading(true); setMsg("");
    try {
      await api(`/api/children/${childId}/games`, {
        method: "POST",
        body: JSON.stringify({ game_id: Number(gameId) }),
      });
      setMsg("Jogo atribuído!");
      onDone && onDone();
    } catch (e) {
      setMsg(e.message || "Falha ao atribuir jogo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white/80 border p-4">
      <div className="font-semibold text-sky-900 mb-2">Atribuir jogo</div>
      <div className="flex gap-2 items-center">
        <select
          value={gameId}
          onChange={(e)=>setGameId(e.target.value)}
          className="rounded-lg border px-3 py-2"
        >
          <option value="">Selecione…</option>
          {games.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
        <button
          onClick={submit}
          disabled={loading || !gameId}
          className="px-4 py-2 rounded-xl bg-amber-500 text-white font-medium disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Atribuir"}
        </button>
      </div>
      {msg && <div className="text-sm mt-2">{msg}</div>}
    </div>
  );
}
