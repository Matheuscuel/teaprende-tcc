import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:3001/api";

// Tabs que vamos exibir e seus endpoints
const TABS = [
  { key: "tasks",          label: "Tarefas",           path: "/tasks" },
  { key: "skills",         label: "Habilidades",       path: "/skills" },
  { key: "rewards",        label: "Recompensas",       path: "/rewards" },
  { key: "game-progress",  label: "Progresso do Jogo", path: "/game-progress" },
];

export default function Stages() {
  const [token, setToken] = useState("");
  const [tab, setTab] = useState(TABS[0].key);
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  useEffect(() => {
    if (!token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab]);

  async function load() {
    setErr(""); setLoading(true);
    try {
      const def = TABS.find(t => t.key === tab);
      const r = await fetch(`${API_BASE}${def.path}`, { headers });
      if (!r.ok) {
        const msg = `HTTP ${r.status} ${r.statusText}`;
        throw new Error(msg);
      }
      const data = await r.json().catch(() => ({}));
      setItems(data);
    } catch (e) {
      setErr(e?.message || "Erro ao carregar dados.");
      setItems(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Etapas</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "px-3 py-2 rounded border " +
              (tab === t.key ? "bg-blue-600 text-white border-blue-600"
                             : "bg-white hover:bg-gray-50")
            }
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto px-3 py-2 rounded border"
          disabled={loading}
          title="Recarregar"
        >
          {loading ? "Carregando…" : "Recarregar"}
        </button>
      </div>

      {err && <div className="text-red-600 mb-4">{err}</div>}

      {/* Conteúdo */}
      <div className="border rounded-lg p-3 bg-white">
        {!items ? (
          <div className="text-sm text-gray-500">
            {loading ? "Carregando…" : "Sem dados para exibir."}
          </div>
        ) : (
          <AutoRender data={items} />
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Dica: esta tela mostra os dados crus dos endpoints existentes. Assim que
        definirmos o layout final, substituímos o <code>AutoRender</code> por
        componentes específicos (listas, cards, gráficos, etc).
      </p>
    </div>
  );
}

// Renderização simples que tenta listar arrays/objetos de forma amigável,
// caindo para JSON quando o formato é desconhecido.
function AutoRender({ data }) {
  // Se for um array de objetos com campos padronizados, lista em tabela leve
  if (Array.isArray(data) && data.length && typeof data[0] === "object") {
    const cols = Array.from(
      data.reduce((set, row) => {
        Object.keys(row || {}).forEach(k => set.add(k));
        return set;
      }, new Set())
    ).slice(0, 8); // até 8 colunas para não poluir

    return (
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              {cols.map(c => <th key={c} className="py-2 pr-4 font-semibold">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                {cols.map(c => (
                  <td key={c} className="py-1 pr-4">
                    {fmt(row?.[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Senão, mostra JSON “bonito”
  return (
    <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
{JSON.stringify(data, null, 2)}
    </pre>
  );
}

function fmt(v) {
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    if (v.length > 64) return v.slice(0, 64) + "…";
    return v;
  }
  return JSON.stringify(v);
}
