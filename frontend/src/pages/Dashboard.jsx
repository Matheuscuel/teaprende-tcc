import { Link } from "react-router-dom";

export default function Dashboard(){
  return (
    <div style={{padding:24}}>
      <h1>Painel</h1>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16}}>
        <Tile to="/etapas/progresso"  label="Etapas" desc="Tarefas, Habilidades e Recompensas" />
        <Tile to="/relatorios"        label="RelatÃ³rios" desc="PDF/JSON por crianÃ§a e perÃ­odo" />
        <Tile to="/criancas"          label="CrianÃ§as" desc="Cadastro e perfil (stub)" />
        <Tile to="/jogos"             label="Jogos" desc="Gerenciar/atribuir (stub)" />
        <Tile to="/config"            label="ConfiguraÃ§Ãµes" desc="PreferÃªncias (stub)" />
      </div>
    </div>
  );
}
function Tile({to,label,desc}){
  return (
    <Link to={to} style={{textDecoration:"none", color:"inherit"}}>
      <div style={{border:"1px solid #eee", padding:24, borderRadius:16}}>
        <div style={{fontSize:18, fontWeight:700}}>{label}</div>
        <div style={{opacity:.8, marginTop:8}}>{desc}</div>
      </div>
    </Link>
  );
}