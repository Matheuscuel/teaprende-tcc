import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  const enterDemo = () => {
    localStorage.setItem("token", "demo-token");
    nav("/dashboard");
  };

  return (
    <div style={{minHeight:"100vh", display:"grid", placeItems:"center", background:"#f7f7fb"}}>
      <div style={{maxWidth:900, padding:24, textAlign:"center"}}>
        <h1 style={{fontSize:40, marginBottom:10, backgroundColor: 'orange', padding: '20px'}}>🚨 SE VOCÊ VÊ ISSO, ESTÁ USANDO REACT ROUTER (src/pages/Home.jsx) 🚨</h1>
        <p style={{fontSize:18, color:"#4b5563", marginBottom:24}}>
          Plataforma de apoio a habilidades sociais — acesse o painel para explorar.
        </p>

        <div style={{display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap"}}>
          <Link to="/login"><button style={{padding:"10px 16px"}}>Entrar</button></Link>
          <Link to="/register"><button style={{padding:"10px 16px"}}>Criar conta</button></Link>
          <button onClick={enterDemo} style={{padding:"10px 16px"}}>Entrar em DEMO</button>
        </div>
      </div>
    </div>
  );
}
