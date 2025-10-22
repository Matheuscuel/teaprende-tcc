import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:3001/api";

// keys = subrotas; api = endpoint
const TABS = [
  { key: "tarefas",      label: "Tarefas",           api: "/tasks" },
  { key: "habilidades",  label: "Habilidades",       api: "/skills" },
  { key: "recompensas",  label: "Recompensas",       api: "/rewards" },
  { key: "progresso",    label: "Progresso do Jogo", api: "/game-progress" },
];

export default function Stages() {
  const [token, setToken] = useState("");
  const [tab, setTab] = useState("tarefas");

  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filtros/ordenacao
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [order, setOrder] = useState("updated_desc");

  const loc = useLocation();
  const nav = useNavigate();

  // sync token
  useEffect(() => { setToken(localStorage.getItem("token") || ""); }, []);

  // descobre subrota atual (/etapas/<sub>)
  useEffect(() => {
    const seg = loc.pathname.split("/").filter(Boolean);
    const i = seg.indexOf("etapas");
    const sub = i >= 0 ? seg[i + 1] : null;
    const known = TABS.find(t => t.key === sub)?.key;
    if (!sub) {
      nav("/etapas/tarefas", { replace: true });
    } else if (!known) {
      nav("/etapas/tarefas", { replace: true });
    } else {
      setTab(known);
    }
  }, [loc.pathname, nav]);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const def = useMemo(() => TABS.find(t => t.key === tab) || TABS[0], [tab]);

  const load = useCallback(async () => {
    if (!token || !def) return;
    setErr(""); setLoading(true);
    try {
      const r = await fetch(`${API_BASE}${def.api}`, { headers });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
      const data = await r.json().catch(() => ({}));
      setItems(data);
    } catch (e) {
      setErr(e?.message || "Erro ao carregar dados.");
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, [token, def, headers]);

  useEffect(() => { load(); }, [load]);

  // normaliza lista
  const list = useMemo(() => {
    const d = items;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.items)) return d.items;
    if (typeof d === "object") return [d];
    return [];
  }, [items]);

  // helpers de campos
  const keyName = (row) => row?.title ?? row?.name ?? row?.skill ?? row?.reward ?? "(sem título)";
  const keyDesc = (row) => row?.description ?? row?.desc ?? row?.details ?? "";
  const keyStatus = (row) => {
    if (typeof row?.status === "string") return row.status.toLowerCase();
    if (typeof row?.completed === "boolean") return row.completed ? "done" : "open";
    if (typeof row?.active === "boolean") return row.active ? "open" : "done";
    return null;
  };
  const keyDates = (row) => ({
    created: row?.created_at ?? row?.createdAt ?? null,
    updated: row?.updated_at ?? row?.updatedAt ?? null,
    due:     row?.due ?? row?.due_date ?? null,
  });
  const keyProgress = (row) => {
    const p = row?.progress ?? row?.completion ?? row?.level;
    if (typeof p === "number") {
      if (p > 1 && p <= 100) return Math.round(p);
      if (p >= 0 && p <= 1) return Math.round(p * 100);
    }
    return null;
  };
  const keyPoints = (row) => (typeof row?.points === "number" ? row.points : null);

  // filtro/busca/ordem
  const filtered = useMemo(() => {
    let arr = [...list];

    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      arr = arr.filter(r => JSON.stringify(r).toLowerCase().includes(qq));
    }

    if (status !== "all") {
      arr = arr.filter(r => {
        const st = keyStatus(r);
        if (status === "open") return st === "open" || st === "todo" || st === "pending";
        if (status === "done") return st === "done" || st === "completed";
        return true;
      });
    }

    const cmp = (a,b) => (a > b ? 1 : a < b ? -1 : 0);
    if (order === "updated_desc") {
      arr.sort((a,b) => cmp(keyDates(b).updated ?? "", keyDates(a).updated ?? ""));
    } else if (order === "created_desc") {
      arr.sort((a,b) => cmp(keyDates(b).created ?? "", keyDates(a).created ?? ""));
    } else if (order === "name_asc") {
      arr.sort((a,b) => cmp(keyName(a).toLowerCase(), keyName(b).toLowerCase()));
    } else if (order === "name_desc") {
      arr.sort((a,b) => cmp(keyName(b).toLowerCase(), keyName(a).toLowerCase()));
    }

    return arr;
  }, [list, q, status, order]);

  function downloadJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${def?.key || "dados"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function goTab(k) {
    const exists = TABS.some(t => t.key === k);
    if (!exists) return;
    // Apenas navega; o useEffect de URL atualiza o estado
    nav(`/etapas/${k}`);
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-2xl font-bold">Etapas</h1>
        <div className="text-xs text-gray-500">
          API: <code>{API_BASE}</code>
        </div>
      </header>

      {/* Tabs (usam sub-rotas) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => goTab(t.key)}
            className={
              "px-3 py-2 rounded-lg border shadow-sm transition-colors " +
              (tab === t.key ? "bg-blue-600 text-white border-blue-600"
                             : "bg-white hover:bg-gray-50")
            }
          >
            {t.label}
          </button>
        ))}

        <div className="ml-auto flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 rounded-lg border shadow-sm bg-white hover:bg-gray-50 disabled:opacity-60"
            disabled={loading}
            title="Recarregar"
          >
            {loading ? "Carregando…" : "Recarregar"}
          </button>
          <a
            className="px-3 py-2 rounded-lg border shadow-sm bg-white hover:bg-gray-50"
            href={`${API_BASE}${def?.api}`}
            target="_blank"
            rel="noreferrer"
            title="Abrir endpoint bruto"
          >
            Abrir endpoint
          </a>
          <button
            onClick={downloadJson}
            className="px-3 py-2 rounded-lg border shadow-sm bg-white hover:bg-gray-50"
            title="Baixar JSON atual"
          >
            Baixar JSON
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar…"
            className="w-full px-3 py-2 rounded-lg border shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border shadow-sm bg-white"
        >
          <option value="all">Todos os status</option>
          <option value="open">Abertos</option>
          <option value="done">Concluídos</option>
        </select>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="px-3 py-2 rounded-lg border shadow-sm bg-white"
        >
          <option value="updated_desc">Atualizados (↓)</option>
          <option value="created_desc">Criados (↓)</option>
          <option value="name_asc">Nome (A→Z)</option>
          <option value="name_desc">Nome (Z→A)</option>
        </select>
      </div>

      {err && <div className="text-red-600 mb-3">{err}</div>}

      {/* Lista */}
      <div className="border rounded-xl bg-white p-3 min-h-[120px]">
        {loading && <div className="text-sm text-gray-500">Carregando…</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-sm text-gray-500">Nada para exibir.</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((row, idx) => (
              <Card
                key={idx}
                data={row}
                keyName={keyName(row)}
                desc={keyDesc(row)}
                status={keyStatus(row)}
                dates={keyDates(row)}
                progress={keyProgress(row)}
                points={keyPoints(row)}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Sub-rotas ativas: /etapas/tarefas • /etapas/habilidades • /etapas/recompensas • /etapas/progresso
      </p>
    </div>
  );
}

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray:  "bg-gray-100 text-gray-700 border-gray-200",
    blue:  "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    red:   "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
}

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value ?? 0)));
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600" style={{ width: `${v}%` }} />
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 w-24">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Card({ data, keyName, desc, status, dates, progress, points }) {
  const toneByStatus = status === "done" || status === "completed" ? "green"
                      : status === "open" || status === "todo" ? "blue"
                      : "gray";

  return (
    <div className="rounded-xl border shadow-sm p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2 mb-2">
        <h3 className="font-semibold flex-1 leading-snug">{keyName}</h3>
        {status && <Badge tone={toneByStatus}>{status}</Badge>}
      </div>

      {desc && (
        <p className="text-sm text-gray-600 mb-3">
          {desc.length > 160 ? desc.slice(0, 160) + "…" : desc}
        </p>
      )}

      <div className="space-y-2">
        {progress != null && (
          <Row label="Progresso">
            <div className="flex items-center gap-2">
              <ProgressBar value={progress} />
              <span className="text-xs text-gray-600 w-10 text-right">{progress}%</span>
            </div>
          </Row>
        )}

        {typeof points === "number" && (
          <Row label="Pontos"><Badge tone="amber">{points}</Badge></Row>
        )}

        {(dates?.due || dates?.updated || dates?.created) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
            {dates?.due && <div><span className="text-gray-500">Prazo:</span> {fmtDate(dates.due)}</div>}
            {dates?.updated && <div><span className="text-gray-500">Atualizado:</span> {fmtDate(dates.updated)}</div>}
            {dates?.created && <div><span className="text-gray-500">Criado:</span> {fmtDate(dates.created)}</div>}
          </div>
        )}
      </div>

      {!desc && progress == null && points == null && !dates?.due && !dates?.updated && !dates?.created && (
        <pre className="text-[11px] mt-2 bg-gray-50 p-2 rounded overflow-auto max-h-40">
{JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function fmtDate(v) {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}
