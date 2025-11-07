"use client";

import Link from "next/link";
import Nav from "./_components/Nav";
import Footer from "./_components/Footer";
import Penguin from "./_components/Penguin";
import "./styles.css";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="container">
        {/* HERO — heading grande, CTAs e pinguim em órbita */}
        <section className="hero haven-hero">
          <div className="hero-left">
            <div className="kicker">
              <span className="pill">Inclusão</span>
              <span className="pill">Jogos e Trilhas</span>
            </div>
            <h1 className="display" style={{backgroundColor: 'yellow', padding: '20px', border: '5px solid red'}}>
              🚨🚨🚨 TESTE H1-FRONTEND-APP - SE VOCÊ VÊ ISSO, ESTÁ USANDO frontend/app/page.jsx 🚨🚨🚨
              <br/>
              Plataforma lúdica para desenvolver <span className="grad">habilidades sociais</span>
            </h1>
            <p className="sub">
              Jogos educativos, trilhas personalizadas e relatórios claros para clínicas e escolas —
              conectando terapeutas, professores e famílias.
            </p>
            <div className="cta-row">
              <Link href="/login" className="btn btn-primary lg wiggle">Começar agora</Link>
              <a href="#recursos" className="btn btn-ghost lg">Ver recursos</a>
            </div>
            <div className="trust">
              <span className="dot" /> Seguro, acessível e simples de usar.
            </div>
          </div>

          <div className="hero-right">
            <div className="orbit-wrap">
              <div className="orbit-ring" />
              <div className="orbit-core">
                <Penguin size={180} />
              </div>

              {/* balõezinhos flutuando */}
              <div className="float f1 card">🎮 Biblioteca de jogos</div>
              <div className="float f2 card">📈 Relatórios</div>
              <div className="float f3 card">👨‍👩‍👧‍👦 Famílias conectadas</div>
            </div>
          </div>
        </section>

        {/* Seção recursos */}
        <section id="recursos" className="section">
          <h2>Recursos principais</h2>
          <div className="grid3">
            <article className="card lift">
              <h3>Aprender brincando</h3>
              <p>Módulos para emoções, rotina, autonomia e linguagem.</p>
            </article>
            <article className="card lift">
              <h3>Trilhas & planos</h3>
              <p>Defina objetivos, registre sessões e gere comparativos ao longo do tempo.</p>
            </article>
            <article className="card lift">
              <h3>Acessibilidade</h3>
              <p>Layout limpo, contraste adequado e instruções claras para todos.</p>
            </article>
          </div>
        </section>

        {/* Seção Como funciona — 3 passos */}
        <section id="como-funciona" className="section steps">
          <h2>Como funciona</h2>
          <div className="grid3">
            <div className="step card lift">
              <div className="n">1</div>
              <h4>Cadastre</h4>
              <p>Equipe, crianças e responsáveis, com permissões e perfis.</p>
            </div>
            <div className="step card lift">
              <div className="n">2</div>
              <h4>Atribua jogos</h4>
              <p>Escolha objetivos e trilhas para cada criança.</p>
            </div>
            <div className="step card lift">
              <div className="n">3</div>
              <h4>Acompanhe</h4>
              <p>Métricas por sessão e evolução no tempo.</p>
            </div>
          </div>
        </section>

        {/* Seção Perfis - ANTES DO CTA */}
        <section id="perfis" className="section who" style={{ display: 'block' }}>
          <div className="container">
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
              <Link href="/quem-usa" className="btn btn-primary lg">Gerenciar Usuários</Link>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="section cta-final">
          <div className="cta-card">
            <h3>Pronto para começar?</h3>
            <p>Crie seu acesso e teste com dados de demonstração.</p>
            <Link href="/login" className="btn btn-primary lg wiggle">Experimentar</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}