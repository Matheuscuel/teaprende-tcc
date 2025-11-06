"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserRole, hasPermission, hasRouteAccess } from "@/app/lib/auth";
import Penguin from "@/app/_components/Penguin";

export function RoleGuard({ children, requiredPermission, allowedRoles = [] }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const role = getUserRole();
      
      console.log('[RoleGuard] Verificando autorização:', { role, allowedRoles, requiredPermission });
      
      if (!role) {
        console.log('[RoleGuard] Role não encontrado, redirecionando para login');
        router.push("/login");
        return;
      }

      // Se especificou roles permitidos, verifica se o role está na lista
      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        console.log(`[RoleGuard] Role ${role} não está na lista de permitidos:`, allowedRoles);
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // Se especificou permissão, verifica se tem a permissão
      if (requiredPermission && !hasPermission(requiredPermission)) {
        console.log(`[RoleGuard] Usuário não tem permissão:`, requiredPermission);
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      console.log('[RoleGuard] Autorização concedida');
      setIsAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, requiredPermission, allowedRoles]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4">
            <Penguin size={240} />
          </div>
          <p className="text-2xl font-bold text-blue-900">Carregando...</p>
        </div>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Acesso Negado</h1>
          <p className="text-blue-700 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

