// frontend/src/pages/Children.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { api } from "@/services/api";

export default function Children() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const d = await api.get("/api/children");
        const list = Array.isArray(d?.data) ? d.data : (Array.isArray(d) ? d : []);
        if (!cancelled) setItems(list);
      } catch {
        if (!cancelled) setErr("Não foi possível carregar as crianças.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(c =>
      [c.name, c.gender, String(c.age ?? "")]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    );
  }, [items, q]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/40 to-white p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header + busca */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-brand-700">Crianças</h1>
              <p className="text-sm text-slate-500">Gerencie crianças e veja os detalhes.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome, idade, gênero…"
                className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              />
              {/* Botão só visual para a demo */}
              <Button className="whitespace-nowrap" type="button">+ Nova</Button>
            </div>
          </CardHeader>
        </Card>

        {/* Lista */}
        {loading ? (
          <div className="text-slate-600">Carregando…</div>
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="text-slate-600">Nenhum registro encontrado.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card key={c.id}>
                <CardBody className="space-y-2">
                  <div className="text-base font-semibold text-slate-800">{c.name}</div>
                  <div className="text-sm text-slate-500">
                    {c.age ? `${c.age} anos` : "—"} {c.gender ? `· ${c.gender}` : ""}
                  </div>
                  <div className="pt-2">
                    <Link to={`/children/${c.id}`}>
                      <Button className="w-full">Ver detalhes</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
