(function () {
  try {
    // só nas páginas de Etapas
    if (!location.pathname.startsWith("/etapas")) return;

    var a = document.createElement("a");
    a.href = "/relatorios";
    a.setAttribute("aria-label", "Ir para Relatórios (gerar PDF)");
    a.textContent = "📄 Relatórios";

    // estilos do botão flutuante
    a.style.position       = "fixed";
    a.style.right          = "24px";
    a.style.bottom         = "96px";          // fica acima do botão "Sair"
    a.style.background     = "#4F46E5";
    a.style.color          = "#fff";
    a.style.padding        = "12px 16px";
    a.style.borderRadius   = "9999px";
    a.style.boxShadow      = "0 6px 20px rgba(0,0,0,.15)";
    a.style.fontWeight     = "600";
    a.style.zIndex         = "9999";
    a.style.textDecoration = "none";
    a.style.fontFamily     = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    a.style.letterSpacing  = ".2px";

    document.body.appendChild(a);

    // Atalho: Shift+R abre /relatorios
    window.addEventListener("keydown", function(e){
      if (e.shiftKey && (e.key === "R" || e.key === "r")) location.href = "/relatorios";
    });
  } catch (e) {
    console.error("[patch-reports-shortcut]", e);
  }
})();
