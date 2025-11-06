"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import { getDefaultRoute, ROLES } from "@/app/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para determinar o role baseado no email (modo DEMO)
  const getDemoRole = (email) => {
    if (email.includes("admin")) return ROLES.ADMIN;
    if (email.includes("terapeuta")) return ROLES.TERAPEUTA;
    if (email.includes("professor")) return ROLES.PROFESSOR;
    if (email.includes("responsavel") || email.includes("responsável")) return ROLES.RESPONSAVEL;
    return ROLES.RESPONSAVEL; // Default
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Tentar fazer login na API
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data?.user || {};
        
        // Normalizar role do backend para o formato esperado pelo frontend
        const roleMap = {
          'admin': ROLES.ADMIN,
          'terapeuta': ROLES.TERAPEUTA,
          'therapist': ROLES.TERAPEUTA, // inglês
          'professor': ROLES.PROFESSOR,
          'teacher': ROLES.PROFESSOR, // inglês
          'responsavel': ROLES.RESPONSAVEL,
          'responsável': ROLES.RESPONSAVEL,
          'guardian': ROLES.RESPONSAVEL, // inglês
          'parent': ROLES.RESPONSAVEL // inglês
        };
        const normalizedRole = roleMap[userData.role?.toLowerCase()] || userData.role || ROLES.RESPONSAVEL;
        userData.role = normalizedRole;
        
        localStorage.setItem("token", data?.token || "token-backend");
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Redireciona baseado no role
        const redirectRoute = getDefaultRoute(normalizedRole);
        console.log('[LOGIN] Role normalizado:', normalizedRole);
        console.log('[LOGIN] Rota de redirecionamento:', redirectRoute);
        router.push(redirectRoute);
        return;
      }

      // Fallback para modo DEMO
      if (/@demo\.com$/i.test(email)) {
        const demoRole = getDemoRole(email);
        const demoUser = {
          email,
          name: `Usuário ${demoRole}`,
          role: demoRole
        };
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("user", JSON.stringify(demoUser));
        
        // Redireciona baseado no role
        const redirectRoute = getDefaultRoute(demoRole);
        console.log('[LOGIN DEMO] Role:', demoRole);
        console.log('[LOGIN DEMO] Rota de redirecionamento:', redirectRoute);
        router.push(redirectRoute);
        return;
      }

      setError("E-mail ou senha incorretos. Use um e-mail *@demo.com para modo DEMO.");
    } catch (err) {
      // Fallback para modo DEMO em caso de erro de conexão
      if (/@demo\.com$/i.test(email)) {
        const demoRole = getDemoRole(email);
        const demoUser = {
          email,
          name: `Usuário ${demoRole}`,
          role: demoRole
        };
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("user", JSON.stringify(demoUser));
        
        // Redireciona baseado no role
        const redirectRoute = getDefaultRoute(demoRole);
        console.log('[LOGIN DEMO ERROR] Role:', demoRole);
        console.log('[LOGIN DEMO ERROR] Rota de redirecionamento:', redirectRoute);
        router.push(redirectRoute);
        return;
      }
      setError("Servidor indisponível. Tente novamente ou use *@demo.com (DEMO).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-blue-900 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 w-full overflow-x-hidden">
      <div className="w-full max-w-md relative mx-auto">
        {/* Card de Login */}
        <div className="bg-blue-800 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 pt-20 sm:pt-24 pb-6 sm:pb-8">
          {/* Pinguim no círculo amarelo claro */}
          <div className="absolute -top-16 sm:-top-20 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-yellow-50 flex items-center justify-center shadow-xl overflow-hidden">
              <div className="w-24 h-24 sm:w-36 sm:h-36">
                <Penguin size={240} />
              </div>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-6 sm:mb-8 mt-2 sm:mt-4 tracking-tight">
            TEAprende
          </h1>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Campo E-mail */}
            <div>
              <label className="block text-white font-semibold mb-2 text-xs sm:text-sm">
                E-mail:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-yellow-100 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-yellow-50 transition-all text-sm sm:text-base"
                placeholder="seu@email.com"
              />
        </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-white font-semibold mb-2 text-xs sm:text-sm">
                Senha:
          </label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-yellow-100 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-yellow-50 transition-all text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-500/20 border border-red-400 text-red-100 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Link Esqueceu a senha */}
            <div className="text-right">
              <a
                href="#"
                className="text-blue-200 hover:text-white text-xs sm:text-sm transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  // Implementar recuperação de senha
                }}
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl bg-orange-500 text-white font-bold text-base sm:text-lg shadow-lg hover:bg-orange-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {/* Link Cadastre-se */}
            <div className="text-center pt-2">
              <span className="text-white text-xs sm:text-sm">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="text-blue-300 font-semibold hover:text-blue-200 transition-colors"
                >
                  Cadastre-se
                </Link>
              </span>
          </div>
        </form>
        </div>
      </div>
    </main>
  );
}