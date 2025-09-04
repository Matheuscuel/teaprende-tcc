import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import peng from "../assets/penguin.svg"; // importa o asset (funciona local e no deploy)

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:3001").replace(/\/$/, "");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Falha no login");
      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ id: data.id, email: data.email, role: data.role }));
      }
      navigate("/dashboard");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-white">
      <div className="w-[340px] sm:w-[380px] rounded-3xl shadow-xl p-8 relative" style={{ background: "#0E63B6" }}>
        {/* Mascote */}
        <div className="w-full flex justify-center -mt-16 mb-3">
          <div className="w-36 h-36 rounded-full grid place-items-center shadow-lg ring-4 ring-white/60" style={{ background: "#0E63B6" }}>
            <img src={peng} alt="Pinguim" className="w-28 h-28 block select-none pointer-events-none" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-extrabold text-center mb-6" style={{ color: "#FFE4B5" }}>
          TEAprende
        </h1>

        {/* Formulário */}
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold" style={{ color: "#FFE4B5" }}>E-mail:</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl px-4 py-2 focus:outline-none focus:ring-4"
              style={{ background: "#FFEDCC", color: "#0e1b2e", boxShadow: "inset 0 1px 0 rgba(0,0,0,.06)", caretColor: "#0E63B6" }}
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold" style={{ color: "#FFE4B5" }}>Senha:</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl px-4 py-2 focus:outline-none focus:ring-4"
              style={{ background: "#FFEDCC", color: "#0e1b2e", boxShadow: "inset 0 1px 0 rgba(0,0,0,.06)", caretColor: "#0E63B6" }}
            />
          </label>

          <div className="flex justify-end">
            <button type="button" className="text-xs underline opacity-90 hover:opacity-100" style={{ color: "#FFE4B5" }}
              onClick={() => alert("Recuperação de senha em breve 😉")}>
              Esqueceu a senha?
            </button>
          </div>

          {err && <div className="text-sm rounded-lg px-3 py-2 bg-red-50 text-red-700">{err}</div>}

          <button type="submit" disabled={loading}
            className="w-full rounded-2xl py-2.5 text-white font-semibold shadow-md transition active:scale-[.98] disabled:opacity-70"
            style={{ background: "#F59E0B" }}>
            {loading ? "Entrando…" : "Entrar"}
          </button>

          <p className="text-center text-sm mt-2" style={{ color: "#FFE4B5" }}>
            Não tem uma conta?{" "}
            <Link to="/register" className="underline font-semibold" style={{ color: "#FFEDCC" }}>
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
