import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function ChildAssign(){
  const { id } = useParams();
  const [child, setChild]   = useState(null);
  const [games, setGames]   = useState([]);
  const [assigned, setAssigned] = useState(new Set());
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(()=>{
    (async ()=>{
      setLoading(true); setErr(""); setMsg("");
      try{
        const [c, all, links] = await Promise.all([
          api(`/api/children/${id}`),
          api(`/api/games`),
          api(`/api/children/${id}/games`),
        ]);
        setChild(c);
        setGames(Array.isArray(all)? all : []);
        setAssigned(new Set((Array.isArray(links)?links:[]).map(r=>r.game_id)));
      }catch(e){ setErr(e.message); }
      finally{ setLoading(false); }
    })();
  },[id]);

  async function toggle(gameId){
    setErr(""); setMsg("");
    try{
      if (assigned.has(gameId)){
        // remover
        await api(`/api/children/${id}/games/${gameId}`, { method: "DELETE" });
        const next = new Set(assigned); next.delete(gameId); setAssigned(next);
        setMsg("Jogo removido da criança.");
      }else{
        // atribuir
        await api(`/api/children/${id}/games`, {
          method: "POST",
          body: JSON.stringify({ game_id: gameId })
        });
        const next = new Set(assigned); next.add(gameId); setAssigned(next);
        setMsg("Jogo atribuído com sucesso!");
      }
    }catch(e){ setErr(e.message); }
  }

  if (loading) return <div className="max-w-3xl mx-auto p-6 text-sky-700">Carregando…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to={`/children/${id}`} className="text-sky-700 hover:underline">← Voltar</Link>
        <h1 className="text-2xl font-bold text-sky-900">Atribuir jogos — {child?.name}</h1>
      </div>

      {err && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-3">{err}</div>}
      {msg && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg mb-3">{msg}</div>}

      <div className="bg-white rounded-2xl shadow divide-y">
        {games.map(g=>(
          <label key={g.id} className="flex items-start gap-3 p-4 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={assigned.has(g.id)}
              onChange={()=>toggle(g.id)}
            />
            <div>
              <div className="font-semibold text-sky-800">{g.title}</div>
              <div className="text-sky-600 text-sm">{g.category} • {g.level}</div>
              <p className="text-sky-700 text-sm mt-1">{g.description}</p>
            </div>
          </label>
        ))}
        {!games.length && <div className="p-4 text-sky-700">Nenhum jogo no catálogo.</div>}
      </div>
    </div>
  );
}
