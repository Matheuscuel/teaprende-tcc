import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, defaultRouteForRole } from "../contexts/AuthContext";
import api from "../services/api";

function Penguin() {
  return (
    <div style={styles.penguinWrap}>
      <svg width="130" height="130" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="56" fill="#0E5AA5" />
        <circle cx="60" cy="60" r="44" fill="#1F78D1" />
        <g transform="translate(20,20)">
          <ellipse cx="40" cy="40" rx="26" ry="30" fill="#0B3257"/>
          <ellipse cx="40" cy="46" rx="22" ry="24" fill="#FFF4E1"/>
          <circle cx="32" cy="34" r="4" fill="#0B3257"/>
          <circle cx="48" cy="34" r="4" fill="#0B3257"/>
          <polygon points="40,40 46,46 34,46" fill="#F4B000"/>
          <ellipse cx="30" cy="68" rx="8" ry="4" fill="#F4B000"/>
          <ellipse cx="50" cy="68" rx="8" ry="4" fill="#F4B000"/>
        </g>
      </svg>
    </div>
  );
}

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { acceptToken } = useAuth();
  const from = location.state?.from?.pathname;

  const [email, setEmail] = useState("prof1@example.com");
  const [password, setPassword] = useState("joao");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const u = acceptToken(data.token);
      const target = from || defaultRouteForRole(u?.role);
      nav(target, { replace: true });
    } catch (err) {
      setMsg(err?.response?.data?.error || "E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Penguin />
        <h1 style={styles.title}>TEAprende</h1>

        <form onSubmit={onSubmit} style={styles.form}>
          <label style={styles.label}>E-mail:</label>
          <input type="email" style={styles.input} value={email} onChange={e=>setEmail(e.target.value)} required />

          <label style={{...styles.label, marginTop: 8}}>Senha:</label>
          <input type="password" style={styles.input} value={password} onChange={e=>setPassword(e.target.value)} required />

          <div style={{ textAlign: "right", marginTop: 6 }}>
            <a style={styles.link} href="#">Esqueceu a senha?</a>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {msg && <div style={styles.error}>{msg}</div>}

          <div style={{ textAlign: "center", marginTop: 16, color: "#E9F0FA" }}>
            Não tem uma conta? <Link to="/register" style={styles.link}>Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:{minHeight:"calc(100vh - 56px)", background:"#f7fafc", display:"flex", alignItems:"center", justifyContent:"center", padding:16},
  card:{width:520, maxWidth:"92vw", background:"#115EAB", borderRadius:20, padding:"28px 32px 32px", boxShadow:"0 20px 70px rgba(0,0,0,.20)", color:"#fff", position:"relative"},
  penguinWrap:{position:"absolute", top:-65, left:"50%", transform:"translateX(-50%)", filter:"drop-shadow(0 10px 20px rgba(0,0,0,.2))"},
  title:{textAlign:"center", marginTop:70, marginBottom:6, fontWeight:800, fontSize:36, color:"#FBE2B5", letterSpacing:.5},
  form:{marginTop:8, display:"grid", gap:6},
  label:{color:"#E9F0FA", fontWeight:600},
  input:{border:"none", outline:"none", height:44, borderRadius:10, padding:"0 14px", background:"#FBE2B5", color:"#0B3257"},
  button:{height:46, border:"none", borderRadius:12, background:"#4f46e5", color:"#fff", fontWeight:700, marginTop:12, cursor:"pointer"},
  link:{color:"#CFE6FF", textDecoration:"underline"},
  error:{marginTop:10, background:"#FDE2E2", color:"#B91C1C", padding:"8px 10px", borderRadius:8}
};

