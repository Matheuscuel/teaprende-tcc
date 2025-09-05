import { NavLink } from "react-router-dom";

const linkBase =
  "px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 transition";
const active =
  "bg-white/20 text-white";

export default function Nav() {
  const Item = ({ to, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? active : ""}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <nav className="w-full bg-sky-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="font-bold text-white text-lg mr-3">TEAprende</div>
        <Item to="/" label="Painel" />
        <Item to="/games" label="Jogos" />
        <Item to="/tasks" label="Tarefas" />
        <Item to="/children" label="Crianças" />
      </div>
    </nav>
  );
}
