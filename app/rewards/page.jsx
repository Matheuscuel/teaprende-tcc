"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import BackButton from "@/app/components/BackButton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function RewardsPage() {
  const searchParams = useSearchParams();
  const childId = searchParams?.get("childId") || 1;
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);

  async function load() {
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const r = await fetch(`${API}/api/rewards`, { 
        cache: "no-store",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Demo-User": token === "demo-token" ? "true" : "false"
        }
      });
      if (!r.ok) {
        console.error('Erro ao carregar rewards:', r.statusText);
        setItems([]);
        return;
      }
      const data = await r.json();
      // Garantir que items seja sempre um array
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data && Array.isArray(data.rewards)) {
        setItems(data.rewards);
      } else if (data && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        console.warn('Formato de resposta inesperado:', data);
        setItems([]);
      }
    } catch (error) {
      console.error('Erro ao carregar rewards:', error);
      setItems([]);
    }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const response = await fetch(`${API}/api/rewards`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Demo-User": token === "demo-token" ? "true" : "false"
        },
        body: JSON.stringify({ name, points: Number(points) }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('Erro ao criar reward:', errorData);
        alert(`Erro ao criar reward: ${errorData.error || response.statusText}`);
        return;
      }
      
      setName(""); 
      setPoints(0);
      await load();
    } catch (error) {
      console.error('Erro ao criar reward:', error);
      alert('Erro ao criar reward. Tente novamente.');
    }
  }

  return (
    <div className="p-6 space-y-6">
      <BackButton href={`/kid?childId=${childId}`} />
      <h1 className="text-2xl font-bold">Rewards</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input type="number" min={0} placeholder="points" value={points} onChange={(e) => setPoints(e.target.value)} />
            <Button type="submit">Criar</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Pontos</TableHead>
            <TableHead>Ativa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(items) && items.length > 0 ? (
            items.map(it => (
              <TableRow key={it.id}>
                <TableCell>{it.id}</TableCell>
                <TableCell>{it.name}</TableCell>
                <TableCell>{it.points}</TableCell>
                <TableCell>{it.active ? "sim" : "não"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                Sem rewards ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}



