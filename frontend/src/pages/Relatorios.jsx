import React, { useEffect, useMemo, useState } from "react";
import { fetchReportAll } from "../api/reports";

const CHILDREN = [
  { id: 3, name: "Nina Demo" },
  { id: 5, name: "LÃ©o Demo" },
];

function todayIso(d = new Date()){ return d.toISOString().slice(0,10); }

export default function Relatorios(){
  const [childId, setChildId] = useState(5);
  const [from, setFrom]       = useState(todayIso(new Date(Date.now()-1000*60*60*24*30)));
  const [to, setTo]           = useState(todayIso());
  const [data, setData]       = useState(null);
  const [err, setErr]         = useState("");

  const child = useMemo(()=>CHILDREN.find(c => c.id === Number(childId)) ?? CHILDREN[0], [childId]);

  async function load(){
    setErr("");
    try {
      const res = await fetchReportAll({ childId, from, to });
      setData(res);
    } catch(e){
      console.error(e);
      setErr(String(e?.message || e));
    }
  }

  function downloadJSON(){
    const blob = new Blob([JSON.stringify({ childId, from, to, ...data }, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio_${childId}_${to}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  useEffect(()=>{ load(); /* auto-carrega */ }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-semibold">RelatÃ³rios</h2>

        <select className="border rounded px-2 py-1" value={childId} onChange={e=>setChildId(Number(e.target.value))}>
          {CHILDREN.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label>De <input className="border rounded px-2 py-1" type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
        <label>AtÃ© <input className="border rounded px-2 py-1" type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>

        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={load}>Buscar</button>
        <button className="bg-gray-700 text-white px-3 py-2 rounded" onClick={()=>window.print()}>PDF</button>
        <button className="bg-gray-200 px-3 py-2 rounded" onClick={downloadJSON}>JSON</button>
      </div>

      {err ? <div className="text-red-600">Erro: {err}</div> : null}

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Progresso"        json={data?.progress ?? {}} />
        <Card title="Habilidades"      json={data?.skills ?? {}} />
        <Card title="Tempo de Uso"     json={data?.timeSpent ?? {}} />
        <Card title="RecomendaÃ§Ãµes"    json={{recommendations: data?.recommendations ?? []}} />
      </div>

      <p className="text-sm text-gray-500">*PDF simples via impressÃ£o do navegador. Para versÃ£o avanÃ§ada, integrar um endpoint /reports/pdf.</p>
    </div>
  );
}

function Card({ title, json }){
  return (
    <div className="border rounded-lg">
      <div className="px-4 py-2 border-b bg-gray-50 font-medium">{title}</div>
      <pre className="p-4 overflow-auto text-sm">{JSON.stringify(json ?? {}, null, 2)}</pre>
    </div>
  );
}