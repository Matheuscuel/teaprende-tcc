"use client";

// Página principal "Quem Usa" com CRUD de usuários
import { useState, useEffect } from "react";
import FormUser from "@/components/users/FormUser";
import TableUsers from "@/components/users/TableUsers";
import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import BackButton from "@/app/components/BackButton";

export default function QuemUsaPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkingUser, setLinkingUser] = useState(null);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";
      const res = await fetch(`${API_BASE}/users`, { headers });
      
      if (!res.ok) {
        let errorMessage = "Erro ao carregar usuários";
        try {
          const data = await res.json();
          errorMessage = data.message || data.error || errorMessage;
        } catch (e) {
          // Se não conseguir parsear JSON, usar status text
          if (res.status === 404) {
            errorMessage = "Rota não encontrada. Certifique-se de que o backend foi reiniciado após as alterações.";
          } else {
            errorMessage = `Erro ${res.status}: ${res.statusText || "Erro desconhecido"}`;
          }
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      setUsers(data.users || data || []);
      setTotalPages(1); // Backend retorna todos, sem paginação por enquanto
    } catch (err) {
      setError(err.message);
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Carregar crianças disponíveis
  const loadChildren = async () => {
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";
      const res = await fetch(`${API_BASE}/children`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        setAvailableChildren(data.children || data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar crianças:", err);
    }
  };

  // Abrir dialog para vincular criança
  const handleLinkChild = (user) => {
    setLinkingUser(user);
    setSelectedChildId("");
    loadChildren();
    setShowLinkDialog(true);
  };

  // Vincular criança ao usuário
  const handleLinkChildSubmit = async () => {
    if (!selectedChildId) {
      alert("Selecione uma criança");
      return;
    }
    
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";
      const res = await fetch(`${API_BASE}/users/${linkingUser.id}/children`, {
        method: "POST",
        headers,
        body: JSON.stringify({ child_id: Number(selectedChildId) }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Erro ao vincular criança");
      }
      
      setShowLinkDialog(false);
      setLinkingUser(null);
      alert("Criança vinculada com sucesso!");
      loadUsers();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  // Criar usuário
  const handleCreate = async (formData) => {
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Erro ao criar usuário");
      }
      const data = await res.json();
      setShowDialog(false);
      alert(`Usuário criado com sucesso!\nEmail: ${data.user?.email}\nSenha: ${data.password || formData.password}`);
      loadUsers();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  // Editar usuário
  const handleEdit = (user) => {
    setEditingUser(user);
    setShowDialog(true);
  };

  // Salvar edição
  const handleUpdate = async (formData) => {
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";
      const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Erro ao atualizar usuário");
      }
      setShowDialog(false);
      setEditingUser(null);
      alert("Usuário atualizado com sucesso!");
      loadUsers();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  // Deletar usuário
  const handleDelete = async (user) => {
    if (!confirm(`Tem certeza que deseja excluir "${user.name}"?`)) {
      return;
    }
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(userData);
      }
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "DELETE",
        headers
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Erro ao deletar usuário");
      }
      alert("Usuário excluído com sucesso!");
      loadUsers();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  // Submeter formulário (criar ou editar)
  const handleSubmit = (formData) => {
    if (editingUser) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  // Cancelar formulário
  const handleCancel = () => {
    setShowDialog(false);
    setEditingUser(null);
  };

  // Abrir dialog para novo usuário
  const handleNew = () => {
    setEditingUser(null);
    setShowDialog(true);
  };

  // Filtrar usuários localmente
  const filteredUsers = users.filter((user) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-4">
        <BackButton href="/dashboard/admin" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Quem Usa</h1>
      <p className="text-muted-foreground mb-6">
        Gerencie usuários que utilizam o sistema (Professores, Terapeutas e
        Responsáveis)
      </p>

      {/* Barra de busca e botão novo */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nome ou papel..."
          className="flex-1 px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleNew}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Novo
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Tabela de usuários */}
      <TableUsers
        items={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLinkChild={handleLinkChild}
        loading={loading}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-4 flex gap-2 justify-center items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-md border border-border bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-md border border-border bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Dialog para criar/editar */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </h2>
            <FormUser
              initial={editingUser}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Dialog para vincular criança */}
      {showLinkDialog && linkingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Vincular Criança a {linkingUser.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Selecione uma criança:
                </label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecione uma criança</option>
                  {availableChildren.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} {child.age ? `(${child.age} anos)` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkingUser(null);
                    setSelectedChildId("");
                  }}
                  className="px-4 py-2 rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleLinkChildSubmit}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Vincular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
    </RoleGuard>
  );
}
