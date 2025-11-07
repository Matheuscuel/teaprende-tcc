"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getDefaultRoute, ROLES } from "@/app/lib/auth";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    
    if (!user) {
      router.push("/login");
      return;
    }

    // Redireciona baseado no role
    const defaultRoute = getDefaultRoute(user.role);
    router.push(defaultRoute);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-900">Redirecionando...</p>
      </div>
    </main>
  );
}
