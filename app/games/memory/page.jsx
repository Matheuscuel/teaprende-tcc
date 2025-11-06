"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";
import styles from "./memory.module.css";

const IMAGES = [
  "/games/memory/card1.png",
  "/games/memory/card2.png",
  "/games/memory/card3.png",
  "/games/memory/card4.png",
  "/games/memory/card5.png",
  "/games/memory/card6.png",
  "/games/memory/card7.png",
  "/games/memory/card8.png",
];

function buildDeck() {
  const base = IMAGES.flatMap((p) => ([
    { id: crypto.randomUUID(), value: p, revealed: false, matched: false },
    { id: crypto.randomUUID(), value: p, revealed: false, matched: false },
  ]));
  return base.sort(() => Math.random() - 0.5);
}

function MemoryGame() {
  const searchParams = useSearchParams();
  const childId = searchParams?.get('childId') || 1;
  const [deck, setDeck] = useState(buildDeck);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [locked, setLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [pairs, setPairs] = useState(0);

  useEffect(() => {
    if (first && second) {
      setLocked(true);
      setAttempts((a) => a + 1);
      if (first.value === second.value) {
        setDeck((d) =>
          d.map((c) =>
            (c.id === first.id || c.id === second.id)
              ? { ...c, matched: true }
              : c
          )
        );
        setPairs((p) => p + 1);
        setTimeout(() => {
          setFirst(null);
          setSecond(null);
          setLocked(false);
        }, 300);
      } else {
        setTimeout(() => {
          setDeck((d) =>
            d.map((c) =>
              (c.id === first.id || c.id === second.id)
                ? { ...c, revealed: false }
                : c
            )
          );
          setFirst(null);
          setSecond(null);
          setLocked(false);
        }, 700);
      }
    }
  }, [first, second]);

  useEffect(() => {
    if (pairs === IMAGES.length) {
      // pequena pausa e reinicia
      setTimeout(() => {
        setDeck(buildDeck());
        setFirst(null);
        setSecond(null);
        setAttempts(0);
        setPairs(0);
      }, 800);
    }
  }, [pairs]);

  function onFlip(card) {
    if (locked || card.matched || card.revealed) return;
    setDeck((d) => d.map((c) => (c.id === card.id ? { ...c, revealed: true } : c)));
    if (!first) setFirst(card);
    else if (!second) setSecond(card);
  }

  return (
    <main className={styles.memoryPage}>
      {/* Header */}
      <header className={styles.memoryHeader}>
        <BackButton href={`/kid/games?childId=${childId}`} />
        <div className="flex justify-center items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20">
            <Penguin size={240} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900">
            Jogo da Memória 🧠
          </h1>
        </div>
        <p className="text-xl sm:text-2xl text-blue-700 font-semibold">
          Encontre os pares iguais!
        </p>
        {/* Estatísticas */}
        <div className="bg-white/80 rounded-2xl p-4 sm:p-6 shadow-lg w-full max-w-md">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-lg sm:text-xl font-bold text-blue-900">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>Tentativas: <span className="text-orange-500">{attempts}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span>Pares: <span className="text-green-500">{pairs}/{IMAGES.length}</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <section className={styles.memoryBoard}>
        <div className={styles.memoryGrid}>
          {deck.map((card) => {
            const faceUp = card.revealed || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => onFlip(card)}
                disabled={locked || card.matched}
                className={`${styles.memoryCard} ${faceUp ? styles.flipped : ''} ${card.matched ? styles.matched : ''}`}
              >
                {faceUp ? (
                  <img
                    src={card.value}
                    alt="Carta"
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain select-none pointer-events-none"
                    draggable="false"
                  />
                ) : (
                  <span>❓</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Botão Reiniciar e Mensagem de Vitória */}
      <div className="w-full max-w-5xl px-6 pb-6 flex flex-col items-center gap-4">
        <button
          onClick={() => { setDeck(buildDeck()); setFirst(null); setSecond(null); setAttempts(0); setPairs(0); }}
          className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-orange-400 hover:bg-orange-500 text-white font-bold text-xl sm:text-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          🔄 Reiniciar Jogo
        </button>

        {/* Mensagem de vitória */}
        {pairs === IMAGES.length && pairs > 0 && (
          <div className="bg-yellow-300 rounded-2xl p-6 sm:p-8 shadow-xl animate-bounce">
            <p className="text-4xl sm:text-5xl mb-2">🎉</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">
              Parabéns! Você conseguiu! 🌟
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function MemoryPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4">
            <Penguin size={240} />
          </div>
          <p className="text-2xl font-bold text-blue-900">Carregando...</p>
    </div>
      </main>
    }>
      <MemoryGame />
    </Suspense>
  );
}
