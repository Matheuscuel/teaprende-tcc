import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import ChildForm from "../components/ChildForm"
import AssignGamesModal from "../components/AssignGamesModal"

export default function Children() {
  const [children, setChildren] = useState([])
  const [openAssign, setOpenAssign] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)

  const load = async () => {
    const { data } = await api.get("/children")
    // seu backend responde { page, pageSize, total, data }
    setChildren(data.data || [])
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Crianças</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Cadastrar nova</h2>
          <ChildForm onSuccess={load} />
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Lista</h2>
          <ul className="space-y-2">
            {children.map((c) => (
              <li key={c.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-600">
                    {c.birth_date ? new Date(c.birth_date).toLocaleDateString() : "sem data"} • {c.therapist_name || "—"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => { setSelectedChild(c); setOpenAssign(true) }}
                  >
                    Atribuir jogos
                  </button>
                  <Link to={`/children/${c.id}`} className="px-3 py-1 border rounded">
                    Desempenho
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {openAssign && selectedChild && (
        <AssignGamesModal child={selectedChild} onClose={() => setOpenAssign(false)} />
      )}
    </div>
  )
}
