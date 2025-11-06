"use client";

import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menuItems = [
    {
      title: "Modo Criança",
      icon: "👶",
      link: "/kid?childId=1",
      color: "bg-pink-400 hover:bg-pink-500",
      description: "Acessar interface da criança"
    },
    {
      title: "Usuários",
      icon: "👥",
      link: "/quem-usa",
      color: "bg-blue-400 hover:bg-blue-500",
      description: "Gerenciar usuários do sistema"
    },
    {
      title: "Crianças",
      icon: "🧒",
      link: "/children",
      color: "bg-orange-400 hover:bg-orange-500",
      description: "Gerenciar crianças"
    },
    {
      title: "Relatórios",
      icon: "📊",
      link: "/reports",
      color: "bg-green-400 hover:bg-green-500",
      description: "Visualizar todos os relatórios"
    },
    {
      title: "Jogos",
      icon: "🎮",
      link: "/kid/games?childId=1",
      color: "bg-purple-400 hover:bg-purple-500",
      description: "Visualizar jogos disponíveis"
    },
    {
      title: "Tarefas",
      icon: "📝",
      link: "/kid/tasks?childId=1",
      color: "bg-yellow-400 hover:bg-yellow-500",
      description: "Visualizar tarefas disponíveis"
    },
    {
      title: "Configurações",
      icon: "⚙️",
      link: "/dashboard/config",
      color: "bg-gray-400 hover:bg-gray-500",
      description: "Configurações do sistema"
    }
  ];

  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-blue-900">Dashboard Admin 👑</h1>
              <p className="text-blue-700 mt-2">Acesso total ao sistema</p>
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

