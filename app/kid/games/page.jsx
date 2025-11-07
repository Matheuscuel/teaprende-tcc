"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

// Componentes de ícones SVG melhorados
const GameIcons = {
  memory: (
    <svg width="64" height="64" viewBox="0 0 100 100" className="mx-auto">
      <circle cx="30" cy="30" r="12" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <circle cx="70" cy="30" r="12" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <circle cx="30" cy="70" r="12" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <circle cx="70" cy="70" r="12" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <path d="M 30 30 Q 50 50 70 30" stroke="#1B1B1B" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 30 70 Q 50 50 70 70" stroke="#1B1B1B" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="50" r="8" fill="#FF8C00" stroke="#1B1B1B" strokeWidth="2" />
    </svg>
  ),
  puzzle: (
    <svg width="64" height="64" viewBox="0 0 100 100" className="mx-auto">
      <path d="M 20 20 L 50 20 L 50 35 L 65 35 L 65 20 L 80 20 L 80 50 L 65 50 L 65 65 L 50 65 L 50 80 L 20 80 Z" 
            fill="#4169E1" stroke="#1B1B1B" strokeWidth="2.5" />
      <path d="M 50 20 L 50 35 M 65 35 L 65 50 M 50 65 L 50 80" 
            stroke="#1B1B1B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  emotions: (
    <svg width="64" height="64" viewBox="0 0 100 100" className="mx-auto">
      <circle cx="50" cy="50" r="35" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <circle cx="40" cy="45" r="5" fill="#1B1B1B" />
      <circle cx="60" cy="45" r="5" fill="#1B1B1B" />
      <path d="M 35 65 Q 50 75 65 65" stroke="#1B1B1B" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  ),
  colors: (
    <svg width="64" height="64" viewBox="0 0 100 100" className="mx-auto">
      <ellipse cx="50" cy="50" rx="30" ry="25" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="2.5" />
      <circle cx="42" cy="45" r="6" fill="#FF0000" stroke="#1B1B1B" strokeWidth="1.5" />
      <circle cx="58" cy="45" r="6" fill="#00FF00" stroke="#1B1B1B" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="6" fill="#0000FF" stroke="#1B1B1B" strokeWidth="1.5" />
      <circle cx="42" cy="55" r="6" fill="#FFD700" stroke="#1B1B1B" strokeWidth="1.5" />
      <circle cx="58" cy="55" r="6" fill="#FF69B4" stroke="#1B1B1B" strokeWidth="1.5" />
      <rect x="25" y="30" width="8" height="40" rx="4" fill="#FF8C00" stroke="#1B1B1B" strokeWidth="2" />
    </svg>
  ),
  sequences: (
    <svg width="64" height="64" viewBox="0 0 100 100" className="mx-auto">
      <circle cx="25" cy="50" r="15" fill="#32CD32" stroke="#1B1B1B" strokeWidth="2.5" />
      <text x="25" y="56" textAnchor="middle" fontSize="18" fill="#1B1B1B" fontWeight="bold">1</text>
      <circle cx="50" cy="50" r="15" fill="#32CD32" stroke="#1B1B1B" strokeWidth="2.5" />
      <text x="50" y="56" textAnchor="middle" fontSize="18" fill="#1B1B1B" fontWeight="bold">2</text>
      <circle cx="75" cy="50" r="15" fill="#32CD32" stroke="#1B1B1B" strokeWidth="2.5" />
      <text x="75" y="56" textAnchor="middle" fontSize="18" fill="#1B1B1B" fontWeight="bold">3</text>
      <path d="M 40 50 L 60 50" stroke="#1B1B1B" strokeWidth="4" strokeLinecap="round" />
      <path d="M 65 50 L 85 50" stroke="#1B1B1B" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  association: (
    <svg width="64" height="64" viewBox="0 0 100 100" className="mx-auto">
      <circle cx="30" cy="50" r="18" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <circle cx="70" cy="50" r="18" fill="#FF69B4" stroke="#1B1B1B" strokeWidth="2.5" />
      <path d="M 48 50 L 52 50" stroke="#4169E1" strokeWidth="6" strokeLinecap="round" />
      <path d="M 50 46 L 52 50 L 50 54" stroke="#4169E1" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 52 46 L 52 50 L 52 54" stroke="#4169E1" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  )
};

// Mapeamento de slugs/títulos para ícones e rotas
const getGameConfig = (game) => {
  const slug = (game.slug || "").toLowerCase();
  const title = (game.title || "").toLowerCase();
  
  // Mapear por slug primeiro
  if (slug.includes("memory") || slug === "memory") {
    return {
      icon: GameIcons.memory,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      route: "memory"
    };
  }
  if (slug.includes("puzzle") || slug === "puzzle") {
    return {
      icon: GameIcons.puzzle,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      route: "puzzle"
    };
  }
  if (slug.includes("emotion") || slug === "emotions") {
    return {
      icon: GameIcons.emotions,
      color: "bg-yellow-500",
      hoverColor: "hover:bg-yellow-600",
      route: "emotions"
    };
  }
  if (slug.includes("color") || slug.includes("shape") || slug === "colors-shapes") {
    return {
      icon: GameIcons.colors,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      route: "colors-shapes"
    };
  }
  if (slug.includes("sequence") || slug === "sequences") {
    return {
      icon: GameIcons.sequences,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      route: "sequences"
    };
  }
  if (slug.includes("association") || slug === "association") {
    return {
      icon: GameIcons.association,
      color: "bg-pink-500",
      hoverColor: "hover:bg-pink-600",
      route: "association"
    };
  }
  
  // Mapear por título se slug não funcionar
  if (title.includes("memória") || title.includes("memory")) {
    return {
      icon: GameIcons.memory,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      route: "memory"
    };
  }
  if (title.includes("quebra") || title.includes("puzzle")) {
    return {
      icon: GameIcons.puzzle,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      route: "puzzle"
    };
  }
  if (title.includes("emoção") || title.includes("emotion")) {
    return {
      icon: GameIcons.emotions,
      color: "bg-yellow-500",
      hoverColor: "hover:bg-yellow-600",
      route: "emotions"
    };
  }
  if (title.includes("cor") || title.includes("forma") || title.includes("color") || title.includes("shape")) {
    return {
      icon: GameIcons.colors,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      route: "colors-shapes"
    };
  }
  if (title.includes("sequência") || title.includes("sequence")) {
    return {
      icon: GameIcons.sequences,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      route: "sequences"
    };
  }
  if (title.includes("associação") || title.includes("association")) {
    return {
      icon: GameIcons.association,
      color: "bg-pink-500",
      hoverColor: "hover:bg-pink-600",
      route: "association"
    };
  }
  
  // Default
  return {
    icon: GameIcons.memory,
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
    route: "memory"
  };
};

export default function KidGamesPage() {
  const searchParams = useSearchParams();
  const childId = Number(searchParams?.get("childId") || 1);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAssignedGames();
  }, [childId]);

  const loadAssignedGames = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }

      const response = await fetch(`${API_BASE}/children/${childId}/games`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Não autenticado. Faça login novamente.");
        } else if (response.status === 403) {
          setError("Acesso negado. Verifique suas permissões.");
        } else {
          setError(`Erro ao carregar jogos: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      const assignedGames = data.games || data || [];
      
      // Mapear jogos atribuídos para o formato esperado
      const mappedGames = assignedGames.map(game => {
        const config = getGameConfig(game);
        return {
          id: game.id,
          title: game.title || "Jogo",
          icon: config.icon,
          color: config.color,
          hoverColor: config.hoverColor,
          description: game.description || "Jogo educativo",
          link: `/games/${config.route}?childId=${childId}`
        };
      });
      
      setGames(mappedGames);
    } catch (err) {
      console.error("Erro ao carregar jogos atribuídos:", err);
      setError(`Erro de conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center py-4 md:py-6">
      <div className="max-w-[1280px] w-full mx-auto px-6 md:px-10">
        
        {/* Botão Voltar */}
        <div className="mb-4">
          <BackButton href={`/kid?childId=${childId}`} />
        </div>
        
        {/* Header */}
        <header className="text-center mb-6 md:mb-8">
          <div className="flex justify-center items-center gap-3 md:gap-4 mb-3">
            <div className="w-14 h-14 md:w-16 md:h-16">
              <Penguin size={160} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
              Jogos 🎮
            </h1>
          </div>
          <p className="text-base md:text-lg text-blue-700 font-semibold">
            Escolha um jogo para jogar!
          </p>
        </header>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Erro ao carregar jogos</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Carregando jogos...</p>
          </div>
        )}

        {/* Grid de Jogos - Responsivo */}
        {!loading && games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-xl text-gray-700 font-semibold mb-2">
              Nenhum jogo atribuído ainda
            </p>
            <p className="text-gray-600 mb-6">
              Esta criança ainda não tem jogos atribuídos. Atribua jogos através do perfil da criança.
            </p>
            <Link
              href={`/children/${childId}/assign-games`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-250 transform hover:scale-105"
            >
              Atribuir Jogos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.link}
                className={`${game.color} ${game.hoverColor} rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-250 transform hover:-translate-y-1 flex flex-col items-center justify-between aspect-[4/3] group`}
              >
                {/* Ícone */}
                <div className="mb-3 md:mb-4 flex items-center justify-center flex-1 min-h-[64px]">
                  <div className="transform group-hover:scale-110 transition-transform duration-250">
                    {game.icon}
                  </div>
                </div>
                
                {/* Título */}
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2 text-center leading-tight">
                  {game.title}
                </h2>
                
                {/* Descrição */}
                <p className="text-white/90 text-sm md:text-base font-medium mb-4 text-center">
                  {game.description}
                </p>
                
                {/* Botão Iniciar */}
                <button className="w-full bg-white/90 hover:bg-white text-gray-800 font-bold py-2.5 md:py-3 px-4 rounded-xl shadow-md transition-all duration-250 transform group-hover:scale-105 text-sm md:text-base">
                  Iniciar
                </button>
              </Link>
            ))}
          </div>
        )}

        {/* Mensagem motivacional - só aparece se houver jogos */}
        {!loading && games.length > 0 && (
          <div className="text-center mb-4 md:mb-6">
            <p className="text-base md:text-lg text-blue-800 font-semibold">
              Divirta-se aprendendo! 🎉
            </p>
          </div>
        )}

        {/* Botão Configurar Jogos */}
        {!loading && (
          <div className="flex justify-center">
            <Link
              href="/games"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 md:py-3 md:px-8 rounded-xl shadow-md transition-all duration-250 transform hover:scale-105 hover:-translate-y-1 flex items-center gap-2 text-sm md:text-base"
            >
              <span>⚙️</span>
              <span>Configurar Jogos</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
