"use client";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function RewardsPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);

  async function load() {
    const r = await fetch(`${API}/api/rewards`, { cache: "no-store" });
    setItems(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    await fetch(`${API}/api/rewards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, points: Number(points) }),
    });
    setName(""); setPoints(0);
    await load();
  }

  return (
    <div className="p-6 space-y-6">
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
          {items.map(it => (
            <TableRow key={it.id}>
              <TableCell>{it.id}</TableCell>
              <TableCell>{it.name}</TableCell>
              <TableCell>{it.points}</TableCell>
              <TableCell>{it.active ? "sim" : "não"}</TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow><TableCell colSpan={4}>Sem rewards ainda.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
