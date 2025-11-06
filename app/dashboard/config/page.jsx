"use client";

import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";

const LANGUAGES = ["Português", "English", "Español"];
const THEMES = ["Claro", "Escuro", "Automático"];

export default function ConfigPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("Português");
  const [theme, setTheme] = useState("Claro");
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Carregar configurações salvas do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("app_config");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setLanguage(config.language || "Português");
        setTheme(config.theme || "Claro");
        setSoundsEnabled(config.soundsEnabled !== undefined ? config.soundsEnabled : true);
      } catch (e) {
        console.error("Erro ao carregar configurações:", e);
      }
    }
  }, []);

  // Aplicar tema quando mudar
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;
    
    if (selectedTheme === "Escuro") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else if (selectedTheme === "Claro") {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    } else {
      // Automático - usar preferência do sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    }
  };

  const handleLanguageChange = () => {
    const currentIndex = LANGUAGES.indexOf(language);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    const newLanguage = LANGUAGES[nextIndex];
    setLanguage(newLanguage);
    setHasChanges(true);
    setSaved(false);
  };

  const handleThemeChange = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const newTheme = THEMES[nextIndex];
    setTheme(newTheme);
    setHasChanges(true);
    setSaved(false);
  };

  const handleSoundsToggle = () => {
    setSoundsEnabled(!soundsEnabled);
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Salvar no localStorage
      const config = {
        language,
        theme,
        soundsEnabled,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem("app_config", JSON.stringify(config));
      
      // Aplicar configurações imediatamente
      applyTheme(theme);
      
      // Salvar preferência de idioma (para uso futuro)
      if (language === "English") {
        document.documentElement.lang = "en";
      } else if (language === "Español") {
        document.documentElement.lang = "es";
      } else {
        document.documentElement.lang = "pt";
      }
      
      // Feedback visual
      setSaved(true);
      setHasChanges(false);
      
      setTimeout(() => {
        setSaved(false);
      }, 2000);
      
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileManage = () => {
    // Redirecionar para página de perfil quando implementada
    // Por enquanto, volta ao dashboard
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role?.toLowerCase();
    
    if (role === "admin") {
      router.push("/dashboard/admin");
    } else if (role === "terapeuta") {
      router.push("/dashboard/terapeuta");
    } else if (role === "professor") {
      router.push("/dashboard/professor");
    } else if (role === "responsavel") {
      router.push("/dashboard/responsavel");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.RESPONSAVEL]}>
      <main className="min-h-screen bg-blue-900 relative overflow-hidden">
        {/* Formas decorativas nos cantos */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-400 rounded-full opacity-30 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full opacity-30 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 rounded-full opacity-30 blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400 rounded-full opacity-20 blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400 rounded-full opacity-20 blur-3xl translate-x-1/4 translate-y-1/4"></div>

        <div className="relative z-10 min-h-screen flex flex-col p-6 sm:p-8">
          {/* Botão Voltar */}
          <div className="mb-4">
            <BackButton onClick={() => {
              const user = JSON.parse(localStorage.getItem("user") || "{}");
              const role = user.role?.toLowerCase();
              if (role === "admin") router.push("/dashboard/admin");
              else if (role === "terapeuta") router.push("/dashboard/terapeuta");
              else if (role === "professor") router.push("/dashboard/professor");
              else if (role === "responsavel") router.push("/dashboard/responsavel");
              else router.push("/dashboard");
            }} />
          </div>
          
          {/* Título */}
          <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-8 mt-4">
            Configurações
          </h1>

          {/* Opções de Configuração */}
          <div className="flex-1 space-y-4 mb-6">
            {/* Idioma */}
            <div
              onClick={handleLanguageChange}
              className="bg-blue-800 rounded-2xl p-5 cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-between shadow-lg"
            >
              <span className="text-white text-lg font-medium">Idioma</span>
              <div className="flex items-center gap-2">
                <span className="text-white/80">{language}</span>
                <span className="text-white/60 text-xl">›</span>
              </div>
            </div>

            {/* Tema */}
            <div
              onClick={handleThemeChange}
              className="bg-blue-800 rounded-2xl p-5 cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-between shadow-lg"
            >
              <span className="text-white text-lg font-medium">Tema</span>
              <div className="flex items-center gap-2">
                <span className="text-white/80">{theme}</span>
                <span className="text-white/60 text-xl">›</span>
              </div>
            </div>

            {/* Sons */}
            <div className="bg-blue-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <span className="text-white text-lg font-medium">Sons</span>
              <button
                onClick={handleSoundsToggle}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                  soundsEnabled ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                    soundsEnabled ? "translate-x-7" : "translate-x-0"
                  }`}
                ></span>
              </button>
            </div>

            {/* Gerenciar Perfil */}
            <div
              onClick={handleProfileManage}
              className="bg-blue-800 rounded-2xl p-5 cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-between shadow-lg"
            >
              <span className="text-white text-lg font-medium">Gerenciar perfil</span>
              <span className="text-white/60 text-xl">›</span>
            </div>
          </div>

          {/* Botão Salvar - aparece quando há mudanças */}
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full mb-4 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all ${
                saving
                  ? "bg-blue-600 cursor-not-allowed"
                  : saved
                  ? "bg-green-500"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar Configurações"}
            </button>
          )}

          {/* Botão Sair */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-2xl shadow-lg transition-colors mb-6"
          >
            Sair
          </button>

          {/* Pinguim decorativo */}
          <div className="flex justify-end">
            <div className="w-32 h-32 sm:w-40 sm:h-40">
              <Penguin size={160} />
            </div>
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}
