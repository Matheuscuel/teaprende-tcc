"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import BackButton from "@/app/components/BackButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function ChildProfilePage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id;
  const [child, setChild] = useState(null);
  const [progress, setProgress] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadChildData = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Carregar dados da criança
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      // Enviar user no header quando usar demo-token
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const childResponse = await fetch(`${API_BASE}/children/${childId}`, {
        headers
      });

      if (!childResponse.ok) {
        if (childResponse.status === 401) {
          setError("Sessão expirada ou não autenticada. Faça login novamente.");
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }, 2000);
          return;
        }
        if (childResponse.status === 403) {
          setError("Você não tem permissão para acessar esta criança.");
          return;
        }
        if (childResponse.status === 404) {
          setError("Criança não encontrada.");
          return;
        }
        const errorData = await childResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao carregar dados da criança");
      }

      const childData = await childResponse.json();
      setChild(childData.child || childData);
      setProgress(childData.averageProgress || childData.progress || 0);

      // Carregar jogos atribuídos (se houver endpoint)
      try {
        const gamesResponse = await fetch(`${API_BASE}/children/${childId}/games`, {
          headers
        });
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          setGames(gamesData.games || gamesData || []);
        }
      } catch (e) {
        console.log("Erro ao carregar jogos:", e);
      }
    } catch (err) {
      console.error("Erro ao carregar dados da criança:", err);
      setError(err.message || "Erro ao carregar dados da criança");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta criança? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const response = await fetch(`${API_BASE}/children/${childId}`, {
        method: "DELETE",
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao excluir criança");
      }
      
      router.push("/children");
    } catch (err) {
      console.error("Erro ao excluir criança:", err);
      alert(err.message || "Erro ao excluir criança");
    }
  };

  useEffect(() => {
    if (childId) {
      loadChildData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  if (loading) {
    return (
      <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.RESPONSAVEL, ROLES.ADMIN]}>
        <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-8 flex items-center justify-center">
          <div className="text-xl font-semibold text-gray-700">Carregando...</div>
        </main>
      </RoleGuard>
    );
  }

  if (error || !child) {
    return (
      <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.RESPONSAVEL, ROLES.ADMIN]}>
        <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <BackButton href="/children" />
            </div>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || "Criança não encontrada"}
            </div>
            <Link href="/children">
              <Button className="mt-4">Voltar para Lista</Button>
            </Link>
          </div>
        </main>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.RESPONSAVEL, ROLES.ADMIN]}>
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <BackButton href="/children" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">
                  {child.name}
                </CardTitle>
                <CardDescription>
                  Perfil da Criança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Informações Básicas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Idade</p>
                        <p className="font-medium">{child.age ? `${child.age} anos` : '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gênero</p>
                        <p className="font-medium">{child.gender || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {child.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Observações</h3>
                      <p className="text-gray-600">{child.notes}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Progresso Médio</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full"
                          style={{ width: `${progress || 0}%` }}
                        />
                      </div>
                      <span className="font-semibold text-blue-600">{progress || 0}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => router.push(`/children/${childId}/assign-games`)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Atribuir Jogos
                </Button>
                <Button
                  onClick={() => router.push(`/reports?childId=${childId}`)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Ver Relatórios
                </Button>
                <Button
                  onClick={() => router.push(`/skills?childId=${childId}`)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Ver Habilidades
                </Button>
                <Button
                  onClick={() => router.push(`/kid?childId=${childId}`)}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                >
                  👶 Acessar Modo Criança
                </Button>
                <Button
                  onClick={() => router.push(`/children/${childId}/edit`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Editar Criança
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir Criança
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico e Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="games" className="w-full">
                <TabsList>
                  <TabsTrigger value="games">Jogos Atribuídos</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
                <TabsContent value="games">
                  {games.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum jogo atribuído ainda.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {games.map((game) => (
                        <Card key={game.id}>
                          <CardContent className="pt-4">
                            <h4 className="font-semibold">{game.title || game.game_title}</h4>
                            <p className="text-sm text-gray-500">{game.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="history">
                  <div className="text-center py-8 text-gray-500">
                    Histórico de atividades será exibido aqui.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGuard>
  );
}
