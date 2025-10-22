"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";

export default function Dashboard() {
  const [children, setChildren] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try { setChildren(await apiFetch("/children/mine")); }
      catch { setErr("Faça login novamente."); }
    })();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas Crianças</h1>
        <button onClick={logout} className="text-sm underline">Sair</button>
      </div>
      {err && <p className="text-red-600 mt-2">{err}</p>}
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map(c => (
          <li key={c.id} className="border rounded p-4">
            <div className="font-medium">{c.name}</div>
            <div className="mt-2 flex gap-3">
              <Link className="underline" href={`/kid?childId=${c.id}`}>Perfil</Link>
              <Link className="underline" href={`/games/memory?childId=${c.id}`}>Jogo da Memória</Link>
            </div>
          </li>
        ))}
      </ul>
      {children.length === 0 && !err && <p className="mt-6 opacity-70">Nenhuma criança vinculada.</p>}
    </main>
  );
}
