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

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function SkillsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const r = await fetch(`${API}/api/skills`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!r.ok) {
          if (r.status === 401) {
            setError("Sessão expirada ou não autenticada. Faça login novamente.");
            setItems([]);
            return;
          }
          throw new Error(`Erro ao carregar: ${r.status}`);
        }

        const data = await r.json();
        setItems(Array.isArray(data) ? data : []);
        setError("");
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    } catch (err) {
      console.error("Erro ao carregar habilidades:", err);
      const isNetworkError = err.name === 'AbortError' ||
                             err.message?.includes("Failed to fetch") ||
                             err.message?.includes("ERR_CONNECTION_REFUSED") ||
                             err.message?.includes("NetworkError");
      if (isNetworkError) {
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      } else {
        setError(err.message || "Erro ao carregar habilidades");
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
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const resp = await fetch(`${API}/api/skills`, {
      method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ name, category }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (!resp.ok) throw new Error(`Erro ao criar habilidade: ${resp.status}`);
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
      setName("");
      setCategory("");
      await load();
    } catch (err) {
      const isNetworkError = err.name === 'AbortError' ||
                             err.message?.includes("Failed to fetch") ||
                             err.message?.includes("ERR_CONNECTION_REFUSED") ||
                             err.message?.includes("NetworkError");
      if (isNetworkError) setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      else setError(err.message || "Erro ao criar habilidade");
    } finally {
      setLoading(false);
    }
  }

  async function update(id) {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const skill = items.find(s => s.id === id);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const resp = await fetch(`${API}/api/skills/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ 
            name: skill.name, 
            category: skill.category,
            active: skill.active !== false
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!resp.ok) throw new Error(`Erro ao atualizar: ${resp.status}`);
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
      setEditingId(null);
      await load();
    } catch (err) {
      const isNetworkError = err.name === 'AbortError' ||
                             err.message?.includes("Failed to fetch") ||
                             err.message?.includes("ERR_CONNECTION_REFUSED") ||
                             err.message?.includes("NetworkError");
      if (isNetworkError) setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      else setError(err.message || "Erro ao atualizar habilidade");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id) {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const skill = items.find(s => s.id === id);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const resp = await fetch(`${API}/api/skills/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ 
            name: skill.name, 
            category: skill.category,
            active: !skill.active
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!resp.ok) throw new Error(`Erro ao atualizar: ${resp.status}`);
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    await load();
    } catch (err) {
      const isNetworkError = err.name === 'AbortError' ||
                             err.message?.includes("Failed to fetch") ||
                             err.message?.includes("ERR_CONNECTION_REFUSED") ||
                             err.message?.includes("NetworkError");
      if (isNetworkError) setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      else setError(err.message || "Erro ao atualizar habilidade");
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

  function handleNameChange(id, value) {
    setItems(items.map(item => 
      item.id === id ? { ...item, name: value } : item
    ));
  }

  function handleCategoryChange(id, value) {
    setItems(items.map(item => 
      item.id === id ? { ...item, category: value } : item
    ));
  }

  return (
    <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.ADMIN]}>
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link
              href="/dashboard/terapeuta"
              className="text-blue-700 hover:text-blue-900 font-semibold"
            >
              ← Voltar
            </Link>
          </div>

      <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">
                Gerenciar Habilidades
              </CardTitle>
              <CardDescription>
                Cadastre habilidades sociais trabalhadas por criança.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">Erro</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}
              <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <Input 
                  placeholder="Nome da habilidade" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
                <Input 
                  placeholder="Categoria" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Criar Habilidade"}
                </Button>
          </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
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
                            value={it.name}
                            onChange={(e) => handleNameChange(it.id, e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          it.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === it.id ? (
                          <Input
                            value={it.category || ""}
                            onChange={(e) => handleCategoryChange(it.id, e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          it.category || "-"
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
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Sem habilidades ainda.
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