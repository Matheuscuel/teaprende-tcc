import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Nav() {
  const navigate = useNavigate();
  const { isLogged, role, logout } = useAuth();

  const onLogout = () => { logout(); navigate("/login"); };

  // menus por papel
  const Menu = () => {
    if (!isLogged) return null;
    const r = (role || "").toLowerCase();
    switch (r) {
      case "admin":
        return (<>
          <Link to="/admin">Admin</Link>
          <Link to="/games">Jogos</Link>
          <Link to="/children">Crianças</Link>
        </>);
      case "terapeuta":
      case "therapist":
        return (<>
          <Link to="/therapist">Painel</Link>
          <Link to="/children">Crianças</Link>
          <Link to="/games">Jogos</Link>
        </>);
      case "professor":
      case "teacher":
        return (<>
          <Link to="/teacher">Painel</Link>
          <Link to="/children">Crianças</Link>
        </>);
      case "responsavel":
      case "responsável":
      case "parent":
        return (<>
          <Link to="/parent">Início</Link>
        </>);
      default:
        return (<>
          <Link to="/children">Crianças</Link>
        </>);
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <b>TEAprende</b>
        <Menu />
      </div>
      <div>
        {isLogged ? (
          <button onClick={onLogout} style={styles.btn}>Sair</button>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    height: 56, padding: "0 16px", borderBottom: "1px solid #e5e7eb",
    display: "flex", alignItems: "center", justifyContent: "space-between"
  },
  btn: { background: "#ef4444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }
};
