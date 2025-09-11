import { Link } from "react-router-dom";

export default function TeacherDashboard() {
  return (
    <div style={s.page}>
      <h2>Professor</h2>
      <p>Planeje atividades e acompanhe o desenvolvimento em sala.</p>
      <div style={s.grid}>
        <Card title="Crianças" desc="Consultar dados e progresso">
          <Link to="/children" style={s.btn}>Abrir crianças</Link>
        </Card>
        <Card title="Jogos" desc="Sugestões de atividades lúdicas">
          <Link to="/games" style={s.btn}>Ver jogos</Link>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, desc, children }) {
  return (
    <div style={s.card}>
      <h3 style={{margin:0}}>{title}</h3>
      <p style={{margin:"6px 0 14px"}}>{desc}</p>
      {children}
    </div>
  );
}

const s = {
  page:{padding:16},
  grid:{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", marginTop:12},
  card:{border:"1px solid #e5e7eb", borderRadius:12, padding:16, background:"#fff"},
  btn:{background:"#6366f1", color:"#fff", padding:"8px 12px", borderRadius:8}
};
