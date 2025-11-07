"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { RoleGuard } from "@/app/components/auth/RoleGuard"
import { ROLES } from "@/app/lib/auth"
import BackButton from "@/app/components/BackButton"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api"

// Componente de ícones SVG para jogos
const GameIcon = ({ gameId, title, className = "" }) => {
  const getIcon = () => {
    const idStr = String(gameId || "").toLowerCase();
    const titleStr = String(title || "").toLowerCase();
    
    // Verificar por ID ou título
    if (idStr.includes("memory") || titleStr.includes("memória")) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className={className} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="memoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#memoryGrad)" rx="10" />
            <circle cx="60" cy="60" r="25" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="3" />
            <circle cx="140" cy="60" r="25" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="3" />
            <circle cx="60" cy="140" r="25" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="3" />
            <circle cx="140" cy="140" r="25" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="3" />
            <path d="M 60 60 Q 100 100 140 60" stroke="#1B1B1B" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 60 140 Q 100 100 140 140" stroke="#1B1B1B" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="100" r="15" fill="#FF8C00" stroke="#1B1B1B" strokeWidth="2" />
          </svg>
        );
    }
    
    if (idStr.includes("puzzle") || titleStr.includes("quebra") || titleStr.includes("puzzle")) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className={className} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="puzzleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4169E1" />
                <stop offset="100%" stopColor="#1E90FF" />
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#puzzleGrad)" rx="10" />
            <path d="M 40 40 L 100 40 L 100 70 L 130 70 L 130 40 L 160 40 L 160 100 L 130 100 L 130 130 L 100 130 L 100 160 L 40 160 Z" 
                  fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="4" />
            <path d="M 100 40 L 100 70 M 130 70 L 130 100 M 100 130 L 100 160" 
                  stroke="#1B1B1B" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );
    }
    
    if (idStr.includes("emotion") || titleStr.includes("emoção") || titleStr.includes("emotion")) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className={className} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="emotionsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#emotionsGrad)" rx="10" />
            <circle cx="100" cy="100" r="70" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="4" />
            <circle cx="80" cy="90" r="10" fill="#1B1B1B" />
            <circle cx="120" cy="90" r="10" fill="#1B1B1B" />
            <path d="M 70 130 Q 100 150 130 130" stroke="#1B1B1B" strokeWidth="6" fill="none" strokeLinecap="round" />
          </svg>
        );
    }
    
    if (idStr.includes("color") || idStr.includes("shape") || titleStr.includes("cor") || titleStr.includes("forma")) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className={className} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="colorsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9370DB" />
                <stop offset="100%" stopColor="#BA55D3" />
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#colorsGrad)" rx="10" />
            <ellipse cx="100" cy="100" rx="60" ry="50" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="4" />
            <circle cx="84" cy="90" r="12" fill="#FF0000" stroke="#1B1B1B" strokeWidth="2" />
            <circle cx="116" cy="90" r="12" fill="#00FF00" stroke="#1B1B1B" strokeWidth="2" />
            <circle cx="100" cy="100" r="12" fill="#0000FF" stroke="#1B1B1B" strokeWidth="2" />
            <circle cx="84" cy="110" r="12" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2" />
            <circle cx="116" cy="110" r="12" fill="#FF69B4" stroke="#1B1B1B" strokeWidth="2" />
            <rect x="50" y="60" width="16" height="80" rx="8" fill="#FF8C00" stroke="#1B1B1B" strokeWidth="3" />
          </svg>
        );
    }
    
    if (idStr.includes("sequence") || titleStr.includes("sequência")) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className={className} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="sequencesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#32CD32" />
                <stop offset="100%" stopColor="#228B22" />
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#sequencesGrad)" rx="10" />
            <circle cx="50" cy="100" r="30" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="4" />
            <text x="50" y="110" textAnchor="middle" fontSize="36" fill="#1B1B1B" fontWeight="bold">1</text>
            <circle cx="100" cy="100" r="30" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="4" />
            <text x="100" y="110" textAnchor="middle" fontSize="36" fill="#1B1B1B" fontWeight="bold">2</text>
            <circle cx="150" cy="100" r="30" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="4" />
            <text x="150" y="110" textAnchor="middle" fontSize="36" fill="#1B1B1B" fontWeight="bold">3</text>
            <path d="M 80 100 L 120 100" stroke="#1B1B1B" strokeWidth="6" strokeLinecap="round" />
            <path d="M 130 100 L 170 100" stroke="#1B1B1B" strokeWidth="6" strokeLinecap="round" />
          </svg>
        );
    }
    
    if (idStr.includes("association") || idStr.includes("associat") || titleStr.includes("associação")) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 200 200" className={className} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="associationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF69B4" />
                <stop offset="100%" stopColor="#FF1493" />
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#associationGrad)" rx="10" />
            <circle cx="60" cy="100" r="36" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="4" />
            <circle cx="140" cy="100" r="36" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="4" />
            <path d="M 96 100 L 104 100" stroke="#4169E1" strokeWidth="10" strokeLinecap="round" />
            <path d="M 100 92 L 104 100 L 100 108" stroke="#4169E1" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 104 92 L 104 100 L 104 108" stroke="#4169E1" strokeWidth="10" fill="none" strokeLinecap="round" />
          </svg>
        );
    }
    
    // Ícone padrão
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" className={className} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#4682B4" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#defaultGrad)" rx="10" />
        <rect x="50" y="50" width="100" height="100" rx="10" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="4" />
        <circle cx="100" cy="100" r="30" fill="#87CEEB" stroke="#1B1B1B" strokeWidth="3" />
        <text x="100" y="110" textAnchor="middle" fontSize="40" fill="#1B1B1B" fontWeight="bold">?</text>
      </svg>
    );
  };

  return (
    <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      {getIcon()}
    </div>
  );
};

export default function Games() {
  const router = useRouter()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      const token = localStorage.getItem("token")
      
      // Criar AbortController para timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos
      
      try {
        const headers = {
          "Authorization": `Bearer ${token}`
        };
        
        // Enviar user no header quando usar demo-token
        if (token === "demo-token") {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          headers["X-Demo-User"] = JSON.stringify(user);
        }
        
        const response = await fetch(`${API_BASE}/games`, {
          headers,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Erro ao carregar jogos: ${response.status}`)
        }

        const data = await response.json()
        const gamesList = data.games || data || []
        
        // Se não houver jogos, usar lista padrão
        if (Array.isArray(gamesList) && gamesList.length === 0) {
          setGames([
            {
              id: "memory",
              title: "Jogo da Memória",
              description: "Encontre os pares iguais para desenvolver a memória.",
              level: "Iniciante",
              is_active: true,
              image_url: null
            },
            {
              id: "puzzle",
              title: "Quebra-Cabeça",
              description: "Monte as peças para formar imagens completas.",
              level: "Iniciante",
              is_active: true,
              image_url: null
            },
            {
              id: "emotions",
              title: "Reconhecimento de Emoções",
              description: "Aprenda a identificar diferentes expressões faciais e emoções.",
              level: "Iniciante",
              is_active: true,
              image_url: null
            },
            {
              id: "colors-shapes",
              title: "Cores e Formas",
              description: "Combine cores e formas para desenvolver habilidades visuais.",
              level: "Iniciante",
              is_active: true,
              image_url: null
            },
            {
              id: "sequences",
              title: "Sequências",
              description: "Complete sequências numéricas e lógicas.",
              level: "Intermediário",
              is_active: true,
              image_url: null
            },
            {
              id: "association",
              title: "Associação",
              description: "Ligue objetos relacionados para desenvolver raciocínio.",
              level: "Iniciante",
              is_active: true,
              image_url: null
            }
          ])
        } else {
          setGames(gamesList)
        }
        setError("") // Limpar erro se carregou com sucesso
        return
      } catch (fetchErr) {
        clearTimeout(timeoutId)
        throw fetchErr
      }
    } catch (err) {
      // Tratar erros de forma silenciosa em desenvolvimento
      const isNetworkError = err.name === 'AbortError' || 
                            err.message?.includes("Failed to fetch") || 
                            err.message?.includes("ERR_CONNECTION_REFUSED") || 
                            err.message?.includes("NetworkError")
      
      if (isNetworkError) {
        // Log silencioso em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log("Backend não disponível, usando dados de demonstração")
        }
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3001")
      } else {
        console.error("Erro ao carregar jogos:", err)
        setError(err.message || "Erro ao carregar jogos")
      }
      
      // Sempre mostrar jogos mock em caso de erro de rede
      setGames([
        {
          id: "memory",
          title: "Jogo da Memória",
          description: "Encontre os pares iguais para desenvolver a memória.",
          level: "Iniciante",
          is_active: true,
          image_url: null
        },
        {
          id: "puzzle",
          title: "Quebra-Cabeça",
          description: "Monte as peças para formar imagens completas.",
          level: "Iniciante",
          is_active: true,
          image_url: null
        },
        {
          id: "emotions",
          title: "Reconhecimento de Emoções",
          description: "Aprenda a identificar diferentes expressões faciais e emoções.",
          level: "Iniciante",
          is_active: true,
          image_url: null
        },
        {
          id: "colors-shapes",
          title: "Cores e Formas",
          description: "Combine cores e formas para desenvolver habilidades visuais.",
          level: "Iniciante",
          is_active: true,
          image_url: null
        },
        {
          id: "sequences",
          title: "Sequências",
          description: "Complete sequências numéricas e lógicas.",
          level: "Intermediário",
          is_active: true,
          image_url: null
        },
        {
          id: "association",
          title: "Associação",
          description: "Ligue objetos relacionados para desenvolver raciocínio.",
          level: "Iniciante",
          is_active: true,
          image_url: null
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleGameStatus = async (gameId, currentStatus) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE}/games/${gameId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar status do jogo")
      }

      await loadGames()
    } catch (err) {
      alert("Erro: " + err.message)
    }
  }

  const userRole = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.role : null
  const canManage = userRole === ROLES.ADMIN || userRole === ROLES.TERAPEUTA || userRole === ROLES.PROFESSOR

  return (
    <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.ADMIN, ROLES.RESPONSAVEL]}>
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <MainNav />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1 space-y-4 p-8 pt-6">
          <BackButton href="/dashboard/terapeuta" />
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Jogos Educativos</h2>
            {canManage && (
              <div className="flex items-center space-x-2">
                <Button variant="outline">Filtrar por Nível</Button>
                <Button variant="outline">Filtrar por Habilidade</Button>
                <Button onClick={() => router.push("/games/create")} className="bg-blue-600 hover:bg-blue-700 text-white">
                  + Cadastrar Jogo
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">Erro ao carregar jogos</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-xs mt-2 text-red-600">
                Dica: Se o backend não estiver rodando, você pode usar os jogos de demonstração abaixo.
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Carregando jogos...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {games
                .filter(game => game.is_active !== false) // Mostrar apenas jogos ativos por padrão
                .map((game) => (
                <Card key={game.id} className={`overflow-hidden ${game.is_active === false ? 'opacity-50' : ''}`}>
                  {game.image_url ? (
                    <img src={game.image_url} alt={game.title} className="w-full h-48 object-cover" />
                  ) : (
                    <GameIcon gameId={game.id || game.slug || ""} title={game.title || ""} />
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{game.title}</CardTitle>
                      <div className="flex gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{game.level}</span>
                        {game.is_active === false && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Desativado</span>
                        )}
                      </div>
                    </div>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-col gap-2">
                    <Link href={`/games/${game.id || game.slug}`} className="w-full">
                      <Button className="w-full">Jogar</Button>
                    </Link>
                    {canManage && (
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/games/${game.id}/edit`)}
                          className="flex-1"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => toggleGameStatus(game.id, game.is_active)}
                          className={`flex-1 ${game.is_active === false ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}
                        >
                          {game.is_active === false ? 'Ativar' : 'Desativar'}
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
              {games.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhum jogo cadastrado ainda.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  )
}