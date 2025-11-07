"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import { getDefaultRoute, ROLES } from "@/app/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("Responsável");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Tentar fazer cadastro na API
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: nome,
          email, 
          password: senha,
          role: tipoUsuario
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data?.user || { nome, email, role: tipoUsuario };
        localStorage.setItem("token", data?.token || "token-backend");
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Redireciona baseado no role
        const role = userData.role || tipoUsuario;
        const redirectRoute = getDefaultRoute(role);
        router.push(redirectRoute);
        return;
      }

      // Fallback para modo DEMO
      if (/@demo\.com$/i.test(email)) {
        const demoUser = { nome, email, role: tipoUsuario };
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("user", JSON.stringify(demoUser));
        
        // Redireciona baseado no role
        const redirectRoute = getDefaultRoute(tipoUsuario);
        router.push(redirectRoute);
        return;
      }

      const errorData = await response.json().catch(() => ({}));
      setError(errorData.error || "Não foi possível registrar. Tente outro e-mail ou use *@demo.com (DEMO).");
    } catch (err) {
      // Fallback para modo DEMO em caso de erro de conexão
      if (/@demo\.com$/i.test(email)) {
        const demoUser = { nome, email, role: tipoUsuario };
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("user", JSON.stringify(demoUser));
        
        // Redireciona baseado no role
        const redirectRoute = getDefaultRoute(tipoUsuario);
        router.push(redirectRoute);
        return;
      }
      setError("Servidor indisponível. Tente novamente ou use *@demo.com (DEMO).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden w-full">
      {/* Background com padrão colorido */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-br from-yellow-200 via-yellow-100 to-orange-200"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-tr from-yellow-200 via-orange-200 to-purple-200"></div>
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-r from-orange-200 via-purple-200 to-blue-200 opacity-60"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card de Cadastro */}
        <div className="bg-blue-800 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 pt-28 sm:pt-32 pb-6 sm:pb-8 relative border-2 border-yellow-200">
          {/* Título e Pinguim */}
          <div className="absolute -top-12 sm:-top-16 left-0 flex items-center gap-2 sm:gap-4 flex-wrap">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-300 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
              Cadastro
            </h1>
            <div className="relative -mt-4 sm:-mt-6 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex-shrink-0">
              <Penguin size={240} />
            </div>
          </div>

          {/* Texto introdutório */}
          <p className="text-white text-center mb-6 sm:mb-8 text-sm sm:text-base">
            Crie sua conta para acessar a plataforma TEAprende
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Campo Nome */}
            <div>
              <label className="block text-white font-semibold mb-2 text-xs sm:text-sm">
                Nome
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-blue-900 text-white placeholder-blue-300 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-sm sm:text-base"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Campo Email */}
            <div>
              <label className="block text-white font-semibold mb-2 text-xs sm:text-sm">
                Email
              </label>
            <input
              type="email"
                required
              value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-blue-900 text-white placeholder-blue-300 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-sm sm:text-base"
                placeholder="seu@email.com"
            />
          </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-white font-semibold mb-2 text-xs sm:text-sm">
                Senha
              </label>
            <input
              type="password"
              required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-blue-900 text-white placeholder-blue-300 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-sm sm:text-base"
                placeholder="••••••••"
            />
          </div>

            {/* Dropdown Tipo de usuário */}
            <div>
              <label className="block text-white font-semibold mb-2 text-xs sm:text-sm">
                Tipo de usuário
              </label>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-blue-100 text-blue-900 border-2 border-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-sm sm:text-base font-medium cursor-pointer"
              >
                <option value="Responsável">Responsável</option>
                <option value="Terapeuta">Terapeuta</option>
                <option value="Professor">Professor</option>
              </select>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-500/20 border border-red-400 text-red-100 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Botão Cadastrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl bg-yellow-400 text-blue-900 font-bold text-base sm:text-lg shadow-lg hover:bg-yellow-500 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>

            {/* Link Login */}
            <div className="text-center pt-2">
              <span className="text-white text-xs sm:text-sm">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-yellow-300 font-semibold hover:text-yellow-200 transition-colors underline"
                >
                  Faça login
                </Link>
              </span>
            </div>
        </form>
        </div>
      </div>
    </main>
  );
}

