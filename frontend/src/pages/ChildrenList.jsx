import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Children() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/api/children');
        const data = Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [];
        setRows(data);
      } catch (e) {
        setMsg(String(e.message || e));
      }
    })();
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h2>Crianças</h2>
      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
      {!rows.length && <p>Nenhuma criança (ou sem permissão).</p>}
      <ul>
        {rows.map(c => (
          <li key={c.id}>
            <Link to={`/children/${c.id}`}>{c.name} (#{c.id})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
