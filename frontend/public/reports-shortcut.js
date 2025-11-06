(function(){
  function add(){
    if (document.getElementById("relatorios-fab")) return;
    const a = document.createElement("a");
    a.id = "relatorios-fab";
    a.href = "/relatorios";
    a.textContent = "Relatórios";
    Object.assign(a.style, {
      position:"fixed", right:"96px", bottom:"24px",
      background:"#3b82f6", color:"#fff", padding:"12px 14px",
      borderRadius:"999px", fontWeight:"700", textDecoration:"none",
      boxShadow:"0 8px 24px rgba(0,0,0,.15)", zIndex: 2147483647
    });
    document.body.appendChild(a);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", add);
  } else {
    add();
  }
})();