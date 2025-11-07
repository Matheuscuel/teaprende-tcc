"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import BackButton from "@/app/components/BackButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function AssignGamesPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id;
  const [child, setChild] = useState(null);
  const [allGames, setAllGames] = useState([]);
  const [assignedGames, setAssignedGames] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (childId) {
      loadData();
    }
  }, [childId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Headers com autenticação
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      // Adicionar header X-Demo-User quando usar demo-token
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }

      // Carregar dados da criança
      try {
        const childResponse = await fetch(`${API_BASE}/children/${childId}`, {
          headers
        });

        if (childResponse.ok) {
          const childData = await childResponse.json();
          setChild(childData.child || childData);
        }
      } catch (e) {
        console.log("Erro ao carregar dados da criança:", e);
      }

      // Carregar todos os jogos
      let gamesLoaded = false;
      try {
        console.log("Tentando carregar jogos do backend...");
        console.log("URL:", `${API_BASE}/games`);
        console.log("Headers:", headers);
        
        const gamesResponse = await fetch(`${API_BASE}/games`, {
          headers
        });

        console.log("Resposta do backend:", gamesResponse.status, gamesResponse.statusText);

        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          console.log("Dados recebidos do backend (raw):", gamesData);
          
          // Tentar diferentes formatos de resposta
          let games = [];
          if (Array.isArray(gamesData)) {
            games = gamesData;
          } else if (gamesData.games && Array.isArray(gamesData.games)) {
            games = gamesData.games;
          } else if (gamesData.data && Array.isArray(gamesData.data)) {
            games = gamesData.data;
          } else {
            games = [];
          }
          
          console.log("Jogos processados:", games);
          console.log("Quantidade de jogos:", games.length);
          
          // Mostrar TODOS os jogos, independente de is_active
          // O filtro será feito apenas se necessário
          if (games.length > 0) {
            // Filtrar apenas jogos ativos (se a propriedade existir)
            const activeGames = games.filter(g => {
              // Se não tiver propriedade is_active, incluir o jogo
              if (g.is_active === undefined && g.active === undefined) {
                return true;
              }
              // Se tiver is_active ou active, verificar se está ativo
              return g.is_active !== false && g.active !== false;
            });
            
            console.log("Jogos ativos após filtro:", activeGames.length);
            
            // Se houver jogos ativos, usar eles; senão, mostrar todos
            if (activeGames.length > 0) {
              setAllGames(activeGames);
            } else {
              // Mostrar todos os jogos mesmo que não tenham is_active definido
              console.warn("Nenhum jogo marcado como ativo, mas mostrando todos os jogos disponíveis");
              setAllGames(games);
            }
            gamesLoaded = true;
            console.log("✅ Jogos carregados com sucesso!");
          } else {
            console.warn("⚠️ Backend retornou array vazio - nenhum jogo encontrado no banco");
            setError("Nenhum jogo encontrado no sistema. Verifique se o backend está rodando e se os jogos foram criados.");
          }
        } else {
          const errorText = await gamesResponse.text().catch(() => "");
          console.error("❌ Erro ao carregar jogos:", gamesResponse.status, gamesResponse.statusText);
          console.error("Detalhes do erro:", errorText);
          
          if (gamesResponse.status === 401) {
            setError("Não autenticado. Faça login novamente.");
          } else if (gamesResponse.status === 403) {
            setError("Acesso negado. Verifique suas permissões.");
          } else {
            setError(`Erro ao carregar jogos: ${gamesResponse.status} ${gamesResponse.statusText}`);
          }
        }
      } catch (e) {
        console.error("❌ Exceção ao carregar jogos:", e);
        setError(`Erro de conexão: ${e.message}. Verifique se o backend está rodando em ${API_BASE}`);
      }

      // Se não carregou jogos do backend, deixar vazio para mostrar mensagem
      if (!gamesLoaded) {
        console.warn("⚠️ Nenhum jogo foi carregado do backend");
        setAllGames([]);
      }

      // Carregar jogos já atribuídos
      try {
        const assignedResponse = await fetch(`${API_BASE}/children/${childId}/games`, {
          headers
        });
        if (assignedResponse.ok) {
          const assignedData = await assignedResponse.json();
          const assigned = assignedData.games || assignedData || [];
          setAssignedGames(new Set(assigned.map(g => g.id || g.game_id)));
        }
      } catch (e) {
        console.log("Erro ao carregar jogos atribuídos:", e);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError(err.message || "Erro ao carregar dados. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const toggleGame = (gameId) => {
    setAssignedGames(prev => {
      const next = new Set(prev);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

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
      
      // Converter IDs para números - apenas IDs numéricos válidos do banco
      const gameIdsToSend = Array.from(assignedGames)
        .map(id => {
          // Se for string numérica, converter para número
          if (typeof id === 'string' && !isNaN(id) && id.trim() !== '') {
            const numId = Number(id);
            if (!isNaN(numId) && numId > 0) {
              return numId;
            }
          }
          // Se já for número válido, manter
          if (typeof id === 'number' && !isNaN(id) && id > 0) {
            return id;
          }
          // Ignorar valores inválidos (strings não numéricas)
          console.warn("ID de jogo inválido ignorado:", id, typeof id);
          return null;
        })
        .filter(id => id !== null && id !== undefined && !isNaN(id) && id > 0);
      
      // Se não houver IDs válidos, mostrar erro
      if (gameIdsToSend.length === 0 && assignedGames.size > 0) {
        throw new Error("Nenhum ID de jogo válido encontrado. Os jogos precisam estar cadastrados no banco de dados com IDs numéricos.");
      }
      
      if (gameIdsToSend.length === 0) {
        throw new Error("Selecione pelo menos um jogo para atribuir.");
      }
      
      console.log("Enviando gameIds:", gameIdsToSend);
      
      const response = await fetch(`${API_BASE}/children/${childId}/games`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          gameIds: gameIdsToSend
        }),
      });

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: `;
        try {
          const errorData = await response.json();
          errorMessage += errorData.message || errorData.error || "Erro ao atribuir jogos";
          console.error("Detalhes do erro:", errorData);
        } catch (e) {
          errorMessage += response.statusText || "Erro ao atribuir jogos";
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Jogos atribuídos com sucesso:", result);
      
      router.push(`/children/${childId}`);
    } catch (err) {
      console.error("Erro completo ao salvar atribuições:", err);
      setError(err.message || "Erro ao atribuir jogos. Verifique se o backend está rodando e se os jogos estão cadastrados.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.ADMIN]}>
        <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-8 flex items-center justify-center">
          <div className="text-xl font-semibold text-gray-700">Carregando...</div>
        </main>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.ADMIN]}>
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton href={`/children/${childId}`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">
                Atribuir Jogos
              </CardTitle>
              <CardDescription>
                Associe jogos a {child?.name || "a criança"} com data e descrição.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">⚠️ Erro ao carregar jogos</p>
                  <p className="text-sm mt-1">{error}</p>
                  <div className="text-xs mt-2 text-red-600">
                    <p className="mb-1">Verifique:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Se o backend está rodando (verifique o terminal)</li>
                      <li>Se os jogos foram criados no banco de dados</li>
                      <li>Se você está autenticado corretamente</li>
                      <li>Abra o console do navegador (F12) para ver logs detalhados</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {allGames.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4 text-lg font-semibold">Nenhum jogo disponível no sistema.</p>
                    <p className="mb-4 text-sm">
                      Para atribuir jogos a esta criança, é necessário cadastrá-los primeiro através da página de gerenciamento de jogos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <Link 
                        href="/games" 
                        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                      >
                        Ir para Gerenciamento de Jogos
                      </Link>
                      <Button
                        onClick={() => {
                          setLoading(true);
                          setError("");
                          loadData();
                        }}
                        variant="outline"
                        className="px-6 py-3"
                        disabled={loading}
                      >
                        {loading ? "Carregando..." : "🔄 Recarregar Jogos"}
                      </Button>
                    </div>
                    <div className="mt-4 text-xs text-gray-400 space-y-1">
                      <p><strong>Dica:</strong> Verifique se:</p>
                      <ul className="list-disc list-inside text-left max-w-md mx-auto space-y-1">
                        <li>O backend está rodando (verifique o terminal onde você iniciou o servidor)</li>
                        <li>Os jogos foram criados automaticamente quando o backend iniciou</li>
                        <li>Você está autenticado corretamente</li>
                        <li>Abra o console do navegador (F12) para ver logs detalhados</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  allGames.map((game) => {
                    // Garantir que o ID seja tratado corretamente
                    const gameId = game.id || game.game_id;
                    const isAssigned = assignedGames.has(gameId) || assignedGames.has(String(gameId)) || assignedGames.has(Number(gameId));
                    
                    return (
                      <label
                        key={gameId}
                        className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => toggleGame(gameId)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{game.title || game.name}</h4>
                          <p className="text-sm text-gray-600">{game.description || "Jogo educativo"}</p>
                          <div className="flex gap-2 mt-2">
                            {game.level && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {game.level}
                              </span>
                            )}
                            {game.category && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {game.category}
                              </span>
                            )}
                            {game.id && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                ID: {game.id}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? "Salvando..." : "Salvar Atribuições"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGuard>
  );
}
