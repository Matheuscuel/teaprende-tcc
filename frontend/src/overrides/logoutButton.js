/* eslint-disable no-restricted-globals */
/**
 * BotÃ£o flutuante "Sair" no canto inferior direito.
 */
(function injectLogoutButton(){
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (document.getElementById("__logoutFloatingBtn")) return;

  const btn = document.createElement("button");
  btn.id = "__logoutFloatingBtn";
  btn.textContent = "Sair";
  Object.assign(btn.style, {
    position: "fixed",
    right: "16px",
    bottom: "16px",
    zIndex: "2147483647",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 6px 18px rgba(0,0,0,.12)",
    cursor: "pointer",
    fontWeight: "600",
    background: "#ef4444",
    color: "#fff",
    opacity: "0.9"
  });
  btn.title = "Encerrar sessÃ£o";

  btn.addEventListener("mouseenter", () => btn.style.opacity = "1");
  btn.addEventListener("mouseleave", () => btn.style.opacity = "0.9");
  btn.addEventListener("click", () => {
    try { localStorage.removeItem("token"); } catch {}
    window.location.href = "/login";
  });

  document.addEventListener("DOMContentLoaded", () => {
    // evita mostrar na tela de login (opcional)
    if (window.location.pathname.toLowerCase().includes("/login")) return;
    document.body.appendChild(btn);
  });
})();

