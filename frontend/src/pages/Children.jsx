import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Children() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    api.get("/children")
      .then(r => setList(r.data))
      .catch(e => setErr(e?.response?.data?.error || "Erro ao carregar crianças"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:16}}>Carregando...</div>;
  if (err) return <div style={{padding:16, color:"#b91c1c"}}>{err}</div>;

  return (
    <div style={{padding:16}}>
      <h2>Crianças</h2>
      {list.length === 0 ? (
        <div>Nenhuma criança cadastrada.</div>
      ) : (
        <div style={{display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))"}}>
          {list.map((c) => (
            <Link key={c.id} to={`/children/${c.id}`} style={{
              border:"1px solid #e5e7eb", borderRadius:10, padding:12, background:"#fff", textDecoration:"none", color:"#111827"
            }}>
              <div style={{fontWeight:700}}>{c.name}</div>
              <div style={{fontSize:13, color:"#334155"}}>{c.age} anos • {c.gender}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

