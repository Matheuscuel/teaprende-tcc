// Store em memória para usuários (persistência apenas durante dev server)
import crypto from "crypto";

// Array de usuários em memória
let users = [
  {
    id: crypto.randomUUID(),
    name: "Maria Silva",
    role: "Professor",
  },
  {
    id: crypto.randomUUID(),
    name: "João Santos",
    role: "Terapeuta",
  },
  {
    id: crypto.randomUUID(),
    name: "Ana Costa",
    role: "Responsável",
  },
];

// Helpers para operações no store
export const usersStore = {
  // Buscar todos os usuários (com filtro opcional)
  getAll(searchTerm = "") {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
  },

  // Buscar por ID
  getById(id) {
    return users.find((u) => u.id === id);
  },

  // Criar novo usuário
  create(data) {
    const user = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      role: data.role,
    };
    users.push(user);
    return user;
  },

  // Atualizar usuário
  update(id, data) {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...data };
    return users[index];
  },

  // Deletar usuário
  delete(id) {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  },
};

