(function () {
  var API_BASE = "http://localhost:3001/api".replace(/\/+$/, "");
  var origFetch = window.fetch;
  window.fetch = function(input, init){
    init = init || {};
    var url = (typeof input === "string") ? input : (input && input.url) || "";
    try {
      var mustAuth = url.startsWith(API_BASE) || url.includes("localhost:3001");
      if (mustAuth) {
        var token = localStorage.getItem("token");
        if (token) {
          var headers = new Headers(init.headers || (typeof input !== "string" && input.headers) || {});
          headers.set("Authorization", "Bearer " + token);
          init.headers = headers;
        }
      }
    } catch(_) {}
    return origFetch(input, init);
  };
})();
