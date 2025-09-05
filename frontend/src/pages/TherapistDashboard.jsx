import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function TherapistDashboard(){
  const [rows,setRows] = useState([]);
  const [err,setErr]   = useState("");

  useEffect(()=>{
    (async ()=>{
      try{
        const data = await api("/api/children");
        const arr  = Array.isArray(data?.data) ? data.data : (Array.isArray(data)?data:[]);
        setRows(arr);
      }catch(e){ setErr(e.message); }
    })();
  },[]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-sky-900 mb-4">Painel do Terapeuta</h1>
      {err && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-3">{err}</div>}
      {!rows.length && <div className="text-sky-700">Nenhuma criança ainda.</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(c=>(
          <div key={c.id} className="bg-white rounded-2xl shadow p-5">
            <div className="font-semibold text-sky-800">{c.name}</div>
            <div className="text-sky-600 text-sm">Idade: {c.age ?? "-"}</div>
            <div className="flex gap-2 mt-3">
              <Link to={`/children/${c.id}`} className="px-3 py-2 rounded-xl bg-sky-700 text-white hover:bg-sky-800">Perfil</Link>
              <Link to={`/children/${c.id}/assign`} className="px-3 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600">Atribuir jogos</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
