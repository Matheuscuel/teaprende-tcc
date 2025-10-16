"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Dashboard() {
  const [children, setChildren] = useState([]);
  async function load() {
    try {
      const r = await fetch(`${API}/api/children`, { cache: "no-store" });
      const data = await r.json();
      setChildren(Array.isArray(data) ? data : (data?.children ?? []));
    } catch { setChildren([]); }
  }
  useEffect(() => { load(); }, []);

  async function assignMemory(childId) {
    await fetch(`${API}/api/gameplay/assign/${childId}/memory`, { method: "POST" });
    alert("Jogo 'memory' atribuído!");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Painel do Terapeuta</h1>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name || c.full_name || "-"}</TableCell>
                <TableCell className="space-x-2">
                  <Button onClick={() => assignMemory(c.id)}>Atribuir Memory</Button>
                  <Link href={`/rewards`}><Button variant="secondary">Recompensas</Button></Link>
                  <Link href={`/skills`}><Button variant="secondary">Skills</Button></Link>
                  <Link href={`/reports?childId=${c.id}`}><Button variant="outline">Relatório</Button></Link>
                </TableCell>
              </TableRow>
            ))}
            {children.length === 0 && (
              <TableRow><TableCell colSpan={3}>Sem crianças cadastradas.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
