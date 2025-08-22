import { useState } from "react"
import api from "../services/api"

export default function ChildForm({ onSuccess }) {
  const [form, setForm] = useState({ name: "", birth_date: "", user_id: "", notes: "" })
  const [saving, setSaving] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        birth_date: form.birth_date || null,
        user_id: form.user_id ? Number(form.user_id) : null,
        // owner_id é definido no backend quando o papel for "responsavel"
        notes: form.notes || null,
      }
      await api.post("/children", payload)
      setForm({ name: "", birth_date: "", user_id: "", notes: "" })
      onSuccess && onSuccess()
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input className="border p-2 w-full" name="name" value={form.name} onChange={onChange} placeholder="Nome" required />
      <div className="grid grid-cols-2 gap-2">
        <input type="date" className="border p-2 w-full" name="birth_date" value={form.birth_date} onChange={onChange} />
        <input className="border p-2 w-full" name="user_id" value={form.user_id} onChange={onChange} placeholder="ID do terapeuta (opcional)" />
      </div>
      <textarea className="border p-2 w-full" name="notes" value={form.notes} onChange={onChange} placeholder="Observações" />
      <button disabled={saving} className="px-3 py-2 border rounded">{saving ? "Salvando..." : "Salvar"}</button>
    </form>
  )
}
