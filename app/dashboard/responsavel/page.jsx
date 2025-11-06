"use client";

import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function ResponsavelDashboard() {
  const router = useRouter();
  const user = getCurrentUser();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
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
        
        // Se tiver apenas uma criança, selecionar automaticamente
        if (childrenList.length === 1) {
          setSelectedChild(childrenList[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar crianças:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Se não tiver criança selecionada, mostrar seleção
  if (!selectedChild && !loading) {
    return (
      <RoleGuard allowedRoles={[ROLES.RESPONSAVEL]}>
        <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-blue-900">Dashboard Responsável 👨‍👩‍👧</h1>
                <p className="text-blue-700 mt-2">Acompanhe o desenvolvimento do seu filho</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Sair
              </button>
            </div>

            {/* Seleção de Criança */}
            {children.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">👶</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Nenhuma criança cadastrada</h2>
                <p className="text-gray-600 mb-6">Entre em contato com o administrador para cadastrar seu filho.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                  Selecione qual filho você deseja acompanhar:
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChild(child)}
                      className="bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white text-left"
                    >
                      <div className="text-5xl mb-3">👶</div>
                      <h3 className="text-xl font-bold mb-2">{child.name}</h3>
                      {child.age && (
                        <p className="text-white/90">Idade: {child.age} anos</p>
                      )}
                      {child.gender && (
                        <p className="text-white/90 capitalize">Gênero: {child.gender}</p>
                      )}
                      <div className="mt-4 text-sm font-semibold">Clique para selecionar →</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </RoleGuard>
    );
  }

  // Dashboard com criança selecionada
  const childId = selectedChild?.id;
  const menuItems = [
    {
      title: "Acompanhar Criança",
      icon: "👨‍👩‍👧",
      link: `/kid?childId=${childId}`,
      color: "bg-orange-400 hover:bg-orange-500",
      description: `Acessar interface de ${selectedChild?.name}`
    },
    {
      title: "Relatórios",
      icon: "📊",
      link: `/reports?childId=${childId}`,
      color: "bg-green-400 hover:bg-green-500",
      description: `Acompanhar progresso de ${selectedChild?.name}`
    },
    {
      title: "Recompensas",
      icon: "⭐",
      link: `/rewards?childId=${childId}`,
      color: "bg-yellow-400 hover:bg-yellow-500",
      description: `Ver conquistas de ${selectedChild?.name}`
    }
  ];

  return (
    <RoleGuard allowedRoles={[ROLES.RESPONSAVEL]}>
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-blue-900">Dashboard Responsável 👨‍👩‍👧</h1>
              <p className="text-blue-700 mt-2">
                Acompanhando: <span className="font-semibold">{selectedChild?.name}</span>
                {children.length > 1 && (
                  <button
                    onClick={() => setSelectedChild(null)}
                    className="ml-4 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Trocar criança
                  </button>
                )}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
            >
              Sair
            </button>
          </div>

          {/* Grid de Menu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className={`${item.color} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 text-center text-white`}
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                <p className="text-white/90">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}

