"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const j = await res.json().catch(()=>({error:"Erro"}));
        throw new Error(j.error || "Falha no login");
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-600">{err}</p>}
        <button className="bg-black text-white px-4 py-2 rounded">Entrar</button>
        <p className="text-sm text-gray-600">Demos: terapeuta@demo.com, prof@demo.com, responsavel@demo.com (senha: 123456)</p>
      </form>
    </main>
  );
}
