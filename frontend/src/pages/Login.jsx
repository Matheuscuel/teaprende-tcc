import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const API = process.env.REACT_APP_API_BASE ?? "http://localhost:3001/api";

export default function Login(){
  const nav = useNavigate();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [msg,setMsg] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    try{
      if(email.endsWith("@demo.com")){ localStorage.setItem("token","demo"); nav("/app",{replace:true}); return; }
      const r = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if(!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      localStorage.setItem("token", data.token ?? "demo");
      nav("/app",{replace:true});
    }catch(err){
      setMsg("Falha no login (tente e-mail *@demo.com para modo DEMO).");
    }
  }

  return (
    <div style={{maxWidth:420, margin:"60px auto", padding:"0 16px"}}>
      <h2>Entrar</h2>
      {msg && <div style={{color:"crimson", marginBottom:8}}>{msg}</div>}
      <form onSubmit={onSubmit}>
        <label>E-mail</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <label>Senha</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button type="submit" style={{marginTop:10}}>Entrar</button>
      </form>
      <p style={{marginTop:12}}>Novo por aqui? <Link to="/register">Criar conta</Link></p>
    </div>
  );
}
