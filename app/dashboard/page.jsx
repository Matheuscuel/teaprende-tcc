"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!token || !u) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(u));
    fetch("http://localhost:3001/api/me/children", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(setChildren)
    .catch(()=>{});
  }, [router]);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Minhas crianças</h1>
      {user && <p className="mb-4 text-gray-700">Olá, {user.name} ({user.role})</p>}
      <ul className="space-y-2">
        {children.map(c => (
          <li key={c.id} className="border rounded p-3 flex items-center justify-between">
            <span>{c.name}</span>
            <a className="underline text-blue-600" href={`/kid?childId=${c.id}`}>Abrir</a>
          </li>
        ))}
        {children.length === 0 && <p className="text-gray-500">Nenhuma criança associada.</p>}
      </ul>
    </main>
  );
}
