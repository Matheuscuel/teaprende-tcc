import { useEffect, useState } from "react";
import api from "../services/api";

export default function Games() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    api.get("/games").then(r => setGames(r.data)).catch(console.error);
  }, []);

  return (
    <div style={{padding:16}}>
      <h2>Jogos</h2>
      {games.length === 0 ? <div>Nenhum jogo cadastrado.</div> : (
        <div style={sx.grid}>
          {games.map(g => (
            <div key={g.id} style={sx.card}>
              <div style={{fontWeight:700}}>{g.title}</div>
              <div style={{fontSize:13, color:"#334155"}}>{g.category} • {g.level}</div>
              <p style={{margin:"6px 0 0"}}>{g.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const sx = {
  grid:{display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"},
  card:{border:"1px solid #e5e7eb", padding:12, borderRadius:10, background:"#fff"},
};

