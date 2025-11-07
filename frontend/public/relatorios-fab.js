(function () {
  function addFab() {
    if (document.getElementById("relatorios-fab")) return;

    var a = document.createElement("a");
    a.id = "relatorios-fab";
    a.href = "/relatorios";
    a.textContent = "Relatórios";
    a.style.position = "fixed";
    a.style.right = "20px";
    a.style.bottom = "20px";
    a.style.zIndex = "99999";
    a.style.padding = "10px 14px";
    a.style.borderRadius = "999px";
    a.style.background = "#4f46e5";      // roxo do botão
    a.style.color = "#fff";
    a.style.fontWeight = "600";
    a.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, 'Apple Color Emoji','Segoe UI Emoji'";
    a.style.boxShadow = "0 8px 20px rgba(0,0,0,.25)";
    a.style.textDecoration = "none";
    a.style.transition = "transform .15s ease";
    a.onmouseenter = function(){ a.style.transform = "translateY(-2px)"; };
    a.onmouseleave = function(){ a.style.transform = "translateY(0)"; };

    document.body.appendChild(a);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addFab);
  } else {
    addFab();
  }
})();
