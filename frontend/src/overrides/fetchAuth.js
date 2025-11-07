/* eslint-disable no-restricted-globals */
/**
 * fetchAuth: injeta Authorization automaticamente e trata 401.
 */
(function fetchAuthOverride(){
  if (typeof window === "undefined" || typeof fetch === "undefined") return;
  if (window.__fetchAuthWrapped) return; // evita duplicar
  window.__fetchAuthWrapped = true;

  const originalFetch = window.fetch;

  async function wrappedFetch(input, init = {}) {
    try {
      const req = (typeof input === "string") ? new Request(input, init) : input;
      const headers = new Headers(req.headers || (init && init.headers) || {});
      // injeta token se existir
      try {
        const token = localStorage.getItem("token");
        if (token && !headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch {}

      const nextInit = { ...init, headers };

      const res = await originalFetch(input, nextInit);

      // se 401, limpa token e manda para /login
      if (res && res.status === 401) {
        try { localStorage.removeItem("token"); } catch {}
        if (!window.location.pathname.toLowerCase().includes("/login")) {
          console.warn("HTTP 401 â†’ redirecionando para /login");
          window.location.href = "/login";
        }
      }
      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  window.fetch = wrappedFetch;
})();

