(function () {
  // ===== Config =====
  var API_BASE = "http://localhost:3001/api".replace(/\/+$/, "");
  var CHILD_ID_DEFAULT = 3;                // <- ajuste aqui se precisar
  var DAYS_BACK = 30;

  function ymd(d){ return new Date(d).toISOString().slice(0,10); }
  function period(){
    var to = ymd(Date.now());
    var from = ymd(Date.now() - DAYS_BACK*864e5);
    return { from, to };
  }
  function params(){
    // TODO: ler childId da UI se existir; fallback para constante
    var p = period();
    return { childId: CHILD_ID_DEFAULT, from: p.from, to: p.to };
  }
  function makeUrl(extra){
    var p = Object.assign({}, params(), extra||{});
    var qs = new URLSearchParams();
    if (p.childId) qs.set("childId", p.childId);
    if (p.from)    qs.set("from", p.from);
    if (p.to)      qs.set("to", p.to);
    if (p.status && p.status !== "todos") qs.set("status", p.status);
    return API_BASE + "/game-progress?" + qs.toString();
  }

  // ===== Botões: localizar por texto visível =====
  function findButton(label){
    label = (label||"").toLowerCase();
    var btns = document.querySelectorAll("button, a[role=button]");
    for (var i=0; i<btns.length; i++){
      var t = (btns[i].textContent || "").trim().toLowerCase();
      if (t === label) return btns[i];
    }
    return null;
  }

  // ===== Ação: Abrir endpoint =====
  function wireOpenEndpoint(){
    var btn = findButton("abrir endpoint");
    if (!btn || btn.__wired_open) return;
    btn.__wired_open = true;
    btn.addEventListener("click", function(e){
      e.preventDefault();
      var sel = document.querySelector("select");
      var status = sel && sel.value ? sel.value : "todos";
      var url = makeUrl({ status: status });
      window.open(url, "_blank", "noopener");
    });
  }

  // ===== Ação: Baixar JSON =====
  function wireDownloadJson(){
    var btn = findButton("baixar json");
    if (!btn || btn.__wired_dl) return;
    btn.__wired_dl = true;
    btn.addEventListener("click", async function(e){
      e.preventDefault();
      try {
        var sel = document.querySelector("select");
        var status = sel && sel.value ? sel.value : "todos";
        var url = makeUrl({ status: status });
        var tok = localStorage.getItem("token");
        var res = await fetch(url, { headers: tok ? { Authorization: "Bearer "+tok } : {} });
        if (!res.ok) throw new Error("HTTP "+res.status);
        var data = await res.json();
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        var f = "game-progress_"+(data.childId||"child")+"_"+(data.from||"from")+"_"+(data.to||"to")+".json";
        a.download = f;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        a.remove();
      } catch (err) {
        console.error(err);
        alert("Falha ao baixar JSON.");
      }
    });
  }

  // ===== Filtro de status (dropdown “Todos os status”) =====
  function applyStatusFilter(){
    var sel = document.querySelector("select");
    var val = sel && sel.value ? sel.value : "todos";
    // procura “badges” de status nos cards e mostra/oculta
    var cards = document.querySelectorAll("[class*=card],[class*=Card], .card");
    if (!cards.length) cards = document.querySelectorAll("[data-status]"); // fallback
    for (var i=0;i<cards.length;i++){
      var c = cards[i];
      var text = (c.textContent||"").toLowerCase();
      var status = text.includes("concluido") ? "concluido"
                 : text.includes("em-andamento") ? "em-andamento"
                 : text.includes("novo") ? "novo" : "desconhecido";
      var show = (val==="todos") || (status===val);
      c.style.display = show ? "" : "none";
    }
  }
  function wireStatusDropdown(){
    // escolhe o select que tem as opções de status
    var selects = document.querySelectorAll("select");
    var sel = null;
    for (var i=0;i<selects.length;i++){
      var opts = Array.from(selects[i].options||[]).map(o=> (o.text||"").toLowerCase());
      if (opts.includes("todos os status") || opts.includes("todos") || opts.includes("concluido")){
        sel = selects[i]; break;
      }
    }
    if (!sel || sel.__wired_status) return;
    sel.__wired_status = true;
    sel.addEventListener("change", applyStatusFilter);
    applyStatusFilter();
  }

  // ===== Observers para re-wiring em re-render =====
  function tick(){
    wireOpenEndpoint();
    wireDownloadJson();
    wireStatusDropdown();
  }
  var mo = new MutationObserver(function(){ tick(); });
  mo.observe(document.documentElement, { childList:true, subtree:true });
  // primeira passagem
  document.addEventListener("DOMContentLoaded", tick);
  tick();
})();
