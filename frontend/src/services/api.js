import axios from "axios";

// base SEM /api; você pode configurar VITE_API_BASE no .env do frontend
const baseURL =
  (import.meta.env.VITE_API_BASE || "http://localhost:3001").replace(/\/+$/, "");

const api = axios.create({ baseURL });

// Interceptor: injeta token e garante prefixo /api quando a URL iniciar com "/"
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Se a URL começar com "/", e NÃO começar com "/api", prefixa "/api"
  if (config.url && config.url.startsWith("/") && !config.url.startsWith("/api")) {
    config.url = "/api" + config.url;
  }
  return config;
});

export const setToken = (token) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

export default api;
