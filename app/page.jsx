"use client";

import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getDefaultRoute } from "@/app/lib/auth";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Inclusão");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Redirecionar usuários autenticados para seus dashboards
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role) {
      const dashboardRoute = getDefaultRoute(user.role);
      if (dashboardRoute !== '/') {
        router.push(dashboardRoute);
      }
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-white text-slate-900 w-full overflow-x-hidden">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/95 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5 font-semibold text-lg sm:text-xl text-slate-900">
            <div className="relative">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
            </div>
            <span className="text-blue-900">TEAprende</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm">
            <a href="#recursos" className="text-slate-700 hover:text-blue-700 transition-colors">Recursos</a>
            <a href="#como-funciona" className="text-slate-700 hover:text-blue-700 transition-colors">Como funciona</a>
            <a href="#quem-usa" className="text-slate-700 hover:text-blue-700 transition-colors">Quem usa</a>
            <Link 
              href="/login" 
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-200 hover:scale-105 text-sm"
            >
              Entrar
            </Link>
            <Link 
              href="/register" 
              className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-md bg-orange-500 text-white font-medium shadow-sm hover:bg-orange-600 transition-all duration-200 hover:scale-105 hover:shadow-md text-sm"
            >
              Começar
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-4 space-y-3">
              <a 
                href="#recursos" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 hover:text-blue-700 transition-colors py-2"
              >
                Recursos
              </a>
              <a 
                href="#como-funciona" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 hover:text-blue-700 transition-colors py-2"
              >
                Como funciona
              </a>
              <a 
                href="#quem-usa" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 hover:text-blue-700 transition-colors py-2"
              >
                Quem usa
              </a>
              <div className="pt-2 space-y-2 border-t border-slate-200">
                <Link 
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  Entrar
                </Link>
                <Link 
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  Começar
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative bg-white w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("Inclusão")}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === "Inclusão"
                    ? "text-blue-900 border-b-2 border-blue-900"
                    : "text-blue-400 hover:text-blue-600"
                }`}
              >
                Inclusão
              </button>
              <button
                onClick={() => setActiveTab("Jogos e Trilhas")}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === "Jogos e Trilhas"
                    ? "text-blue-900 border-b-2 border-blue-900"
                    : "text-blue-400 hover:text-blue-600"
                }`}
              >
                Jogos e Trilhas
              </button>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 mb-4">
              Plataforma lúdica para desenvolver{" "}
              <span className="text-blue-600">habilidades sociais</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
              Jogos educativos, trilhas personalizadas e relatórios claros para clínicas e escolas —
              conectando terapeutas, professores e famílias.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link 
                href="/register" 
                className="px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold shadow-md hover:bg-orange-600 transition-all duration-200 hover:scale-105 hover:shadow-lg text-center"
              >
                Começar agora
              </Link>
              <a 
                href="#recursos" 
                className="px-6 py-3 rounded-lg border-2 border-blue-200 text-blue-700 font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:scale-105 text-center"
              >
                Ver recursos
              </a>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Seguro, acessível e simples de usar.
            </p>
          </div>

          <div className="relative flex items-center justify-center mt-8 md:mt-0">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
              <Penguin size={280} />
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="bg-white py-12 sm:py-16 md:py-20 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-8 sm:mb-12 text-center sm:text-left">Recursos principais</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aprender brincando</h3>
              <p className="text-slate-600 leading-relaxed">Módulos para emoções, rotina, autonomia e linguagem.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Trilhas & planos</h3>
              <p className="text-slate-600 leading-relaxed">Defina objetivos, registre sessões e gere comparativos ao longo do tempo.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Acessibilidade</h3>
              <p className="text-slate-600 leading-relaxed">Layout limpo, contraste adequado e instruções claras para todos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUEM USA */}
      <section id="quem-usa" className="bg-white py-12 sm:py-16 md:py-20 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-8 sm:mb-12 text-center sm:text-left">Quem usa</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-3">🧩</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Terapeutas & psicopedagogos</h3>
              <p className="text-slate-600 leading-relaxed">Planejam trilhas, registram sessões e acompanham evolução.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-3">👩‍🏫</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Professores & educadores</h3>
              <p className="text-slate-600 leading-relaxed">Atribuem jogos, registram intervenções e veem métricas por turma.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-3">🏫</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Coordenação & gestão</h3>
              <p className="text-slate-600 leading-relaxed">Acompanha indicadores, compara turmas e apoia decisões.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-3">👨‍👩‍👧</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Famílias & responsáveis</h3>
              <p className="text-slate-600 leading-relaxed">Recebem tarefas, acompanham progresso e se comunicam com a equipe.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-3">🧒</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Crianças / estudantes</h3>
              <p className="text-slate-600 leading-relaxed">Jogos e atividades lúdicas alinhadas a objetivos de aprendizagem.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-3">🛠️</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Admin (clínica/escola)</h3>
              <p className="text-slate-600 leading-relaxed">Gerencia usuários, permissões, integrações e conformidade (LGPD).</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="bg-[#F5F8FF] py-12 sm:py-16 md:py-20 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-8 sm:mb-12 text-center sm:text-left">Como funciona</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">1</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Cadastre</h3>
              <p className="text-slate-600 leading-relaxed">Equipe, crianças e responsáveis, com permissões e perfis.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">2</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Atribua jogos</h3>
              <p className="text-slate-600 leading-relaxed">Escolha objetivos e trilhas para cada criança.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">3</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Acompanhe</h3>
              <p className="text-slate-600 leading-relaxed">Métricas por sessão e evolução no tempo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-12 sm:py-16 md:py-20 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl sm:rounded-2xl bg-blue-900 text-white px-6 sm:px-8 py-8 sm:py-10 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xl">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Pronto para começar?</h3>
              <p className="text-blue-100 text-lg">Crie seu acesso e teste com dados de demonstração.</p>
            </div>
            <Link 
              href="/register" 
              className="px-8 py-4 rounded-xl bg-orange-500 text-white font-semibold shadow-lg hover:bg-orange-600 transition-all duration-200 hover:scale-105 hover:shadow-xl whitespace-nowrap"
            >
              Experimentar
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-semibold text-lg text-slate-900">
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-blue-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            </div>
            <span className="text-blue-900">TEAprende</span>
          </div>
          <p className="text-sm text-slate-500 text-center md:text-right">
            Feito com carinho para crianças, famílias e educadores.
          </p>
        </div>
      </footer>
    </main>
  );
}