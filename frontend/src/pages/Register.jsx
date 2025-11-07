import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const API = process.env.REACT_APP_API_BASE ?? "http://localhost:3001/api";

export default function Register(){
  const nav = useNavigate();
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [msg,setMsg] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    try{
      const r = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      if(!r.ok) throw new Error(String(r.status));
      await r.json();
      localStorage.setItem("token","demo"); // até o backend real
      nav("/app",{replace:true});
    }catch(err){
      setMsg("Falha no cadastro. Tente novamente.");
    }
  }

  return (
    <div style={{maxWidth:460, margin:"60px auto", padding:"0 16px"}}>
      <h2>Criar conta</h2>
      {msg && <div style={{color:"crimson", marginBottom:8}}>{msg}</div>}
      <form onSubmit={onSubmit}>
        <label>Nome</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
        <label>E-mail</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Senha</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit" style={{marginTop:10}}>Cadastrar</button>
      </form>
      <p style={{marginTop:12}}>Já tem conta? <Link to="/login">Entrar</Link></p>
    </div>
  );
}
