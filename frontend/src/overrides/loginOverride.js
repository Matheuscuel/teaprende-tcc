/* eslint-disable no-restricted-globals */
import { login as apiLogin } from "../api/auth";

(function attachLoginOverride() {
  // intercepta submits em /login
  window.addEventListener("submit", async (ev) => {
    if (!location.pathname.toLowerCase().includes("login")) return;
    const form   = ev.target;
    const emailEl = form?.querySelector('input[type="email"]');
    const passEl  = form?.querySelector('input[type="password"]');
    if (!emailEl || !passEl) return;

    ev.preventDefault();
    try {
      const { token } = await apiLogin((emailEl.value || "").trim(), passEl.value || "");
      localStorage.setItem("token", token);
      window.location.href = "/etapas/progresso";
    } catch (e) {
      console.error(e);
      alert("Falha ao fazer login. Verifique suas credenciais.");
    }
  }, true);
})();
