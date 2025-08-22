import { useState } from 'react';
import api from '../services/api';

export default function ChildForm({ onSuccess }) {
  const [form, setForm] = useState({ name:'', age:'', gender:'', notes:'' });
  const [saving, setSaving] = useState(false);

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/children', { ...form, age: Number(form.age) || null });
      setForm({ name:'', age:'', gender:'', notes:'' });
      onSuccess && onSuccess();
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <input name="name" value={form.name} onChange={onChange} placeholder="Nome" className="border p-2 w-full" required />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" name="age" value={form.age} onChange={onChange} placeholder="Idade" className="border p-2 w-full" />
        <select name="gender" value={form.gender} onChange={onChange} className="border p-2 w-full">
          <option value="">Gênero</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      <textarea name="notes" value={form.notes} onChange={onChange} placeholder="Observações" className="border p-2 w-full" />
      <button disabled={saving} className="px-3 py-2 border rounded">{saving ? 'Salvando...' : 'Salvar'}</button>
    </form>
  );
}
