// frontend/vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  // Lê variáveis .env.* (ex.: .env.local)
  const env = loadEnv(mode, process.cwd(), "");
  const useProxy = !env.VITE_API_URL; // se não setar VITE_API_URL, proxy ajuda no dev

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: true,         // acessível na rede local (opcional)
      port: 5173,
      strictPort: false,  // se 5173 estiver ocupada, usa outra
      open: true,         // abre o navegador ao iniciar
      proxy: useProxy
        ? {
            // com api.js chamando "/api/...", o Vite encaminha pro backend
            "/api": {
              target: "http://localhost:3001",
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    preview: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
