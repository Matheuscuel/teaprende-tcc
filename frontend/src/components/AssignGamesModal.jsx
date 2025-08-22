import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AssignGamesModal({ child, onClose }) {
  const [games, setGames] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: all } = await api.get('/games');
      setGames(all);
      const { data: assigned } = await api.get(`/children/${child.id}/games`);
      setSelected(new Set(assigned.map(g => g.id)));
    })();
  }, [child.id]);

  const toggle = (id) => {
    setSelected(prev => {
      const nxt = new Set(prev);
      nxt.has(id) ? nxt.delete(id) : nxt.add(id);
      return nxt;
    });
  };

  const save = async () => {
    setBusy(true);
    try {
      await api.post(`/children/${child.id}/games`, { gameIds: Array.from(selected).map(Number) });
      onClose && onClose();
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-full max-w-lg">
        <h2 className="font-semibold mb-2">Atribuir jogos para {child.name}</h2>
        <div className="max-h-64 overflow-auto mb-3 space-y-1">
          {games.map(g => (
            <label key={g.id} className="flex items-center gap-2">
              <input type="checkbox" checked={selected.has(g.id)} onChange={() => toggle(g.id)} />
              <span>{g.title}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancelar</button>
          <button disabled={busy} onClick={save} className="px-3 py-1 border rounded">{busy ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  );
}
