import { useEffect, useState } from "react";
import { get } from "../api/http";

export default function Progress() {
  const [data, setData]   = useState(null);
  const [err, setErr]     = useState("");
  const [loading, setL]   = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0,10);
    const from  = new Date(Date.now() - 30*864e5).toISOString().slice(0,10);
    const childId = 3; // TODO: conectar ao seletor/estado

    get(`/game-progress?childId=${childId}&from=${from}&to=${today}`)
      .then(setData)
      .catch(e => setErr(e.message||String(e)))
      .finally(()=>setL(false));
  }, []);

  if (loading) return <div style={{padding:16}}>Carregandoâ€¦</div>;
  if (err)     return <div style={{padding:16,color:"red"}}>Erro: {err}</div>;

  return (
    <div style={{padding:16}}>
      <h2>Progresso do Jogo</h2>
      <p>CrianÃ§a <b>{data?.childId}</b> â€“ PerÃ­odo: {data?.from} â†’ {data?.to}</p>

      {Array.isArray(data?.items) && data.items.length ? (
        <ul>
          {data.items.map((it,i)=>(
            <li key={i}>
              <b>{it.title || "(sem tÃ­tulo)"}</b> â€” <i>{it.status || "?"}</i> â€” <small>{it.updated_at}</small>
            </li>
          ))}
        </ul>
      ) : <em>Nada para exibir.</em>}
    </div>
  );
}
