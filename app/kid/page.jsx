"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function KidHome() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childIdParam = searchParams?.get("childId");
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Carregar lista de crianças disponíveis
  useEffect(() => {
    loadChildren();
  }, []);

  // Se já tiver childId na URL, carregar dados da criança
  useEffect(() => {
    if (childIdParam) {
      loadChildData(Number(childIdParam));
    }
  }, [childIdParam]);

  const loadChildren = async () => {
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }

      const response = await fetch(`${API_BASE}/children`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        const childrenList = data.children || data || [];
        setChildren(childrenList);
        
        // Se tiver childId na URL, selecionar essa criança
        if (childIdParam) {
          const child = childrenList.find(c => c.id === Number(childIdParam));
          if (child) {
            setSelectedChild(child);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar crianças:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (id) => {
    try {
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }

      const response = await fetch(`${API_BASE}/children/${id}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedChild(data.child || data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da criança:", error);
    }
  };

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    router.push(`/kid?childId=${child.id}`);
  };

  // Função para determinar o dashboard correto baseado no role do usuário
  const getDashboardRoute = () => {
    if (typeof window === 'undefined') return '/dashboard';
    
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = user.role?.toLowerCase();
      
      if (role === "admin") return "/dashboard/admin";
      else if (role === "terapeuta") return "/dashboard/terapeuta";
      else if (role === "professor") return "/dashboard/professor";
      else if (role === "responsavel") return "/dashboard/responsavel";
      else return "/dashboard";
    } catch {
      return "/dashboard";
    }
  };

  // Se não tiver criança selecionada, mostrar lista de seleção
  if (!selectedChild && !loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Botão Voltar */}
          <div className="mb-4">
            <BackButton href={getDashboardRoute()} />
          </div>
          
          {/* Header com Pinguim */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32">
                <Penguin size={240} />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900">
                Modo Criança 🎮
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-blue-700 font-semibold">
              Escolha uma criança para começar
            </p>
          </div>

          {/* Lista de Crianças */}
          {children.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">Nenhuma criança disponível.</p>
              <Link 
                href="/children/create"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Cadastrar Criança
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleSelectChild(child)}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 text-left border-2 border-transparent hover:border-blue-400"
                >
                  <div className="text-6xl mb-4 text-center">👶</div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2 text-center">
                    {child.name}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {child.age && (
                      <p className="text-center">Idade: {child.age} anos</p>
                    )}
                    {child.gender && (
                      <p className="text-center capitalize">Gênero: {child.gender}</p>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                      Selecionar →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // Se tiver criança selecionada, mostrar menu de jogos/tarefas
  if (selectedChild) {
    const childId = selectedChild.id;
    const menuItems = [
      {
        title: "Jogos",
        icon: "🎮",
        color: "bg-orange-400",
        hoverColor: "hover:bg-orange-500",
        link: `/kid/games?childId=${childId}`,
        description: "Jogos divertidos"
      },
      {
        title: "Tarefas",
        icon: "📝",
        color: "bg-blue-400",
        hoverColor: "hover:bg-blue-500",
        link: `/kid/tasks?childId=${childId}`,
        description: "Atividades para fazer"
      },
      {
        title: "Recompensas",
        icon: "⭐",
        color: "bg-yellow-400",
        hoverColor: "hover:bg-yellow-500",
        link: `/rewards?childId=${childId}`,
        description: "Seus prêmios",
        titleClass: "text-xl sm:text-2xl md:text-3xl whitespace-nowrap"
      }
    ];

    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Botão Voltar */}
          <div className="mb-4 flex items-center justify-between">
            <BackButton href="/kid" />
            <button
              onClick={() => {
                setSelectedChild(null);
                router.push('/kid');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              Trocar Criança
            </button>
          </div>
          
          {/* Header com Pinguim e Nome da Criança */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32">
                <Penguin size={240} />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900">
                  Olá, {selectedChild.name}! 👋
                </h1>
                {selectedChild.age && (
                  <p className="text-lg text-blue-600 mt-2">
                    {selectedChild.age} anos
                  </p>
                )}
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-blue-700 font-semibold">
              O que você quer fazer hoje?
            </p>
          </div>

          {/* Menu de Opções */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className={`${item.color} ${item.hoverColor} rounded-3xl p-8 sm:p-10 pb-10 sm:pb-12 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 text-center flex flex-col justify-between min-h-[280px] sm:min-h-[320px]`}
              >
                <div className="text-7xl sm:text-8xl mb-4 sm:mb-6">
                  {item.icon}
                </div>
                <h2 className={`${item.titleClass || 'text-2xl sm:text-3xl md:text-4xl'} font-bold text-white mb-2 sm:mb-3`}>
                  {item.title}
                </h2>
                <p className="text-white/90 text-base sm:text-lg font-medium">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>

          {/* Footer com mensagem motivacional */}
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-lg sm:text-xl text-blue-800 font-semibold">
              Você está indo muito bem! 🌟
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Loading state
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="text-xl font-semibold text-gray-700">Carregando...</div>
    </main>
  );
}



