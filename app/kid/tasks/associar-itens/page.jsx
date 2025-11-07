"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton";
import Penguin from "@/app/_components/Penguin";

export default function AssociarItensPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childId = searchParams?.get("childId") || "1";
  
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

  const pairs = [
    { left: "☀️", leftText: "Sol", right: "🌙", rightText: "Lua", id: 1 },
    { left: "🍎", leftText: "Maçã", right: "🍌", rightText: "Banana", id: 2 },
    { left: "🚗", leftText: "Carro", right: "🚲", rightText: "Bicicleta", id: 3 },
    { left: "🐱", leftText: "Gato", right: "🐶", rightText: "Cachorro", id: 4 },
    { left: "📚", leftText: "Livro", right: "✏️", rightText: "Lápis", id: 5 },
    { left: "🏠", leftText: "Casa", right: "🌳", rightText: "Árvore", id: 6 }
  ];

  const [leftItems] = useState(pairs.map(p => ({ ...p, side: "left" })));
  const [rightItems] = useState(pairs.map(p => ({ ...p, side: "right" })).sort(() => Math.random() - 0.5));

  const handleLeftClick = (item) => {
    if (matchedPairs.includes(item.id)) return;
    setSelectedLeft(item);
    if (selectedRight && selectedRight.id === item.id) {
      // Match correto
      const newScore = score + 10;
      const newMatchedPairs = [...matchedPairs, item.id];
      setMatchedPairs(newMatchedPairs);
      setScore(newScore);
      setSelectedLeft(null);
      setSelectedRight(null);
      
      if (newMatchedPairs.length === pairs.length) {
        setCompleted(true);
        saveProgress(newScore);
      }
    } else if (selectedRight) {
      // Match incorreto
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 1000);
    }
  };

  const handleRightClick = (item) => {
    if (matchedPairs.includes(item.id)) return;
    setSelectedRight(item);
    if (selectedLeft && selectedLeft.id === item.id) {
      // Match correto
      const newScore = score + 10;
      const newMatchedPairs = [...matchedPairs, item.id];
      setMatchedPairs(newMatchedPairs);
      setScore(newScore);
      setSelectedLeft(null);
      setSelectedRight(null);
      
      if (newMatchedPairs.length === pairs.length) {
        setCompleted(true);
        saveProgress(newScore);
      }
    } else if (selectedLeft) {
      // Match incorreto
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 1000);
    }
  };

  const saveProgress = async (finalScore) => {
    if (saving) return;
    
    setSaving(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const tasksResponse = await fetch(`${API_BASE}/tasks`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || "demo-token"}`
        }
      });
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        const task = tasksData.tasks?.find(t => t.type === 'matching');
        
        if (task) {
          const progressResponse = await fetch(`${API_BASE}/tasks/${task.id}/progress`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token") || "demo-token"}`
            },
            body: JSON.stringify({
              child_id: Number(childId),
              score: finalScore,
              status: 'completed',
              time_spent: timeSpent
            })
          });
          
          if (progressResponse.ok) {
            console.log('Progresso salvo com sucesso!');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetGame = () => {
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setScore(0);
    setCompleted(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-4">
          <BackButton href={`/kid/tasks?childId=${childId}`} />
        </div>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20">
              <Penguin size={160} />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-purple-900 mb-2">
            Associar Itens
          </h1>
          <p className="text-xl text-purple-700">
            Ligue os itens relacionados!
          </p>
        </div>

        {/* Score */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6 text-center">
          <p className="text-sm text-gray-600">Pontuação</p>
          <p className="text-3xl font-bold text-purple-600">{score}</p>
          <p className="text-sm text-gray-600 mt-2">
            Pares encontrados: {matchedPairs.length} / {pairs.length}
          </p>
        </div>

        {/* Grid de Itens */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Lado Esquerdo */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-800 text-center mb-4">Escolha um item</h2>
            {leftItems.map((item) => {
              const isMatched = matchedPairs.includes(item.id);
              const isSelected = selectedLeft?.id === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleLeftClick(item)}
                  disabled={isMatched || completed}
                  className={`w-full p-6 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg ${
                    isMatched
                      ? "bg-green-500 text-white opacity-60"
                      : isSelected
                      ? "bg-purple-600 text-white scale-110"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                  }`}
                >
                  <div>{item.left}</div>
                  <div className="text-lg mt-2">{item.leftText}</div>
                  {isMatched && "✓"}
                </button>
              );
            })}
          </div>

          {/* Lado Direito */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-800 text-center mb-4">Associe com</h2>
            {rightItems.map((item) => {
              const isMatched = matchedPairs.includes(item.id);
              const isSelected = selectedRight?.id === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched || completed}
                  className={`w-full p-6 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg ${
                    isMatched
                      ? "bg-green-500 text-white opacity-60"
                      : isSelected
                      ? "bg-pink-600 text-white scale-110"
                      : "bg-pink-500 hover:bg-pink-600 text-white"
                  }`}
                >
                  <div>{item.right}</div>
                  <div className="text-lg mt-2">{item.rightText}</div>
                  {isMatched && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Linha de conexão visual (quando selecionados) */}
        {selectedLeft && selectedRight && (
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-4 text-4xl">
              <span>{selectedLeft.left}</span>
              <span className="text-purple-600">→</span>
              <span>{selectedRight.right}</span>
            </div>
            {selectedLeft.id === selectedRight.id ? (
              <p className="text-green-600 font-bold mt-2">✓ Par correto!</p>
            ) : (
              <p className="text-red-600 font-bold mt-2">✗ Tente novamente!</p>
            )}
          </div>
        )}

        {/* Mensagem de conclusão */}
        {completed && (
          <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-6 mb-6 text-center">
            <p className="text-3xl font-bold text-green-800 mb-2">
              🎉 Parabéns! Você completou todas as associações!
            </p>
            <p className="text-xl text-green-700">
              Pontuação final: {score} pontos
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
          >
            Reiniciar
          </button>
          <button
            onClick={() => router.push(`/kid/tasks?childId=${childId}`)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </main>
  );
}

