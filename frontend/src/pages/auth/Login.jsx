import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setErr("");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      if (res.ok) {
        const data = await res.json().catch(()=> ({}));
        localStorage.setItem("token", data?.token || "token-backend");
        return nav("/dashboard");
      }
      // FALLBACK DEMO
      if (/@demo\.com$/i.test(email)) {
        localStorage.setItem("token", "demo-token");
        return nav("/dashboard");
      }
      setErr("Falha no login. Use um e-mail *@demo.com para modo DEMO.");
    } catch {
      if (/@demo\.com$/i.test(email)) {
        localStorage.setItem("token", "demo-token");
        return nav("/dashboard");
      }
      setErr("Servidor indisponível. Tente novamente ou use *@demo.com (DEMO).");
    }
  }

  return (
    <div style={{minHeight:"100vh", display:"grid", placeItems:"center"}}>
      <form onSubmit={onSubmit} style={{width:360, padding:24, border:"1px solid #e5e7eb", borderRadius:12}}>
        <h2 style={{fontSize:24, marginBottom:16}}>Entrar</h2>
        <label>E-mail</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required style={{width:"100%", marginBottom:12}}/>
        <label>Senha</label>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required style={{width:"100%", marginBottom:16}}/>
        {err && <div style={{color:"#b91c1c", marginBottom:10}}>{err}</div>}
        <button type="submit" style={{width:"100%", padding:"10px 12px"}}>Entrar</button>
        <div style={{marginTop:10, textAlign:"center"}}>
          Novo por aqui? <Link to="/register">Criar conta</Link>
        </div>
      </form>
    </div>
  );
}
