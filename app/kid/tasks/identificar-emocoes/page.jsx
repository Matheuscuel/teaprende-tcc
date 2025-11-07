"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton";
import Penguin from "@/app/_components/Penguin";

export default function IdentificarEmocoesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childId = searchParams?.get("childId") || "1";
  
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

  const questions = [
    {
      emotion: "feliz",
      image: "😊",
      options: ["Feliz", "Triste", "Bravo", "Surpreso"],
      correct: 0
    },
    {
      emotion: "triste",
      image: "😢",
      options: ["Feliz", "Triste", "Bravo", "Surpreso"],
      correct: 1
    },
    {
      emotion: "bravo",
      image: "😠",
      options: ["Feliz", "Triste", "Bravo", "Surpreso"],
      correct: 2
    },
    {
      emotion: "surpreso",
      image: "😲",
      options: ["Feliz", "Triste", "Bravo", "Surpreso"],
      correct: 3
    },
    {
      emotion: "medo",
      image: "😨",
      options: ["Medo", "Feliz", "Bravo", "Triste"],
      correct: 0
    },
    {
      emotion: "amor",
      image: "😍",
      options: ["Amor", "Triste", "Bravo", "Surpreso"],
      correct: 0
    }
  ];

  const handleAnswer = (index) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const saveProgress = async () => {
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
        const task = tasksData.tasks?.find(t => t.type === 'emotions');
        
        if (task) {
          const progressResponse = await fetch(`${API_BASE}/tasks/${task.id}/progress`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token") || "demo-token"}`
            },
            body: JSON.stringify({
              child_id: Number(childId),
              score: score,
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

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Finalizar e salvar progresso
      saveProgress();
      setTimeout(() => {
        router.push(`/kid/tasks?childId=${childId}`);
      }, 500);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-4xl sm:text-5xl font-bold text-orange-900 mb-2">
            Identificar Emoções
          </h1>
          <p className="text-xl text-orange-700">
            Qual emoção está sendo mostrada?
          </p>
        </div>

        {/* Score e Progresso */}
        <div className="flex justify-between items-center mb-6 bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Pontuação</p>
            <p className="text-2xl font-bold text-orange-600">{score}/{questions.length}</p>
          </div>
          <div className="text-center flex-1 mx-4">
            <p className="text-sm text-gray-600 mb-2">Progresso</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-orange-500 h-4 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {currentQuestion + 1} de {questions.length}
            </p>
          </div>
        </div>

        {/* Emoji Grande */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6 text-center">
          <div className="text-9xl mb-6">{currentQ.image}</div>
          <p className="text-2xl font-bold text-gray-800">
            Qual é esta emoção?
          </p>
        </div>

        {/* Opções */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {currentQ.options.map((option, index) => {
            const isCorrect = index === currentQ.correct;
            const isSelected = selectedAnswer === index;
            let bgColor = "bg-blue-500 hover:bg-blue-600";
            
            if (showResult) {
              if (isCorrect) {
                bgColor = "bg-green-500";
              } else if (isSelected && !isCorrect) {
                bgColor = "bg-red-500";
              } else {
                bgColor = "bg-gray-400";
              }
            }
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`${bgColor} text-white font-bold py-6 px-4 rounded-2xl text-xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg`}
              >
                {option}
                {showResult && isCorrect && " ✓"}
                {showResult && isSelected && !isCorrect && " ✗"}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showResult && (
          <div className={`rounded-2xl p-6 mb-6 text-center ${
            selectedAnswer === currentQ.correct 
              ? "bg-green-100 border-2 border-green-500" 
              : "bg-red-100 border-2 border-red-500"
          }`}>
            <p className={`text-2xl font-bold ${
              selectedAnswer === currentQ.correct ? "text-green-800" : "text-red-800"
            }`}>
              {selectedAnswer === currentQ.correct 
                ? "🎉 Parabéns! Você acertou!" 
                : `Ops! A resposta correta é "${currentQ.options[currentQ.correct]}"`}
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/kid/tasks?childId=${childId}`)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
          >
            Voltar
          </button>
          {showResult && (
            <button
              onClick={handleNext}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
            >
              {currentQuestion < questions.length - 1 ? "Próxima" : "Finalizar"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

