import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const ROLES = [
  { value: "responsavel", label: "Responsável" },
  { value: "professor", label: "Professor" },
  { value: "terapeuta", label: "Terapeuta" },
  // { value: "admin", label: "Admin" },
];

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES[0].value);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setOk("");
    if (password !== confirm) {
      setMsg("As senhas não conferem.");
      return;
    }
    try {
      await api.post("/auth/register", { name, email, password, role });
      setOk("Cadastro realizado! Você já pode fazer login.");
      setTimeout(()=>nav("/login"), 800);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) setMsg("Cadastro indisponível nesta API. Peça para o admin criar seu usuário.");
      else setMsg(err?.response?.data?.error || "Erro ao cadastrar.");
    }
  }

  return (
    <div style={s.page}>
      <form onSubmit={onSubmit} style={s.card} noValidate>
        <h2 style={{marginTop:0}}>Cadastro</h2>

        <div style={s.row}>
          <label style={s.label}>Nome completo</label>
          <input style={s.input} value={name} onChange={e=>setName(e.target.value)} required />
        </div>

        <div style={s.row}>
          <label style={s.label}>Email</label>
          <input type="email" style={s.input} value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>

        <div style={s.row}>
          <label style={s.label}>Senha</label>
          <input type="password" style={s.input} value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>

        <div style={s.row}>
          <label style={s.label}>Confirmar senha</label>
          <input type="password" style={s.input} value={confirm} onChange={e=>setConfirm(e.target.value)} required />
        </div>

        <div style={s.row}>
          <label style={s.label}>Tipo de usuário</label>
          <select style={s.input} value={role} onChange={e=>setRole(e.target.value)}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <button type="submit" style={s.btn}>Cadastrar</button>

        {msg && <div style={s.err}>{msg}</div>}
        {ok && <div style={s.ok}>{ok}</div>}

        <div style={{marginTop:12}}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </div>
      </form>
    </div>
  );
}

const s = {
  page:{minHeight:"calc(100vh - 56px)", display:"flex", alignItems:"center", justifyContent:"center", background:"#f7fafc", padding:16},
  card:{width:560, maxWidth:"92vw", background:"#fff", padding:22, border:"1px solid #e5e7eb", borderRadius:12, boxShadow:"0 8px 30px rgba(0,0,0,.06)"},
  row:{display:"flex", flexDirection:"column", gap:6, marginTop:10},
  label:{fontWeight:600, color:"#0f172a"},
  input:{height:44, borderRadius:8, border:"1px solid #cbd5e1", padding:"0 12px", width:"100%", background:"#fff"},
  btn:{marginTop:14, background:"#4f46e5", color:"#fff", border:"none", height:46, borderRadius:10, cursor:"pointer", width:"100%", fontWeight:700},
  err:{marginTop:10, background:"#fee2e2", color:"#b91c1c", padding:"8px 10px", borderRadius:8},
  ok:{marginTop:10, background:"#dcfce7", color:"#166534", padding:"8px 10px", borderRadius:8}
};
