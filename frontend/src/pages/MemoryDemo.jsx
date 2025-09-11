import { useEffect, useState } from "react";

const EMOJIS = ["😀","😺","🚗","🍎","⚽","🎵","🌟","🧩"];
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

export default function MemoryDemo(){
  const [deck, setDeck]       = useState([]);
  const [open, setOpen]       = useState([]);   // índices abertos (máx 2)
  const [matched, setMatched] = useState(new Set());

  useEffect(()=>{
    const d = shuffle([...EMOJIS, ...EMOJIS]).map((v,i)=>({ id:i, v }));
    setDeck(d);
  },[]);

  function flip(i){
    if (open.length===2 || open.includes(i) || matched.has(deck[i].v)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length===2){
      const [a,b] = next;
      if (deck[a].v === deck[b].v) {
        setTimeout(()=>{
          setMatched(new Set([...matched, deck[a].v]));
          setOpen([]);
        }, 450);
      } else {
        setTimeout(()=>setOpen([]), 650);
      }
    }
  }

  const done = matched.size === EMOJIS.length;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-sky-900 mb-4">Jogo da Memória — Demo</h1>
      <div className="grid grid-cols-4 gap-3">
        {deck.map((c,i)=>{
          const faceUp = open.includes(i) || matched.has(c.v);
          return (
            <button
              key={c.id}
              onClick={()=>flip(i)}
              className={`h-20 rounded-2xl shadow text-3xl
                ${faceUp ? "bg-amber-200" : "bg-sky-600"}
                ${faceUp ? "text-sky-900" : "text-transparent"}`}
            >
              {c.v}
            </button>
          );
        })}
      </div>
      {done && <div className="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-700">Parabéns! 🎉</div>}
    </div>
  );
}
