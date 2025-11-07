"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import BackButton from "@/app/components/BackButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function TasksPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("activity");
  const [difficulty, setDifficulty] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const r = await fetch(`${API_BASE}/tasks`, { 
        cache: "no-store",
        headers
      });
      if (!r.ok) {
        if (r.status === 401) {
          setError("Sessão expirada. Faça login novamente.");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }
        throw new Error(`Erro ao carregar: ${r.status}`);
      }
      const data = await r.json();
      setItems(Array.isArray(data.tasks) ? data.tasks : Array.isArray(data) ? data : []);
      setError(""); // Limpar erro se carregou com sucesso
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
      const isNetworkError = err.message?.includes("Failed to fetch") || 
                            err.message?.includes("ERR_CONNECTION_REFUSED") ||
                            err.message?.includes("NetworkError");
      if (isNetworkError) {
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      } else {
        setError(err.message || "Erro ao carregar tarefas");
      }
      setItems([]);
  }
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title, type, difficulty: Number(difficulty) }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Erro ao criar tarefa: ${response.status}`);
        }
        
        setTitle("");
        setType("activity");
        setDifficulty(1);
        await load();
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    } catch (err) {
      const isNetworkError = err.name === 'AbortError' || 
                            err.message?.includes("Failed to fetch") || 
                            err.message?.includes("ERR_CONNECTION_REFUSED") ||
                            err.message?.includes("NetworkError");
      if (isNetworkError) {
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      } else {
        setError(err.message || "Erro ao criar tarefa");
      }
    } finally {
      setLoading(false);
    }
  }

  async function update(id) {
    setLoading(true);
    setError("");
    try {
      const task = items.find(t => t.id === id);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ 
            title: task.title, 
            type: task.type,
            difficulty: task.difficulty,
            active: task.active !== false
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Erro ao atualizar: ${response.status}`);
        }
        
        setEditingId(null);
        await load();
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    } catch (err) {
      const isNetworkError = err.name === 'AbortError' || 
                            err.message?.includes("Failed to fetch") || 
                            err.message?.includes("ERR_CONNECTION_REFUSED") ||
                            err.message?.includes("NetworkError");
      if (isNetworkError) {
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      } else {
        setError(err.message || "Erro ao atualizar tarefa");
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id) {
    setLoading(true);
    setError("");
    try {
      const task = items.find(t => t.id === id);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ 
            title: task.title, 
            type: task.type,
            difficulty: task.difficulty,
            active: !task.active
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Erro ao atualizar: ${response.status}`);
        }
        
        await load();
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    } catch (err) {
      const isNetworkError = err.name === 'AbortError' || 
                            err.message?.includes("Failed to fetch") || 
                            err.message?.includes("ERR_CONNECTION_REFUSED") ||
                            err.message?.includes("NetworkError");
      if (isNetworkError) {
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      } else {
        setError(err.message || "Erro ao atualizar tarefa");
      }
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!confirm("Tem certeza que deseja desativar esta tarefa?")) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
          method: "DELETE",
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Erro ao desativar: ${response.status}`);
        }
        
      await load();
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    } catch (err) {
      const isNetworkError = err.name === 'AbortError' || 
                            err.message?.includes("Failed to fetch") || 
                            err.message?.includes("ERR_CONNECTION_REFUSED") ||
                            err.message?.includes("NetworkError");
      if (isNetworkError) {
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      } else {
        setError(err.message || "Erro ao desativar tarefa");
      }
    } finally {
      setLoading(false);
    }
  }

  function startEdit(id) {
    setEditingId(id);
  }

  function cancelEdit() {
    setEditingId(null);
    load();
  }

  function handleFieldChange(id, field, value) {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: field === 'difficulty' ? Number(value) : value } : item
    ));
  }

  return (
    <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.ADMIN]}>
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <BackButton href="/dashboard/terapeuta" />
          </div>

      <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">
                Gerenciar Tarefas
              </CardTitle>
              <CardDescription>
                Edição, ativação/desativação de tarefas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">Erro</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}
              
              <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                <Input 
                  placeholder="Título" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
                <Input 
                  placeholder="Tipo" 
                  value={type} 
                  onChange={(e) => setType(e.target.value)} 
                  required 
                />
                <Input 
                  type="number" 
                  min={1} 
                  max={5} 
                  placeholder="Dificuldade (1-5)" 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)} 
                  required 
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Criar Tarefa"}
                </Button>
          </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
                    <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
                    <TableHead>Dificuldade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(it => (
                    <TableRow key={it.id} className={it.active === false ? "opacity-50" : ""}>
              <TableCell>{it.id}</TableCell>
                      <TableCell>
                        {editingId === it.id ? (
                          <Input
                            value={it.title}
                            onChange={(e) => handleFieldChange(it.id, 'title', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          it.title
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === it.id ? (
                          <Input
                            value={it.type}
                            onChange={(e) => handleFieldChange(it.id, 'type', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          it.type
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === it.id ? (
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            value={it.difficulty}
                            onChange={(e) => handleFieldChange(it.id, 'difficulty', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          it.difficulty
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          it.active !== false 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {it.active !== false ? "Ativa" : "Desativada"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingId === it.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => update(it.id)}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(it.id)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleActive(it.id)}
                                disabled={loading}
                                className={it.active !== false ? "bg-red-100 hover:bg-red-200" : "bg-green-100 hover:bg-green-200"}
                              >
                                {it.active !== false ? "Desativar" : "Ativar"}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Sem tarefas ainda.
                      </TableCell>
                    </TableRow>
          )}
        </TableBody>
      </Table>
            </CardContent>
          </Card>
    </div>
      </main>
    </RoleGuard>
  );
}