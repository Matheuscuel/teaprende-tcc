"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function GameProgressPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ child_id: 1, game_id: 3, score: 80, level: 1, duration_seconds: 120 });
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const data = await apiFetch("/api/game-progress");
      setItems(data.items ?? []);
    } catch (e) {
      setErr(String(e.message ?? e));
    }
  }

  useEffect(() => { 
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
    else load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/game-progress", {
        method: "POST",
        body: JSON.stringify(form),
      });
      await load();
    } catch (e) {
      setErr(String(e.message ?? e));
    }
  }

  return (
    <main style={{ padding:24, maxWidth:900, margin:"0 auto" }}>
      <h1>Progresso dos Jogos</h1>

      <form onSubmit={onCreate} style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8, marginBottom:16 }}>
        <input type="number" placeholder="child_id" value={form.child_id} onChange={(e)=>setForm(f=>({...f, child_id:+e.target.value}))} />
        <input type="number" placeholder="game_id"  value={form.game_id}  onChange={(e)=>setForm(f=>({...f, game_id:+e.target.value}))} />
        <input type="number" placeholder="score"    value={form.score}    onChange={(e)=>setForm(f=>({...f, score:+e.target.value}))} />
        <input type="number" placeholder="level"    value={form.level}    onChange={(e)=>setForm(f=>({...f, level:+e.target.value}))} />
        <input type="number" placeholder="duration_seconds" value={form.duration_seconds} onChange={(e)=>setForm(f=>({...f, duration_seconds:+e.target.value}))} />
        <button type="submit">Adicionar</button>
      </form>

      {err && <p style={{ color:"red" }}>Erro: {err}</p>}

      <table border="1" cellPadding="6" style={{ width:"100%" }}>
        <thead>
          <tr><th>ID</th><th>Child</th><th>Game</th><th>Score</th><th>Início</th><th>Fim</th></tr>
        </thead>
        <tbody>
          {items.length === 0 && <tr><td colSpan="6">Sem registros</td></tr>}
          {items.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.child_id}</td>
              <td>{r.game_id}</td>
              <td>{r.score}</td>
              <td>{r.started_at}</td>
              <td>{r.finished_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}