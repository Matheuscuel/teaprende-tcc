"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

// Componente de Ícone para Ligar os Pontos
function IconConnectDots() {
  return (
    <svg width="56" height="56" viewBox="0 0 100 100" className="mx-auto">
      {/* Pontos numerados com destaque */}
      <circle cx="30" cy="30" r="12" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <text x="30" y="36" textAnchor="middle" fontSize="16" fill="#1B1B1B" fontWeight="bold">1</text>
      
      <circle cx="70" cy="30" r="12" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <text x="70" y="36" textAnchor="middle" fontSize="16" fill="#1B1B1B" fontWeight="bold">2</text>
      
      <circle cx="70" cy="70" r="12" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <text x="70" y="76" textAnchor="middle" fontSize="16" fill="#1B1B1B" fontWeight="bold">3</text>
      
      <circle cx="30" cy="70" r="12" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <text x="30" y="76" textAnchor="middle" fontSize="16" fill="#1B1B1B" fontWeight="bold">4</text>
      
      {/* Linhas tracejadas conectando */}
      <line x1="30" y1="30" x2="70" y2="30" stroke="#4169E1" strokeWidth="4" strokeDasharray="5,5" strokeLinecap="round" />
      <line x1="70" y1="30" x2="70" y2="70" stroke="#4169E1" strokeWidth="4" strokeDasharray="5,5" strokeLinecap="round" />
      <line x1="70" y1="70" x2="30" y2="70" stroke="#4169E1" strokeWidth="4" strokeDasharray="5,5" strokeLinecap="round" />
      <line x1="30" y1="70" x2="30" y2="30" stroke="#4169E1" strokeWidth="4" strokeDasharray="5,5" strokeLinecap="round" />
    </svg>
  );
}

// Componente de Ícone para Pintar o Desenho
function IconPaint() {
  return (
    <svg width="56" height="56" viewBox="0 0 100 100" className="mx-auto">
      {/* Pincel destacado */}
      <path d="M 20 15 L 28 8 L 36 15 L 28 22 Z" fill="#FF8C00" stroke="#1B1B1B" strokeWidth="2" />
      <rect x="26" y="22" width="4" height="40" fill="#FF8C00" rx="2" />
      <rect x="24" y="62" width="8" height="10" fill="#654321" rx="2" />
      
      {/* Paleta de cores com borda */}
      <ellipse cx="70" cy="50" rx="22" ry="20" fill="#FFFFFF" stroke="#1B1B1B" strokeWidth="2.5" />
      
      {/* Cores na paleta - mais vibrantes */}
      <circle cx="64" cy="44" r="5" fill="#FF0000" stroke="#1B1B1B" strokeWidth="1.5" />
      <circle cx="76" cy="44" r="5" fill="#00FF00" stroke="#1B1B1B" strokeWidth="1.5" />
      <circle cx="70" cy="50" r="5" fill="#0000FF" stroke="#1B1B1B" strokeWidth="1.5" />
      <circle cx="64" cy="56" r="5" fill="#FFD700" stroke="#1B1B1B" strokeWidth="1.5" />
      <circle cx="76" cy="56" r="5" fill="#FF69B4" stroke="#1B1B1B" strokeWidth="1.5" />
      
      {/* Pincel apontando para a paleta */}
      <line x1="36" y1="25" x2="64" y2="50" stroke="#1B1B1B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Componente de Ícone para Identificar Emoções
function IconEmotions() {
  return (
    <svg width="56" height="56" viewBox="0 0 100 100" className="mx-auto">
      {/* Rosto feliz - mais expressivo */}
      <circle cx="35" cy="50" r="24" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <circle cx="30" cy="45" r="4" fill="#1B1B1B" />
      <circle cx="40" cy="45" r="4" fill="#1B1B1B" />
      <path d="M 26 60 Q 35 68 44 60" stroke="#1B1B1B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      
      {/* Rosto triste - mais expressivo */}
      <circle cx="65" cy="50" r="24" fill="#87CEEB" stroke="#1B1B1B" strokeWidth="2.5" />
      <circle cx="60" cy="45" r="4" fill="#1B1B1B" />
      <circle cx="70" cy="45" r="4" fill="#1B1B1B" />
      <path d="M 56 60 Q 65 52 74 60" stroke="#1B1B1B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Componente de Ícone para Associar Itens
function IconAssociate() {
  return (
    <svg width="56" height="56" viewBox="0 0 100 100" className="mx-auto">
      {/* Item 1 - Sol destacado */}
      <circle cx="30" cy="50" r="20" fill="#FFD700" stroke="#1B1B1B" strokeWidth="2.5" />
      <circle cx="30" cy="50" r="14" fill="#FFA500" />
      <line x1="30" y1="18" x2="30" y2="8" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="30" y1="82" x2="30" y2="92" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="8" y1="50" x2="0" y2="50" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="52" y1="50" x2="60" y2="50" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
      
      {/* Seta de conexão mais visível */}
      <path d="M 50 50 L 68 50" stroke="#4169E1" strokeWidth="5" strokeLinecap="round" />
      <path d="M 63 44 L 68 50 L 63 56" stroke="#4169E1" strokeWidth="5" fill="none" strokeLinecap="round" />
      
      {/* Item 2 - Nuvem destacada */}
      <ellipse cx="82" cy="50" rx="16" ry="13" fill="#E0E0E0" stroke="#1B1B1B" strokeWidth="2.5" />
      <ellipse cx="76" cy="48" rx="11" ry="9" fill="#E0E0E0" />
      <ellipse cx="88" cy="48" rx="11" ry="9" fill="#E0E0E0" />
    </svg>
  );
}

// Componente TaskCard reutilizável
function TaskCard({ title, icon, color, link }) {
  return (
    <Link
      href={link}
      className={`${color} rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-xl transition-all duration-250 transform hover:-translate-y-1 flex flex-col items-center justify-between min-h-[160px] md:min-h-[180px] group`}
    >
      {/* Ícone */}
      <div className="mb-2 md:mb-3 flex items-center justify-center flex-1 min-h-[56px]">
        {icon}
      </div>
      
      {/* Título */}
      <h2 className="text-white text-sm md:text-base lg:text-lg font-bold uppercase text-center mb-2 md:mb-3 leading-tight px-1">
        {title}
      </h2>
      
      {/* Botão INICIAR */}
      <button className="w-full bg-white/90 hover:bg-white text-gray-800 font-bold py-2 md:py-2.5 px-3 md:px-4 rounded-xl shadow-md transition-all duration-250 transform group-hover:scale-105 text-xs md:text-sm lg:text-base">
        INICIAR
      </button>
    </Link>
  );
}

// Mapeamento de tipos de tarefas para ícones e cores
const getTaskConfig = (task) => {
  const type = (task.type || "").toLowerCase();
  const title = (task.title || "").toLowerCase();
  
  // Mapear por tipo primeiro
  if (type.includes("connect") || type.includes("ligar") || type.includes("pontos")) {
    return {
      icon: <IconConnectDots />,
      color: "bg-yellow-500",
      route: "ligar-pontos"
    };
  }
  if (type.includes("paint") || type.includes("pintar") || type.includes("desenho")) {
    return {
      icon: <IconPaint />,
      color: "bg-green-500",
      route: "pintar-desenho"
    };
  }
  if (type.includes("emotion") || type.includes("emoção")) {
    return {
      icon: <IconEmotions />,
      color: "bg-orange-500",
      route: "identificar-emocoes"
    };
  }
  if (type.includes("match") || type.includes("associar") || type.includes("associate")) {
    return {
      icon: <IconAssociate />,
      color: "bg-purple-500",
      route: "associar-itens"
    };
  }
  
  // Mapear por título se tipo não funcionar
  if (title.includes("ligar") || title.includes("pontos")) {
    return {
      icon: <IconConnectDots />,
      color: "bg-yellow-500",
      route: "ligar-pontos"
    };
  }
  if (title.includes("pintar") || title.includes("desenho")) {
    return {
      icon: <IconPaint />,
      color: "bg-green-500",
      route: "pintar-desenho"
    };
  }
  if (title.includes("emoção") || title.includes("emotion")) {
    return {
      icon: <IconEmotions />,
      color: "bg-orange-500",
      route: "identificar-emocoes"
    };
  }
  if (title.includes("associar") || title.includes("associate")) {
    return {
      icon: <IconAssociate />,
      color: "bg-purple-500",
      route: "associar-itens"
    };
  }
  
  // Default
  return {
    icon: <IconConnectDots />,
    color: "bg-gray-500",
    route: "ligar-pontos"
  };
};

export default function KidTasksPage() {
  const searchParams = useSearchParams();
  const childId = searchParams?.get("childId") || "1";
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTasks();
  }, [childId]);

  const loadTasks = async () => {
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

      const response = await fetch(`${API_BASE}/tasks`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Não autenticado. Faça login novamente.");
        } else if (response.status === 403) {
          setError("Acesso negado. Verifique suas permissões.");
        } else {
          setError(`Erro ao carregar tarefas: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      const allTasks = data.tasks || data || [];
      
      // Filtrar apenas tarefas ativas
      const activeTasks = allTasks.filter(task => {
        if (task.is_active === undefined && task.active === undefined) {
          return true; // Se não tiver propriedade, incluir
        }
        return task.is_active !== false && task.active !== false;
      });
      
      // Mapear tarefas para o formato esperado
      const mappedTasks = activeTasks.map(task => {
        const config = getTaskConfig(task);
        return {
          id: task.id,
          title: (task.title || "Tarefa").toUpperCase(),
          color: config.color,
          icon: config.icon,
          link: `/kid/tasks/${config.route}?childId=${childId}`
        };
      });
      
      setTasks(mappedTasks);
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
      setError(`Erro de conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center py-4 md:py-6">
      {/* Container principal - max-width 1280px, centralizado */}
      <div className="max-w-[1280px] w-full mx-auto px-6 md:px-10">
        
        {/* Botão Voltar */}
        <div className="mb-4">
          <BackButton href={`/kid?childId=${childId}`} />
        </div>
        
        {/* Header - Compacto */}
        <header className="text-center mb-4 md:mb-6">
          <div className="flex justify-center mb-1 md:mb-2">
            <div className="w-14 h-14 md:w-16 md:h-16">
              <Penguin size={160} />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 uppercase tracking-wide">
            TAREFAS
          </h1>
        </header>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Erro ao carregar tarefas</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Carregando tarefas...</p>
          </div>
        )}

        {/* Grid de Tarefas 2x2 - Compacto */}
        {!loading && tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-700 font-semibold mb-2">
              Nenhuma tarefa disponível
            </p>
            <p className="text-gray-600 mb-6">
              Não há tarefas ativas no momento. Verifique com o administrador.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-5 max-w-2xl mx-auto mb-4 md:mb-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                icon={task.icon}
                color={task.color}
                link={task.link}
              />
            ))}
          </div>
        )}

        {/* Botões de Navegação - Compactos */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 items-center justify-center max-w-2xl mx-auto">
          <Link
            href={`/kid?childId=${childId}`}
            className="text-blue-700 hover:text-blue-900 text-sm md:text-base font-semibold transition-colors flex items-center gap-1"
          >
            <span>←</span>
            <span>Voltar</span>
          </Link>
          
          {/* Botão Gerenciar Tarefas */}
          <Link
            href="/tasks"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 md:py-2.5 md:px-5 rounded-xl shadow-md transition-all duration-250 transform hover:scale-105 flex items-center gap-2 text-sm md:text-base"
          >
            <span>⚙️</span>
            <span>Gerenciar Tarefas</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
