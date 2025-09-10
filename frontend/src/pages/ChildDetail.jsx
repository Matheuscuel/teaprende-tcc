import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import RecordSessionModal from "../components/RecordSessionModal";

export default function ChildDetail() {
  const { id } = useParams();
  const childId = Number(id);

  const [child, setChild] = useState(null);
  const [assigned, setAssigned] = useState([]); // child_game com include { games }
  const [progress, setProgress] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [c, a] = await Promise.all([
      api.get(`/children/${childId}`),
      api.get(`/children/${childId}/games`),
    ]);
    setChild(c.data);
    setAssigned(a.data);
  };

  const loadProgress = async () => {
    try {
      const { data } = await api.get(`/children/${childId}/games/progress`);
      setProgress(data);
    } catch {
      // se não logado, backend retorna 401; ignorar na UI
    }
  };

  useEffect(() => { load(); loadProgress(); }, [childId]);

  const unassign = async (gameId) => {
    try {
      await api.delete(`/children/${childId}/games/${gameId}/assign`);
      setMsg("Atribuição removida.");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.error || "Erro ao remover atribuição");
    }
  };

  const openModal = (game) => { setActiveGame(game); setOpen(true); };

  return (
    <div style={{ padding: 16 }}>
      <h2>Detalhes da criança</h2>
      {child && (
        <div style={{ marginBottom: 16, color: "#374151" }}>
          <div><b>Nome:</b> {child.name}</div>
          <div><b>Idade:</b> {child.age} · <b>Gênero:</b> {child.gender}</div>
          {child.notes && <div><b>Notas:</b> {child.notes}</div>}
        </div>
      )}

      <section style={{ marginTop: 8 }}>
        <h3>Jogos atribuídos</h3>
        {assigned.length === 0 && <div style={{ color: "#6b7280" }}>Nenhum jogo atribuído.</div>}
        <ul style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {assigned.map((cg) => (
            <li key={`${cg.child_id}-${cg.game_id}`} style={{ border:"1px solid #e5e7eb", padding:12, borderRadius:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{cg.games?.title}</div>
                <div style={{ color:"#6b7280", fontSize:14 }}>{cg.games?.category} · {cg.games?.level}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => openModal(cg.games)} style={btn.primary}>Registrar sessão</button>
                <button onClick={() => unassign(cg.game_id)} style={btn.danger}>Remover</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Progresso</h3>
        {progress.length === 0 ? (
          <div style={{ color:"#6b7280" }}>Sem registros ainda.</div>
        ) : (
          <table style={{ width:"100%", marginTop:8, borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ textAlign:"left", borderBottom:"1px solid #e5e7eb" }}>
                <th style={{ padding:"8px 4px" }}>Jogo</th>
                <th style={{ padding:"8px 4px" }}>Score</th>
                <th style={{ padding:"8px 4px" }}>Tempo (s)</th>
                <th style={{ padding:"8px 4px" }}>Quando</th>
                <th style={{ padding:"8px 4px" }}>Notas</th>
              </tr>
            </thead>
            <tbody>
              {progress.map(p => (
                <tr key={p.id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                  <td style={{ padding:"8px 4px" }}>{p.games?.title ?? p.game_id}</td>
                  <td style={{ padding:"8px 4px" }}>{p.score}</td>
                  <td style={{ padding:"8px 4px" }}>{p.time_spent ?? "-"}</td>
                  <td style={{ padding:"8px 4px" }}>{new Date(p.created_at).toLocaleString()}</td>
                  <td style={{ padding:"8px 4px" }}>{p.notes ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}

      <RecordSessionModal
        open={open}
        onClose={() => setOpen(false)}
        child={child}
        game={activeGame}
        onDone={loadProgress}
      />
    </div>
  );
}

const btn = {
  primary:{ background:"#4f46e5", color:"#fff", border:"none", padding:"8px 12px", borderRadius:8, cursor:"pointer" },
  danger:{ background:"#ef4444", color:"#fff", border:"none", padding:"8px 12px", borderRadius:8, cursor:"pointer" }
};
