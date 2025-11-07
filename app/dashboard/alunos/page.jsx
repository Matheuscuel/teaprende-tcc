"use client";

import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function AlunosPage() {
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
            <h1 className="text-3xl font-bold text-blue-900 mb-4">Alunos</h1>
            <p className="text-blue-700 mb-6">Crianças da minha turma</p>
            
            {/* Redirecionar para a página de children com filtro de professor */}
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Esta página mostrará os alunos da sua turma.</p>
              <Link
                href="/children"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Ver Crianças
              </Link>
            </div>
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}

