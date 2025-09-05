import { useState } from "react";
import api from "../services/api";

export default function ProgressForm({ childId, gameId, onSaved }) {
  const [score, setScore] = useState(80);
  const [timeSpent, setTimeSpent] = useState(120);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      await api(`/api/children/${childId}/games/${gameId}/progress`, {
        method: "POST",
        body: JSON.stringify({ score: Number(score), time_spent: Number(timeSpent), notes }),
      });
      setMsg("Progresso registrado!");
      onSaved && onSaved();
    } catch (e) {
      setMsg(e.message || "Falha ao registrar progresso");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white/80 border p-4 grid gap-3">
      <div className="font-semibold text-sky-900">Registrar progresso</div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Pontos (0–100)
          <input type="number" min={0} max={100} value={score}
            onChange={e=>setScore(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 mt-1" />
        </label>
        <label className="text-sm">
          Tempo (s)
          <input type="number" min={0} value={timeSpent}
            onChange={e=>setTimeSpent(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 mt-1" />
        </label>
      </div>
      <label className="text-sm">
        Observações
        <input value={notes} onChange={e=>setNotes(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 mt-1" />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-sky-600 text-white font-medium disabled:opacity-60"
      >
        {loading ? "Salvando…" : "Salvar"}
      </button>
      {msg && <div className="text-sm">{msg}</div>}
    </form>
  );
}
