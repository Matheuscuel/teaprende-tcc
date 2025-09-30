/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";

export default function RecordSessionModal({
  open,
  onClose,
  onHit,
  onMiss,
  onFinish,
  child,
  game,
}) {
  const [elapsed, setElapsed] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [notes, setNotes] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  if (!open) return null;

  const total = hits + misses;
  const accuracyPct = total ? Math.round((hits / total) * 100) : 0;

  const finish = () => {
    onFinish?.({
      outcome: "completed",
      score: hits,
      accuracy: accuracyPct / 100, // 0–1
      duration_sec: elapsed,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[760px] max-w-[95vw] rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 text-lg font-semibold">
          Sessão — {game?.title ?? "Jogo"}
        </div>

        <div className="mb-4 rounded-lg bg-gray-100 p-3 text-sm">
          <span className="mr-4">Tempo: {elapsed}s</span>
          <span className="mr-4">Eventos: {total} (hits {hits})</span>
          <span className="mr-4">Score: {hits}</span>
          <span>Accuracy: {accuracyPct}%</span>
        </div>

        <div className="mb-4 flex gap-3">
          <button
            onClick={() => { setHits((h) => h + 1); onHit?.(); }}
            className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Hit
          </button>
          <button
            onClick={() => { setMisses((m) => m + 1); onMiss?.(); }}
            className="rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
          >
            Miss
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium">Observações</label>
        <textarea
          className="h-28 w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="O que observou na sessão?"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border px-4 py-2 hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={finish} className="rounded-xl bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
            Finalizar sessão
          </button>
        </div>
      </div>
    </div>
  );
}
