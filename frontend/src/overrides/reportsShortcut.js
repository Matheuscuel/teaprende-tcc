(function () {
  const w = window;
  const d = document;
  const BTN_ID = "reports-fab";
  const BTN_SMALL_ID = "reports-fab-small";

  function go() {
    const path = w.location.pathname || "/";
    if (path.startsWith("/etapas")) ensureFABs();
    else removeFABs();
  }

  function toReports() {
    w.location.assign("/relatorios");
  }

  function styleFab(el, small=false) {
    el.style.position = "fixed";
    el.style.right = "24px";
    el.style.bottom = small ? "24px" : "96px";
    el.style.zIndex = "9999";
    el.style.background = "#3b82f6";
    el.style.color = "#fff";
    el.style.border = "none";
    el.style.borderRadius = "28px";
    el.style.padding = "12px 18px";
    el.style.fontWeight = "700";
    el.style.boxShadow = "0 10px 24px rgba(0,0,0,.18)";
    el.style.cursor = "pointer";
  }

  function ensureFABs() {
    if (!d.getElementById(BTN_ID)) {
      const b = d.createElement("button");
      b.id = BTN_ID;
      b.textContent = "Relatórios";
      styleFab(b,false);
      b.addEventListener("click", toReports);
      d.body.appendChild(b);
    }
    if (!d.getElementById(BTN_SMALL_ID)) {
      const b2 = d.createElement("button");
      b2.id = BTN_SMALL_ID;
      b2.textContent = "Relatórios";
      styleFab(b2,true);
      b2.addEventListener("click", toReports);
      d.body.appendChild(b2);
    }
  }

  function removeFABs() {
    [BTN_ID, BTN_SMALL_ID].forEach(id => {
      const el = d.getElementById(id);
      if (el) el.remove();
    });
  }

  // Primeira verificação
  go();

  // Observar navegação SPA
  ["pushState","replaceState"].forEach((m)=>{
    const orig = w.history[m];
    if (typeof orig === "function") {
      w.history[m] = function(){
        const r = orig.apply(this, arguments);
        setTimeout(go, 0);
        return r;
      };
    }
  });

  // Voltar/avançar
  w.addEventListener("popstate", go);

  // Em mudanças de hash
  w.addEventListener("hashchange", go);
})();