(function () {
  try {
    var isLogin = /^\/login(\b|\/)/.test(location.pathname);
    var token = localStorage.getItem("token");

    // Sem token e fora do /login => redireciona
    if (!token && !isLogin) {
      location.replace("/login");
      return;
    }

    // Se alguém fizer logout em outra aba
    window.addEventListener("storage", function (e) {
      if (e.key === "token" && !e.newValue) {
        if (!/^\/login(\b|\/)/.test(location.pathname)) {
          location.replace("/login");
        }
      }
    });

    // Atalho global de logout (se você disparar window.dispatchEvent(new Event("teaprende:logout")))
    window.addEventListener("teaprende:logout", function () {
      try { localStorage.removeItem("token"); } catch (e) {}
      location.replace("/login");
    });
  } catch (e) {
    console.warn("[auth-guard] erro:", e);
  }
})();