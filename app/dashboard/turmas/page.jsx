"use client";

import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TurmasPage() {
  const router = useRouter();

  return (
    <RoleGuard allowedRoles={[ROLES.PROFESSOR]}>
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/dashboard/professor"
              className="text-blue-700 hover:text-blue-900 font-semibold"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-4">Minhas Turmas</h1>
            <p className="text-blue-700 mb-6">Gerencie suas turmas</p>
            
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Esta página permitirá gerenciar suas turmas.</p>
              <p className="text-sm text-gray-500">Funcionalidade em desenvolvimento.</p>
            </div>
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}

