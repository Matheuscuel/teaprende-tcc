"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import BackButton from "@/app/components/BackButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function ChildrenListPage() {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const url = `${API_BASE}/children`;
        console.log("Fazendo requisição para:", url); // Debug
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            // Enviar user no header quando usar demo-token para o backend saber o role
            ...(token === "demo-token" ? {
              "X-Demo-User": JSON.stringify(JSON.parse(localStorage.getItem("user") || "{}"))
            } : {})
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // 401: sessão inválida/expirada → verifica se realmente precisa fazer login
          if (response.status === 401) {
            // Verificar se há token e role no localStorage antes de redirecionar
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");
            console.log("401 recebido. Token existe?", !!storedToken, "User:", storedUser);
            
            // Se não tem token ou user, realmente precisa fazer login
            if (!storedToken || !storedUser) {
              setError("Sessão expirada ou não autenticada. Faça login novamente.");
              setTimeout(() => router.push("/login"), 300);
              return;
            }
            
            // Se tem token mas API retornou 401, pode ser token inválido ou expirado
            setError("Token inválido ou expirado. Faça login novamente.");
            setTimeout(() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }, 2000);
            return;
          }
          // 404: rota não encontrada (backend pode não estar rodando ou rota incorreta)
          if (response.status === 404) {
            throw new Error("Rota não encontrada. Verifique se o backend está rodando e se a rota /api/children existe.");
          }
          throw new Error(`Erro ao carregar crianças: ${response.status}`);
        }

        const data = await response.json();
        setChildren(data.children || data || []);
        setError(""); // Limpar erro se carregou com sucesso
        return;
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    } catch (err) {
      // Tratar erros de forma silenciosa em desenvolvimento
      const isNetworkError = err.name === 'AbortError' || 
                            err.message?.includes("Failed to fetch") || 
                            err.message?.includes("ERR_CONNECTION_REFUSED") || 
                            err.message?.includes("NetworkError");
      
      if (isNetworkError) {
        // Log silencioso em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log("Backend não disponível, não é possível listar crianças sem o servidor")
        }
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3001")
      } else {
        console.error("Erro ao carregar crianças:", err)
        setError(err.message || "Erro ao carregar crianças")
      }
      
      setChildren([]); // Garantir que a lista está vazia em caso de erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.ADMIN]}>
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <BackButton href="/dashboard/terapeuta" />
            <Button
              onClick={() => router.push("/children/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Cadastrar Nova Criança
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">
                Lista de Crianças
              </CardTitle>
              <CardDescription>
                Gerencie as crianças cadastradas no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p className="font-semibold">Erro ao carregar crianças</p>
                  <p className="text-sm mt-1">{error}</p>
                  <p className="text-xs mt-2 text-red-600">
                    Para gerenciar crianças, é necessário que o backend esteja rodando.
                  </p>
                </div>
              ) : children.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma criança cadastrada ainda.
                  <div className="mt-4">
                    <Button
                      onClick={() => router.push("/children/create")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Cadastrar Primeira Criança
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Gênero</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {children.map((child) => (
                      <TableRow key={child.id}>
                        <TableCell className="font-medium">{child.name || 'Sem nome'}</TableCell>
                        <TableCell>{child.age ? `${child.age} anos` : '-'}</TableCell>
                        <TableCell>{child.gender || '-'}</TableCell>
                        <TableCell>
                          <Link href={`/children/${child.id}`}>
                            <Button variant="outline" size="sm">
                              Ver Perfil
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGuard>
  );
}
