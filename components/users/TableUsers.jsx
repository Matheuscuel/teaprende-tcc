"use client";

// Componente de tabela para exibir lista de usuários
export default function TableUsers({ items, onEdit, onDelete, onLinkChild, loading = false }) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-x-auto">
      <table className="w-full min-w-[1000px]">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Nome
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Senha
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Papel
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Crianças
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground whitespace-nowrap">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((user) => (
            <tr
              key={user.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
              <td className="px-4 py-3 text-sm">{user.email || "Não informado"}</td>
              <td className="px-4 py-3 text-sm">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {user.password || "Não definida"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm capitalize">{user.role || "Não definido"}</td>
              <td className="px-4 py-3 text-sm">
                {user.children && user.children.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.children.map((child, idx) => (
                      <span
                        key={child.id}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        title={`${child.name}${child.age ? `, ${child.age} anos` : ""}`}
                      >
                        {child.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">Nenhuma criança vinculada</span>
                )}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex gap-2 justify-end flex-wrap">
                  {onLinkChild && (
                    <button
                      onClick={() => onLinkChild(user)}
                      className="px-3 py-1.5 text-xs sm:text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium shadow-sm"
                      title="Vincular criança a este usuário"
                    >
                      👶 Vincular
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(user)}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-medium"
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

