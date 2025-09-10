import { useEffect, useState } from "react";
import { startSession, addEvent, finishSession } from "../services/session";

export default function RecordSessionModal({ open, onClose, child, game, onDone }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0.9);
  const [duration, setDuration] = useState(120);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) { setSession(null); setMsg(""); }
  }, [open]);

  const handleStart = async () => {
    try {
      setLoading(true);
      const s = await startSession(child.id, game.id);
      setSession(s);
      setMsg("Sessão iniciada!");
    } catch (e) {
      setMsg(e?.response?.data?.error || "Erro ao iniciar sessão");
    } finally { setLoading(false); }
  };

  const handleEvent = async (type) => {
    if (!session) return;
    try {
      setLoading(true);
      await addEvent(session.id, type, { at: Date.now() });
      setMsg(`Evento '${type}' registrado`);
    } catch (e) {
      setMsg(e?.response?.data?.error || "Erro ao registrar evento");
    } finally { setLoading(false); }
  };

  const handleFinish = async () => {
    if (!session) return;
    try {
      setLoading(true);
      await finishSession(session.id, {
        outcome: "completed",
        score: Number(score),
        accuracy: Number(accuracy),
        duration_sec: Number(duration),
        notes,
      });
      setMsg("Sessão finalizada!");
      onDone?.();
      setTimeout(() => onClose?.(), 600);
    } catch (e) {
      setMsg(e?.response?.data?.error || "Erro ao finalizar sessão");
    } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div style={s.backdrop}>
      <div style={s.modal}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3>Registrar Sessão</h3>
          <button onClick={onClose} style={s.linkBtn}>x</button>
        </div>
        <p style={{ marginTop:4, color:"#6b7280" }}>
          Criança: <b>{child?.name}</b> — Jogo: <b>{game?.title}</b>
        </p>

        {!session ? (
          <button onClick={handleStart} disabled={loading} style={s.primary}>Iniciar Sessão</button>
        ) : (
          <>
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button onClick={() => handleEvent("hit")} disabled={loading} style={s.secondary}>Hit</button>
              <button onClick={() => handleEvent("miss")} disabled={loading} style={s.secondary}>Miss</button>
            </div>

            <div style={{ marginTop:16, display:"grid", gap:8 }}>
              <label>Score <input type="number" value={score} onChange={e=>setScore(e.target.value)} /></label>
              <label>Accuracy (0..1) <input type="number" step="0.01" value={accuracy} onChange={e=>setAccuracy(e.target.value)} /></label>
              <label>Duração (seg) <input type="number" value={duration} onChange={e=>setDuration(e.target.value)} /></label>
              <label>Notas <input type="text" value={notes} onChange={e=>setNotes(e.target.value)} /></label>
              <button onClick={handleFinish} disabled={loading} style={s.primary}>Finalizar Sessão</button>
            </div>
          </>
        )}

        {msg && <div style={{ marginTop:12 }}>{msg}</div>}
      </div>
    </div>
  );
}

const s = {
  backdrop:{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modal:{ background:"#fff", width:420, borderRadius:12, padding:16, boxShadow:"0 10px 40px rgba(0,0,0,.2)" },
  primary:{ background:"#4f46e5", color:"#fff", border:"none", padding:"8px 12px", borderRadius:8, cursor:"pointer" },
  secondary:{ background:"#f3f4f6", border:"1px solid #e5e7eb", padding:"8px 12px", borderRadius:8, cursor:"pointer" },
  linkBtn:{ background:"transparent", border:"none", cursor:"pointer", fontSize:18 }
};
