import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ChildDetail() {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [summary, setSummary] = useState([]);
  const [series, setSeries] = useState({});

  useEffect(() => {
    (async () => {
      const c = await api.get(`/children/${id}`);
      setChild(c.data);
      const s = await api.get(`/children/${id}/performance`);
      setSummary(s.data);

      const all = {};
      for (const row of s.data) {
        const ts = await api.get(`/children/${id}/performance/${row.game_id}/timeseries`);
        all[row.game_id] = ts.data;
      }
      setSeries(all);
    })();
  }, [id]);

  if (!child) return <div className="p-4">Carregando...</div>;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold">{child.name}</h1>
        <div className="text-sm text-gray-600">
          {child.age} anos • {child.gender} • {child.parent_name} ({child.parent_email})
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {summary.map(s => {
          const ts = series[s.game_id] || [];
          const labels   = ts.map(p => new Date(p.day).toLocaleDateString());
          const scores   = ts.map(p => p.avg_score);
          const timeSecs = ts.map(p => p.total_time_spent);

          return (
            <div key={s.game_id} className="border rounded p-3">
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <div className="text-sm mb-2">
                Sessões: {s.sessions} • Média: {s.avg_score} • Mediana: {Math.round(s.median_score)} • Tempo total: {s.total_time_spent ?? 0}s
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Evolução da Pontuação</div>
                  <Line data={{ labels, datasets: [{ label: 'Pontuação média', data: scores }] }} />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Tempo gasto (s)</div>
                  <Line data={{ labels, datasets: [{ label: 'Tempo por dia', data: timeSecs }] }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
