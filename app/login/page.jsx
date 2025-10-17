"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data?.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        throw new Error("Resposta inválida.");
      }
    } catch (err) {
      setError("Falha no login: " + (err?.message || "erro"));
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="border rounded p-2 w-full" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded p-2 w-full" placeholder="senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-black text-white rounded px-4 py-2">Entrar</button>
      </form>

      <div className="mt-6 text-sm opacity-70">
        <p>Demos:</p>
        <ul className="list-disc ml-5">
          <li>terapeuta@demo.com / 123456</li>
          <li>prof@demo.com / 123456</li>
          <li>responsavel@demo.com / 123456</li>
        </ul>
      </div>
    </main>
  );
}
