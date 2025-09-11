import { Link } from "react-router-dom";

export default function TherapistDashboard() {
  return (
    <div style={s.page}>
      <h2>Terapeuta</h2>
      <p>Acompanhe crianças, atribua jogos e registre sessões.</p>
      <div style={s.grid}>
        <Card title="Minhas crianças" desc="Listar e abrir detalhes">
          <Link to="/children" style={s.btn}>Abrir lista</Link>
        </Card>
        <Card title="Jogos" desc="Atribuir e revisar instruções">
          <Link to="/games" style={s.btn}>Ver jogos</Link>
        </Card>
        <Card title="Progresso" desc="Histórico de sessões e scores">
          <Link to="/children" style={s.btn}>Ver progresso</Link>
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
  btn:{background:"#10b981", color:"#fff", padding:"8px 12px", borderRadius:8}
};
