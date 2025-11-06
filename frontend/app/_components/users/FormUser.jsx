"use client";

// Componente de formulário para criar/editar usuário
import { useState } from "react";

export default function FormUser({ initial = null, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [role, setRole] = useState(initial?.role || "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    if (!role) {
      newErrors.role = "Papel é obrigatório";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({ name: name.trim(), role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium mb-1"
        >
          Nome
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Digite o nome"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium mb-1"
        >
          Papel
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Selecione um papel</option>
          <option value="Professor">Professor</option>
          <option value="Terapeuta">Terapeuta</option>
          <option value="Responsável">Responsável</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 text-white"
        >
          {initial ? "Salvar" : "Criar"}
        </button>
      </div>
    </form>
  );
}

