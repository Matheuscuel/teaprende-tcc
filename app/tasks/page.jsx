"use client";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function TasksPage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("activity");
  const [difficulty, setDifficulty] = useState(1);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch(`${API}/api/tasks`, { cache: "no-store" });
    setItems(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, difficulty: Number(difficulty) }),
      });
      setTitle(""); setType("activity"); setDifficulty(1);
      await load();
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input placeholder="type" value={type} onChange={(e) => setType(e.target.value)} required />
            <Input type="number" min={1} max={5} placeholder="difficulty" value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)} required />
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Criar"}</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Dif.</TableHead>
            <TableHead>Ativa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(it => (
            <TableRow key={it.id}>
              <TableCell>{it.id}</TableCell>
              <TableCell>{it.title}</TableCell>
              <TableCell>{it.type}</TableCell>
              <TableCell>{it.difficulty}</TableCell>
              <TableCell>{it.active ? "sim" : "não"}</TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow><TableCell colSpan={5}>Sem tasks ainda.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
