"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";

const associations = [
  {
    left: { emoji: "🍎", name: "Maçã" },
    right: { emoji: "🌳", name: "Árvore", correct: true },
    options: ["Árvore", "Carro", "Casa", "Sol"]
  },
  {
    left: { emoji: "🐕", name: "Cachorro" },
    right: { emoji: "🦴", name: "Osso", correct: true },
    options: ["Osso", "Peixe", "Gato", "Pássaro"]
  },
  {
    left: { emoji: "☀️", name: "Sol" },
    right: { emoji: "🌻", name: "Girassol", correct: true },
    options: ["Girassol", "Lua", "Estrela", "Nuvem"]
  },
  {
    left: { emoji: "🐱", name: "Gato" },
    right: { emoji: "🐭", name: "Rato", correct: true },
    options: ["Rato", "Cachorro", "Peixe", "Pássaro"]
  },
  {
    left: { emoji: "🌧️", name: "Chuva" },
    right: { emoji: "☂️", name: "Guarda-chuva", correct: true },
    options: ["Guarda-chuva", "Sol", "Vento", "Neve"]
  }
];

function AssociationGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childId = searchParams?.get('childId') || 1;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentAssoc = associations[currentQuestion];

  const handleAnswer = (option) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === currentAssoc.right.name;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentQuestion + 1 < associations.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setCompleted(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setCompleted(false);
  };

  const progress = ((currentQuestion + (completed ? 1 : 0)) / associations.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-4">
            <BackButton href={`/kid/games?childId=${childId}`} />
          </div>
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20">
              <Penguin size={240} />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-pink-900">
              Associação 🔗
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-pink-700 font-semibold">
            Ligue os objetos relacionados!
          </p>
        </div>

        {/* Progresso */}
        <div className="bg-white/80 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-lg sm:text-xl font-bold text-pink-900">
              Questão {currentQuestion + 1} de {associations.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-lg sm:text-xl font-bold text-pink-900">
                Pontos: <span className="text-green-500">{score}</span>
              </span>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!completed ? (
          <>
            {/* Área da Associação */}
            <div className="bg-white/90 rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-pink-900 mb-8">
                  O que combina com {currentAssoc.left.name}?
                </h2>
                
                {/* Objetos */}
                <div className="flex justify-center items-center gap-6 sm:gap-12 mb-8">
                  <div className="bg-pink-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                    <div className="text-6xl sm:text-8xl mb-2">{currentAssoc.left.emoji}</div>
                    <div className="text-xl sm:text-2xl font-bold text-pink-900">{currentAssoc.left.name}</div>
                  </div>
                  
                  <div className="text-4xl sm:text-5xl">→</div>
                  
                  <div className="bg-purple-200 rounded-2xl p-6 sm:p-8 shadow-lg border-4 border-dashed border-purple-400">
                    <div className="text-6xl sm:text-8xl mb-2">?</div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-900">?</div>
                  </div>
                </div>

                {/* Opções */}
                <div className="grid grid-cols-2 gap-4">
                  {currentAssoc.options.map((option) => {
                    const isSelected = selectedOption === option;
                    const isCorrectOption = option === currentAssoc.right.name;
                    const showCorrect = showFeedback && isCorrectOption;
                    const showWrong = showFeedback && isSelected && !isCorrectOption;
                    
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={selectedOption !== null}
                        className={`
                          p-6 rounded-2xl font-bold text-xl sm:text-2xl transition-all duration-300
                          transform hover:scale-105 active:scale-95
                          ${showCorrect ? 'bg-green-500 text-white ring-4 ring-green-300' : ''}
                          ${showWrong ? 'bg-red-500 text-white ring-4 ring-red-300 animate-shake' : ''}
                          ${!showFeedback && !isSelected ? 'bg-pink-400 hover:bg-pink-500 text-white' : ''}
                          ${selectedOption !== null && !isSelected && !showCorrect ? 'opacity-50 cursor-not-allowed' : ''}
                          shadow-lg
                        `}
                      >
                        {option}
                        {showCorrect && <span className="ml-2">✓</span>}
                        {showWrong && <span className="ml-2">✗</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className={`mt-6 text-center p-4 rounded-xl ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p className="text-xl font-bold">
                      {isCorrect ? '🎉 Parabéns! Você acertou!' : `❌ A resposta correta é: ${currentAssoc.right.name}`}
                    </p>
                    {isCorrect && (
                      <div className="mt-4 flex justify-center items-center gap-4">
                        <div className="text-4xl">{currentAssoc.left.emoji}</div>
                        <div className="text-2xl">→</div>
                        <div className="text-4xl">{currentAssoc.right.emoji}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Tela de Conclusão */
          <div className="bg-white/90 rounded-3xl p-8 sm:p-12 shadow-2xl text-center">
            <div className="text-6xl sm:text-8xl mb-6">🎉</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-pink-900 mb-4">
              Jogo Completo!
            </h2>
            <div className="text-5xl sm:text-6xl font-bold text-green-600 mb-6">
              {score} / {associations.length}
            </div>
            <p className="text-xl sm:text-2xl text-pink-700 mb-8">
              {score === associations.length
                ? "Excelente! Você acertou todas! 🌟"
                : `Você acertou ${score} de ${associations.length} questões!`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xl sm:text-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                🔄 Jogar Novamente
              </button>
              <button
                onClick={() => router.push(`/kid/games?childId=${childId}`)}
                className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-green-500 hover:bg-green-600 text-white font-bold text-xl sm:text-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                🎮 Outros Jogos
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AssociationPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4">
            <Penguin size={240} />
          </div>
          <p className="text-2xl font-bold text-pink-900">Carregando...</p>
        </div>
      </main>
    }>
      <AssociationGame />
    </Suspense>
  );
}

