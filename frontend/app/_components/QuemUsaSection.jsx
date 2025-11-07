"use client";
import Link from "next/link";

export default function QuemUsaSection(){
  return (
    <section id="quem-usa" className="section who" data-testid="quem-usa-section">
      <div className="container who-container">
        <h2 className="who-title">Quem usa o TEAprende</h2>
        <p className="who-sub">Perfis que se beneficiam da plataforma — em clínicas e escolas.</p>

        <div className="who-grid">
          <article className="who-card">
            <div className="who-emoji" aria-hidden>🧩</div>
            <h3>Terapeutas & psicopedagogos</h3>
            <p>Planejam trilhas, registram sessões e acompanham evolução.</p>
            <div className="who-tags">
              <span className="who-badge">Planos</span>
              <span className="who-badge">Registro</span>
              <span className="who-badge">Relatórios</span>
            </div>
          </article>

          <article className="who-card">
            <div className="who-emoji" aria-hidden>👩‍🏫</div>
            <h3>Professores & educadores</h3>
            <p>Atribuem jogos, registram intervenções e veem métricas por turma/aluno.</p>
            <div className="who-tags">
              <span className="who-badge">Atribuir jogos</span>
              <span className="who-badge">Registro rápido</span>
              <span className="who-badge">Painel da turma</span>
            </div>
          </article>

          <article className="who-card">
            <div className="who-emoji" aria-hidden>🏫</div>
            <h3>Coordenação & gestão</h3>
            <p>Acompanha indicadores, compara turmas/unidades e apoia decisões.</p>
            <div className="who-tags">
              <span className="who-badge">KPIs</span>
              <span className="who-badge">Comparativos</span>
              <span className="who-badge">Exportações</span>
            </div>
          </article>

          <article className="who-card">
            <div className="who-emoji" aria-hidden>👨‍👩‍👧</div>
            <h3>Famílias & responsáveis</h3>
            <p>Recebem tarefas de casa, acompanham progresso e se comunicam com a equipe.</p>
            <div className="who-tags">
              <span className="who-badge">App do responsável</span>
              <span className="who-badge">Tarefas</span>
              <span className="who-badge">Evolução</span>
            </div>
          </article>

          <article className="who-card">
            <div className="who-emoji" aria-hidden>🧒</div>
            <h3>Crianças / estudantes</h3>
            <p>Jogos e atividades lúdicas alinhadas a objetivos de aprendizagem.</p>
            <div className="who-tags">
              <span className="who-badge">Jogos</span>
              <span className="who-badge">Trilhas</span>
              <span className="who-badge">Recompensas</span>
            </div>
          </article>

          <article className="who-card">
            <div className="who-emoji" aria-hidden>🛠️</div>
            <h3>Admin (clínica/escola)</h3>
            <p>Gerencia usuários, permissões, integrações e conformidade (LGPD).</p>
            <div className="who-tags">
              <span className="who-badge">Usuários</span>
              <span className="who-badge">Permissões</span>
              <span className="who-badge">LGPD</span>
            </div>
          </article>
        </div>
        
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link href="/quem-usa" className="btn btn-primary lg">
            Gerenciar Usuários
          </Link>
        </div>
      </div>
    </section>
  );
}