"use client";

// Componente de tabela para exibir lista de usuários
export default function TableUsers({ items, onEdit, onDelete, loading = false }) {
  if (loading) {
    return (
      <div className="text-center py-8">
        Carregando...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Nome
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Papel
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((user) => (
            <tr
              key={user.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm">{user.name}</td>
              <td className="px-4 py-3 text-sm">{user.role}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onEdit(user)}
                    className="px-3 py-1 text-sm rounded-md border"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="px-3 py-1 text-sm rounded-md bg-red-600 text-white"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

