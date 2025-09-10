import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { getChildProgress } from "../services/session";
import RecordSessionModal from "../components/RecordSessionModal";

export default function ChildDetail() {
  const { id } = useParams();
  const childId = Number(id);
  const [child, setChild] = useState(null);
  const [assigned, setAssigned] = useState([]); // jogos atribuídos (M2)
  const [progress, setProgress] = useState([]);
  const [modal, setModal] = useState({ open:false, game:null });

  async function load() {
    const [{ data: c }, { data: cg }, pg] = await Promise.all([
      api.get(`/children/${childId}`),
      api.get(`/children/${childId}/games`),   // do M2
      getChildProgress(childId)                // do M3
    ]);
    setChild(c);
    // cg pode retornar objetos child_game; pega apenas jogos:
    const games = cg.map(x => x.games || x).filter(Boolean);
    setAssigned(games);
    setProgress(pg);
  }

  useEffect(() => { load().catch(console.error); }, [childId]);

  return (
    <div style={{padding:16}}>
      <h2>Criança</h2>
      {!child ? <div>Carregando...</div> : (
        <div style={sx.card}>
          <b>{child.name}</b> — {child.age} anos — {child.gender}
        </div>
      )}

      <h3 style={{marginTop:18}}>Jogos atribuídos</h3>
      <div style={sx.grid}>
        {assigned.length === 0 && <div>Nenhum jogo atribuído.</div>}
        {assigned.map(g => (
          <div key={g.id} style={sx.game}>
            <div style={{fontWeight:700}}>{g.title}</div>
            <div style={{fontSize:13, color:"#334155"}}>{g.category} • {g.level}</div>
            <p style={{margin:"6px 0 10px"}}>{g.description}</p>
            <button onClick={()=>setModal({open:true, game:g})} style={sx.btn}>Registrar sessão</button>
          </div>
        ))}
      </div>

      <h3 style={{marginTop:18}}>Progresso</h3>
      {progress.length === 0 ? <div>Nenhum registro de progresso ainda.</div> : (
        <table style={sx.table}>
          <thead>
            <tr>
              <th>Data</th><th>Jogo</th><th>Score</th><th>Tempo (s)</th><th>Obs</th>
            </tr>
          </thead>
          <tbody>
            {progress.map((p,i)=>(
              <tr key={i}>
                <td>{new Date(p.created_at).toLocaleString()}</td>
                <td>{p.games?.title || p.game?.title || p.game_id}</td>
                <td>{p.score}</td>
                <td>{p.time_spent}</td>
                <td>{p.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <RecordSessionModal
        open={modal.open}
        onClose={(ok)=>{ setModal({open:false, game:null}); if (ok) load().catch(console.error); }}
        childId={childId}
        game={modal.game}
      />
    </div>
  );
}

const sx = {
  card:{border:"1px solid #e5e7eb", padding:12, borderRadius:10, background:"#fff"},
  grid:{display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"},
  game:{border:"1px solid #e5e7eb", padding:12, borderRadius:10, background:"#fff"},
  btn:{background:"#0ea5e9", color:"#fff", border:"none", padding:"8px 12px", borderRadius:10, cursor:"pointer"},
  table:{width:"100%", borderCollapse:"collapse", background:"#fff", border:"1px solid #e5e7eb"},
};

