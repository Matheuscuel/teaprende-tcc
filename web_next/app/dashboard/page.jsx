"use client";
import { useEffect, useState } from "react";
import { getMyChildren } from "@/lib/api";
import Link from "next/link";

export default function Dashboard() {
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setError("Sessão não encontrada. Faça login."); return; }
    getMyChildren(token)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.value || []);
        setChildren(list);
      })
      .catch(() => setError("Erro carregando crianças"));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Minhas Crianças</h1>
      <ul className="space-y-2">
        {children.map(c => (
          <li key={c.id} className="border p-3 rounded">
            <div className="font-medium">{c.name}</div>
            <Link className="underline text-sm" href={`/children/${c.id}`}>abrir</Link>
          </li>
        ))}
        {children.length === 0 && <li>Nenhuma criança vinculada.</li>}
      </ul>
    </div>
  );
}
