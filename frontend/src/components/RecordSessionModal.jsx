import { useEffect, useMemo, useRef, useState } from "react";
import { startSession, addEvent, finishSession } from "../services/session";
import Toast from "./Toast";

export default function RecordSessionModal({ open, onClose, childId, game }) {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState({ kind:"ok", msg:"" });
  const timerRef = useRef(null);

  const accuracy = useMemo(() => {
    if (events.length === 0) return 0;
    const hits = events.filter(e=>e.type==="hit").length;
    return +(hits / events.length).toFixed(2);
  }, [events]);

  useEffect(() => {
    if (!open) {
      // reset ao fechar
      clearInterval(timerRef.current);
      setSession(null); setEvents([]); setSeconds(0); setScore(0); setNotes("");
      setToast({kind:"ok", msg:""});
    }
  }, [open]);

  async function handleStart() {
    try {
      setLoading(true);
      const s = await startSession(childId, game.id);
      setSession(s);
      timerRef.current = setInterval(()=>setSeconds(v=>v+1), 1000);
    } catch (e) {
      setToast({kind:"error", msg: e?.response?.data?.error || "Erro ao iniciar sessão"});
    } finally {
      setLoading(false);
    }
  }

  async function pushEvent(type) {
    if (!session) return;
    try {
      const ev = await addEvent(session.id, type, { at: seconds });
      setEvents(prev => [...prev, ev]);
      if (type === "hit") setScore(s => s + 10);
    } catch (e) {
      setToast({kind:"error", msg: e?.response?.data?.error || "Erro ao registrar evento"});
    }
  }

  async function handleFinish() {
    if (!session) return;
    try {
      setLoading(true);
      clearInterval(timerRef.current);
      await finishSession(session.id, {
        outcome: "completed",
        score,
        accuracy,
        duration_sec: seconds,
        notes
      });
      setToast({ kind:"ok", msg:"Sessão finalizada!" });
      setTimeout(()=> onClose?.(true), 600); // true => sucesso
    } catch (e) {
      setToast({kind:"error", msg: e?.response?.data?.error || "Erro ao finalizar"});
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div style={sx.backdrop} onClick={()=>onClose?.()}>
      <div style={sx.modal} onClick={(e)=>e.stopPropagation()}>
        <h3 style={{marginTop:0}}>Sessão — {game?.title}</h3>

        {!session ? (
          <button disabled={loading} onClick={handleStart} style={sx.btnPrimary}>
            {loading ? "Iniciando..." : "Iniciar sessão"}
          </button>
        ) : (
          <>
            <div style={sx.row}>
              <div><b>Tempo:</b> {seconds}s</div>
              <div><b>Eventos:</b> {events.length} (hits {events.filter(e=>e.type==="hit").length})</div>
              <div><b>Score:</b> {score}</div>
              <div><b>Accuracy:</b> {accuracy}</div>
            </div>

            <div style={{display:"flex", gap:10, margin:"10px 0 14px"}}>
              <button onClick={()=>pushEvent("hit")} style={sx.btnHit}>Hit</button>
              <button onClick={()=>pushEvent("miss")} style={sx.btnMiss}>Miss</button>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              <label>Observações</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} style={sx.textarea} />
            </div>

            <div style={{display:"flex", gap:10, marginTop:12}}>
              <button onClick={handleFinish} disabled={loading} style={sx.btnPrimary}>
                {loading ? "Finalizando..." : "Finalizar sessão"}
              </button>
              <button onClick={()=>onClose?.()} style={sx.btnGhost}>Cancelar</button>
            </div>
          </>
        )}
      </div>
      <Toast kind={toast.kind} message={toast.msg} onClose={()=>setToast({kind:"ok", msg:""})} />
    </div>
  );
}

const sx = {
  backdrop:{position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:30},
  modal:{width:560, maxWidth:"92vw", background:"#fff", borderRadius:12, padding:16, boxShadow:"0 20px 80px rgba(0,0,0,.3)"},
  row:{display:"flex", gap:12, flexWrap:"wrap", background:"#f8fafc", padding:"8px 10px", borderRadius:8, border:"1px solid #e5e7eb"},
  textarea:{border:"1px solid #cbd5e1", borderRadius:8, padding:"8px 10px"},
  btnPrimary:{background:"#0ea5e9", color:"#fff", border:"none", padding:"10px 12px", borderRadius:10, cursor:"pointer"},
  btnGhost:{background:"#f1f5f9", color:"#0f172a", border:"1px solid #e5e7eb", padding:"10px 12px", borderRadius:10, cursor:"pointer"},
  btnHit:{background:"#16a34a", color:"#fff", border:"none", padding:"10px 12px", borderRadius:10, cursor:"pointer"},
  btnMiss:{background:"#ef4444", color:"#fff", border:"none", padding:"10px 12px", borderRadius:10, cursor:"pointer"},
};

