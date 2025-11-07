"use client";

import { useEffect } from "react";

export default function ConfigProvider({ children }) {
  // Carregar e aplicar configurações salvas ao iniciar
  useEffect(() => {
    const savedConfig = localStorage.getItem("app_config");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        
        // Aplicar tema
        const root = document.documentElement;
        if (config.theme === "Escuro") {
          root.classList.add("dark");
          root.style.colorScheme = "dark";
        } else if (config.theme === "Claro") {
          root.classList.remove("dark");
          root.style.colorScheme = "light";
        } else if (config.theme === "Automático") {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          if (prefersDark) {
            root.classList.add("dark");
            root.style.colorScheme = "dark";
          } else {
            root.classList.remove("dark");
            root.style.colorScheme = "light";
          }
        }
        
        // Aplicar idioma
        if (config.language === "English") {
          document.documentElement.lang = "en";
        } else if (config.language === "Español") {
          document.documentElement.lang = "es";
        } else {
          document.documentElement.lang = "pt";
        }
      } catch (e) {
        console.error("Erro ao carregar configurações:", e);
      }
    }
    
    // Listener para mudanças de preferência do sistema (tema automático)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e) => {
      const savedConfig = localStorage.getItem("app_config");
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.theme === "Automático") {
          const root = document.documentElement;
          if (e.matches) {
            root.classList.add("dark");
            root.style.colorScheme = "dark";
          } else {
            root.classList.remove("dark");
            root.style.colorScheme = "light";
          }
        }
      }
    };
    
    mediaQuery.addEventListener("change", handleThemeChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  return <>{children}</>;
}

