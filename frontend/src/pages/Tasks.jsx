export default function Tasks() {
  const items = [
    { id: 1, title: "Sequência de Rotina", desc: "Arrumar mochila, lanche, caderno." },
    { id: 2, title: "Leitura guiada", desc: "Ler por 10 minutos e responder 3 perguntas." },
    { id: 3, title: "Reconhecer emoções", desc: "Identificar 5 emoções em figuras." },
  ];
  return (
    <div className="p-6 grid gap-5 md:grid-cols-2">
      {items.map(t => (
        <div key={t.id} className="rounded-2xl bg-white/95 shadow p-5">
          <div className="text-lg font-semibold text-sky-900">{t.title}</div>
          <p className="text-slate-600 mt-2">{t.desc}</p>
          <div className="mt-4">
            <button className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:brightness-110 active:scale-95">
              Iniciar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
