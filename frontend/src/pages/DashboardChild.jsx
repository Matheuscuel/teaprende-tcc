import { Link } from "react-router-dom";

export default function DashboardChild() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-sky-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/games" className="bg-white rounded-2xl p-6 shadow hover:shadow-lg active:scale-[.98]">
            <div className="text-4xl">🎮</div>
            <div className="mt-2 font-semibold text-sky-800 text-lg">Jogos</div>
            <p className="text-sky-600 text-sm">Divirta-se aprendendo</p>
          </Link>
          <Link to="/tasks" className="bg-white rounded-2xl p-6 shadow hover:shadow-lg active:scale-[.98]">
            <div className="text-4xl">🧩</div>
            <div className="mt-2 font-semibold text-sky-800 text-lg">Tarefas</div>
            <p className="text-sky-600 text-sm">Atividades pedagógicas</p>
          </Link>
          <Link to="/memory-demo" className="bg-white rounded-2xl p-6 shadow hover:shadow-lg active:scale-[.98]">
            <div className="text-4xl">🧠</div>
            <div className="mt-2 font-semibold text-sky-800 text-lg">Jogo da Memória</div>
            <p className="text-sky-600 text-sm">Exemplo interativo</p>
          </Link>
          <Link to="/profile" className="bg-white rounded-2xl p-6 shadow hover:shadow-lg active:scale-[.98]">
            <div className="text-4xl">⚙️</div>
            <div className="mt-2 font-semibold text-sky-800 text-lg">Configurações</div>
            <p className="text-sky-600 text-sm">Som, idioma, etc.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
