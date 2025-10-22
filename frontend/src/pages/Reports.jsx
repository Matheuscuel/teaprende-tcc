import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:3001/api";

function iso(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function today() { return iso(new Date()); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); }

export default function Reports() {
  const [token, setToken] = useState("");
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState("");
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({
    progress: null,
    skills: null,
    timeSpent: null,
    recommendations: null,
  });

  useEffect(() => {
    const t = localStorage.getItem("token") || "";
    setToken(t);
  }, []);

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/me/children`, { headers: authHeaders })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(rows => {
        setChildren(rows || []);
        if (rows?.length && !childId) setChildId(String(rows[0].id));
      })
      .catch(async (e) => {
        const msg = e?.status ? `${e.status} ${e.statusText}` : e?.message;
        setErr(`Falha ao carregar crianças: ${msg}`);
      });
  }, [token]); // eslint-disable-line

  function url(ep) {
    return `${API_BASE}/reports/${ep}/${childId}?from=${from}&to=${to}`;
  }

  async function loadAll() {
    if (!childId) { setErr("Selecione uma criança."); return; }
    setErr("");
    setLoading(true);
    try {
      const [progress, skills, timeSpent, recommendations] = await Promise.all([
        fetch(url("progress"), { headers: authHeaders }).then(r => r.json()),
        fetch(url("skills"), { headers: authHeaders }).then(r => r.json()),
        fetch(url("time-spent"), { headers: authHeaders }).then(r => r.json()),
        fetch(url("recommendations"), { headers: authHeaders }).then(r => r.json()),
      ]);
      setData({ progress, skills, timeSpent, recommendations });
    } catch (e) {
      setErr("Erro ao buscar relatórios. Confira período e autenticação.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!childId) return;
    try {
      const r = await fetch(url("pdf"), { headers: authHeaders });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `relatorio_${childId}_${to}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setErr("Falha ao baixar PDF (veja console).");
      console.error(e);
    }
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Criança</span>
          <select
            className="border rounded px-2 py-1"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
          >
            <option value="">Selecione…</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.name || `#${c.id}`}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600">De</span>
          <input type="date" className="border rounded px-2 py-1" value={from} onChange={(e)=>setFrom(e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Até</span>
          <input type="date" className="border rounded px-2 py-1" value={to} onChange={(e)=>setTo(e.target.value)} />
        </label>

        <div className="flex items-end gap-2">
          <button
            onClick={loadAll}
            disabled={loading || !childId}
            className="bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-60"
          >
            {loading ? "Carregando…" : "Buscar"}
          </button>
          <button
            onClick={downloadPdf}
            disabled={!childId}
            className="border rounded px-3 py-2"
            title="Baixar PDF"
          >
            PDF
          </button>
        </div>
      </div>

      {err && <div className="mt-3 text-red-600">{err}</div>}

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Panel title="Progresso" data={data.progress} />
        <Panel title="Habilidades" data={data.skills} />
        <Panel title="Tempo de Uso" data={data.timeSpent} />
        <Panel title="Recomendações" data={data.recommendations} />
      </div>
    </div>
  );
}

function Panel({ title, data }) {
  return (
    <div className="border rounded-lg p-3">
      <h2 className="font-semibold mb-2">{title}</h2>
      {!data ? (
        <div className="text-sm text-gray-500">Sem dados carregados.</div>
      ) : (
        <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
{JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
