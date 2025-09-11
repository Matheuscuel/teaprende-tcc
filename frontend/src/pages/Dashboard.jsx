import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard(){
  const [children,setChildren] = useState([]);
  const [games,setGames] = useState([]);
  const [err,setErr] = useState('');
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const c = await api('/api/children').catch(() => []);
        const dataChildren = Array.isArray(c?.data) ? c.data : (Array.isArray(c) ? c : []);
        setChildren(dataChildren);
        const g = await api('/api/games');
        setGames(Array.isArray(g) ? g : []);
      } catch(e){ setErr(e.message); }
      finally { setLoading(false); }
    })();
  },[]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Visão geral</h1>
      {err && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4">{err}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Crianças" value={children.length} />
        <Stat label="Jogos" value={games.length} />
        <Stat label="Sessões (24h)" value="—" />
      </div>

      <section className="bg-white rounded-2xl shadow p-4">
        <h2 className="font-semibold mb-2">Suas crianças</h2>
        <ul className="divide-y">
          {children.map(ch => (
            <li key={ch.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{ch.name}</div>
                <div className="text-sm text-gray-500">{ch.age} anos</div>
              </div>
              <a className="text-blue-700 font-medium" href={/children/}>Abrir</a>
            </li>
          ))}
          {!children.length && !loading && <div className="text-gray-500">Nenhuma criança ainda.</div>}
        </ul>
      </section>
    </div>
  );
}

function Stat({label,value}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
