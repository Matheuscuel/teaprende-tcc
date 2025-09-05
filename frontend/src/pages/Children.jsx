import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Children() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true); setErr("");
    try {
      const path = q ? `/api/children?q=${encodeURIComponent(q)}` : "/api/children";
      const data = await api(path);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setRows(list);
    } catch (e) {
      // se API retornar 204, nosso helper pode lançar — tratamos como vazio
      setRows([]);
      if (e?.message && !/204|No Content/i.test(e.message)) setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-2 items-center mb-4">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          onKeyDown={(e)=> e.key === "Enter" && load()}
          placeholder="Buscar por nome…"
          className="w-full md:w-80 rounded-xl px-4 py-2 border border-slate-300"
        />
        <button
          onClick={load}
          className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:brightness-110 active:scale-95"
        >Buscar</button>
      </div>

      {loading && <div>Carregando…</div>}
      {err && <div className="text-red-600">{err}</div>}
      {!loading && !rows.length && <div>Nenhuma criança encontrada.</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(c => (
          <div key={c.id}
            className="rounded-2xl bg-white/95 shadow p-5 hover:shadow-md transition cursor-pointer"
            onClick={()=>navigate(`/children/${c.id}`)}
          >
            <div className="text-lg font-semibold text-sky-900">{c.name}</div>
            <div className="text-slate-600 mt-1">Idade: {c.age} · Gênero: {c.gender}</div>
            {c.notes && <div className="text-slate-500 mt-2 text-sm">{c.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
