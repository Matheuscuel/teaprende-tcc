"use client";

// Componente de formulário para criar/editar usuário
import { useState, useEffect } from "react";

export default function FormUser({ initial = null, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initial?.role || "");
  const [errors, setErrors] = useState({});

  // Atualizar campos quando initial mudar
  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setEmail(initial.email || "");
      setRole(initial.role || "");
      setPassword(""); // Sempre limpar senha ao editar
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
    }
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido";
    }
    if (!initial && !password.trim()) {
      newErrors.password = "Senha é obrigatória";
    }
    if (!role) {
      newErrors.role = "Papel é obrigatório";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const formData = { 
      name: name.trim(), 
      email: email.trim().toLowerCase(),
      role 
    };
    
    // Só incluir senha se estiver preenchida ou se for criação
    if (password.trim() || !initial) {
      formData.password = password.trim();
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Nome
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Digite o nome"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="usuario@exemplo.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Senha {initial && "(deixe em branco para não alterar)"}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={initial ? "Nova senha (opcional)" : "Digite a senha"}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Papel
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Selecione um papel</option>
          <option value="Professor">Professor</option>
          <option value="Terapeuta">Terapeuta</option>
          <option value="Responsável">Responsável</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-destructive">{errors.role}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {initial ? "Salvar" : "Criar"}
        </button>
      </div>
    </form>
  );
}

