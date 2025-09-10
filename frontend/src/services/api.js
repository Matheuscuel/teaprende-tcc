import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

// instancia com base /api
const api = axios.create({ baseURL: API_BASE });

// remove /api/ duplicado do começo da URL (ex.: /api/children -> /children)
api.interceptors.request.use((config) => {
  if (typeof config.url === "string" && config.url.startsWith("/")) {
    config.url = config.url.replace(/^\/api\//, "/");
  }
  return config;
});

export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
}

// carrega token ao iniciar
const t = localStorage.getItem("token");
if (t) setToken(t);

export default api;

