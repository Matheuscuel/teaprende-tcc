"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function shuffle(arr){ return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]); }

export default function MemoryPage({ searchParams }) {
  const childId = Number(searchParams?.childId ?? 1);
  const PAIRS = 8;
  const deck = useMemo(() => {
    const symbols = "🍎🍌🍇🍓🍑🍒🍍🍉🥝🍋".split("").slice(0, PAIRS);
    const cards = symbols.flatMap((s, i) => [{ id: `${i}a`, key: i, s }, { id: `${i}b`, key: i, s }]);
    return shuffle(cards);
  }, []);

  const [flipped, setFlipped] = useState([]);      // ids virados
  const [matchedKeys, setMatchedKeys] = useState(new Set());
  const [attempts, setAttempts] = useState(0);
  const [startedAt] = useState(Date.now());
  const allMatched = matchedKeys.size === PAIRS;

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      const ca = deck.find(c => c.id === a);
      const cb = deck.find(c => c.id === b);
      setAttempts(x => x + 1);
      if (ca.key === cb.key) {
        setMatchedKeys(s => new Set([...s, ca.key]));
        setTimeout(()=> setFlipped([]), 400);
      } else {
        setTimeout(()=> setFlipped([]), 700);
      }
    }
  }, [flipped]);

  async function onFinish() {
    const duration = Math.round((Date.now() - startedAt)/1000);
    const score = Math.max(0, (PAIRS*10) - (attempts - PAIRS)*2); // regra simples
    try {
      await fetch(`${API}/api/gameplay/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: childId,
          slug: "memory",
          attempts,
          matched_pairs: matchedKeys.size,
          duration_seconds: duration,
          score
        })
      });
      alert("Sessão registrada!");
    } catch (e) {
      console.error(e);
      alert("Falha ao registrar sessão (ok para demo).");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Jogo da Memória</h1>
      <p>Tente encontrar os pares!</p>

      <div className="grid grid-cols-4 gap-3 max-w-xl">
        {deck.map(card => {
          const isMatched = matchedKeys.has(card.key);
          const isFlipped = flipped.includes(card.id) || isMatched;
          return (
            <Card key={card.id}
                  onClick={()=>{
                    if (isMatched) return;
                    if (flipped.length===2) return;
                    if (flipped.includes(card.id)) return;
                    setFlipped([...flipped, card.id]);
                  }}
                  className={"h-20 flex items-center justify-center cursor-pointer select-none " + (isFlipped ? "bg-white" : "bg-gray-200")}>
              <CardContent className="text-3xl pt-6">{isFlipped ? card.s : "❓"}</CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <span>Tentativas: {attempts}</span>
        <span>Pares: {matchedKeys.size}/{PAIRS}</span>
      </div>

      {allMatched && (
        <Button onClick={onFinish}>Concluir</Button>
      )}
    </div>
  );
}
