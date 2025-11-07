import { Link, Routes, Route } from "react-router-dom";

function Card({ to, title, subtitle }) {
  return (
    <Link to={to} className="no-underline text-inherit">
      <div style={{
        border:"1px solid #e5e7eb", borderRadius:12, padding:20, width:320,
        boxShadow:"0 2px 10px rgba(0,0,0,0.06)", background:"#fff"
      }}>
        <div style={{fontSize:22, fontWeight:700}}>{title}</div>
        <div style={{marginTop:8, color:"#555"}}>{subtitle}</div>
      </div>
    </Link>
  );
}

function DashboardHome() {
  return (
    <div style={{padding:24}}>
      <h2 style={{fontSize:26, marginBottom:20}}>Painel</h2>
      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))"}}>
        <Card to="etapas" title="Etapas" subtitle="Tarefas, Habilidades e Recompensas" />
        <Card to="relatorios" title="Relatórios" subtitle="PDF/JSON por criança e período" />
        <Card to="criancas" title="Crianças" subtitle="Cadastro e perfil (stub)" />
        <Card to="jogos" title="Jogos" subtitle="Gerenciar/atribuir (stub)" />
        <Card to="config" title="Configurações" subtitle="Preferências (stub)" />
      </div>
    </div>
  );
}

// Páginas simples para não quebrar a navegação (sem chamadas à API)
const Page = ({title}) => (
  <div style={{padding:24}}>
    <h2 style={{fontSize:26, marginBottom:10}}>{title}</h2>
    <p>Conteúdo em breve. A navegação já está funcional.</p>
  </div>
);

export default function Dashboard() {
  return (
    <div style={{minHeight:"100vh", background:"#f7f7fb"}}>
      <header style={{display:"flex", gap:16, alignItems:"center", padding:"12px 20px", background:"#111827", color:"#fff"}}>
        <strong style={{fontSize:18}}>TEAprende</strong>
        <nav style={{display:"flex", gap:12, fontSize:14, opacity:.95}}>
          <Link to="/dashboard" style={{color:"#fff"}}>Painel</Link>
          <Link to="/dashboard/etapas" style={{color:"#fff"}}>Etapas</Link>
          <Link to="/dashboard/relatorios" style={{color:"#fff"}}>Relatórios</Link>
          <Link to="/dashboard/criancas" style={{color:"#fff"}}>Crianças</Link>
          <Link to="/dashboard/jogos" style={{color:"#fff"}}>Jogos</Link>
          <Link to="/dashboard/config" style={{color:"#fff"}}>Config</Link>
          <a
            href="#logout"
            onClick={(e)=>{ e.preventDefault(); localStorage.removeItem("token"); window.location.href="/"; }}
            style={{color:"#fca5a5", marginLeft:16}}
          >Sair</a>
        </nav>
      </header>

      <Routes>
        <Route index element={<DashboardHome/>} />
        <Route path="etapas" element={<Page title="Etapas"/>} />
        <Route path="relatorios" element={<Page title="Relatórios"/>} />
        <Route path="criancas" element={<Page title="Crianças"/>} />
        <Route path="jogos" element={<Page title="Jogos"/>} />
        <Route path="config" element={<Page title="Configurações"/>} />
      </Routes>
    </div>
  );
}
