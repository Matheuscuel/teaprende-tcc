"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("terapeuta@demo.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status} - ${t}`);
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/game-progress");
    } catch (e) {
      setErr(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ display:"grid", placeItems:"center", minHeight:"100vh" }}>
      <form onSubmit={onSubmit} style={{ minWidth: 320 }}>
        <h1 style={{ marginBottom: 16 }}>Tela de Login</h1>
        <label>Email</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width:"100%" }} />
        <label style={{ marginTop:8, display:"block" }}>Senha</label>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width:"100%" }} />
        <button disabled={loading} style={{ marginTop:12 }}>{loading ? "Entrando..." : "Entrar"}</button>
        {err && <p style={{ color:"red" }}>Erro: {err}</p>}
      </form>
    </main>
  );
}