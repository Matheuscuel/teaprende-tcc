"use client";
import Link from "next/link";

export default function Nav(){

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <span className="brand-logo" aria-hidden />
          <span>TEAprende</span>
        </Link>
        <nav className="nav-links">
          <a href="#recursos">Recursos</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#perfis">Perfis</a>
          <Link href="/login" className="btn btn-ghost">Entrar</Link>
          <Link href="/login" className="btn btn-primary">Começar</Link>
        </nav>
      </div>
    </header>
  );
}