"use client";

// Página principal "Quem Usa" com CRUD de usuários
import { useState, useEffect } from "react";
import FormUser from "../_components/users/FormUser";
import TableUsers from "../_components/users/TableUsers";

export default function QuemUsaPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        q: search,
        page: page.toString(),
        pageSize: "10",
      });
      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao carregar usuários");
      }
      const data = await res.json();
      setUsers(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, page]);

  // Criar usuário
  const handleCreate = async (formData) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar usuário");
      }
      setShowDialog(false);
      alert("Usuário criado com sucesso!");
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
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar usuário");
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
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao deletar usuário");
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

  return (
    <>
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Quem Usa
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#666" }}>
          Gerencie usuários que utilizam o sistema (Professores, Terapeutas e
          Responsáveis)
        </p>

        {/* Barra de busca e botão novo */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou papel..."
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={handleNew}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Novo
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              backgroundColor: "#fee",
              color: "#c00",
              border: "1px solid #fcc",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}

        {/* Tabela de usuários */}
        <TableUsers
          items={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />

        {/* Paginação */}
        {totalPages > 1 && (
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "0.25rem 0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              Anterior
            </button>
            <span style={{ fontSize: "0.875rem", color: "#666" }}>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "0.25rem 0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              Próxima
            </button>
          </div>
        )}

        {/* Dialog para criar/editar */}
        {showDialog && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1.5rem",
                width: "90%",
                maxWidth: "500px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
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
      </main>
    </>
  );
}
