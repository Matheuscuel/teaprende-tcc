"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";

// Emoções com SVGs coloridos
const EMOTIONS = {
  feliz: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="#FFD700" stroke="#FFA500" stroke-width="3"/>
      <circle cx="75" cy="85" r="8" fill="#1B1B1B"/>
      <circle cx="125" cy="85" r="8" fill="#1B1B1B"/>
      <path d="M 70 130 Q 100 150 130 130" stroke="#1B1B1B" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`,
    name: "Feliz"
  },
  triste: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="#87CEEB" stroke="#4682B4" stroke-width="3"/>
      <circle cx="75" cy="85" r="8" fill="#1B1B1B"/>
      <circle cx="125" cy="85" r="8" fill="#1B1B1B"/>
      <path d="M 70 130 Q 100 110 130 130" stroke="#1B1B1B" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`,
    name: "Triste"
  },
  raiva: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="#FF6347" stroke="#DC143C" stroke-width="3"/>
      <path d="M 70 80 L 85 75 L 80 90 Z" fill="#1B1B1B"/>
      <path d="M 130 80 L 115 75 L 120 90 Z" fill="#1B1B1B"/>
      <path d="M 70 130 Q 100 120 130 130" stroke="#1B1B1B" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`,
    name: "Com raiva"
  },
  surpreso: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="#FFD700" stroke="#FFA500" stroke-width="3"/>
      <circle cx="100" cy="85" r="12" fill="#1B1B1B"/>
      <circle cx="100" cy="85" r="6" fill="#FFFFFF"/>
      <path d="M 100 130 Q 100 140 100 150" stroke="#1B1B1B" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`,
    name: "Surpreso"
  },
  medo: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="#9370DB" stroke="#8B008B" stroke-width="3"/>
      <circle cx="75" cy="85" r="10" fill="#1B1B1B"/>
      <circle cx="125" cy="85" r="10" fill="#1B1B1B"/>
      <path d="M 70 130 Q 100 120 130 130" stroke="#1B1B1B" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`,
    name: "Medo"
  }
};

const questions = [
  { emotion: "feliz", options: ["Feliz", "Triste", "Com raiva", "Surpreso"] },
  { emotion: "triste", options: ["Feliz", "Triste", "Medo", "Surpreso"] },
  { emotion: "raiva", options: ["Feliz", "Triste", "Com raiva", "Medo"] },
  { emotion: "surpreso", options: ["Feliz", "Surpreso", "Com raiva", "Triste"] },
  { emotion: "medo", options: ["Medo", "Feliz", "Triste", "Surpreso"] }
];

function EmotionsGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childId = searchParams?.get('childId') || 1;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentEmotion = questions[currentQuestion].emotion;
  const correctAnswer = EMOTIONS[currentEmotion].name;

  const handleAnswer = (option) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      if (currentQuestion + 1 < questions.length) {
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

  const progress = ((currentQuestion + (completed ? 1 : 0)) / questions.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900">
              Emoções 😊
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-blue-700 font-semibold">
            Identifique a emoção mostrada!
          </p>
        </div>

        {/* Progresso */}
        <div className="bg-white/80 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-lg sm:text-xl font-bold text-blue-900">
              Questão {currentQuestion + 1} de {questions.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-lg sm:text-xl font-bold text-blue-900">
                Pontos: <span className="text-green-500">{score}</span>
              </span>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!completed ? (
          <>
            {/* Área da Emoção */}
            <div className="bg-white/90 rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6">
                  Como esta pessoa está se sentindo?
                </h2>
                <div 
                  className="mx-auto w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: EMOTIONS[currentEmotion].svg }}
                />
              </div>

              {/* Opções */}
              <div className="grid grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option) => {
                  const isSelected = selectedOption === option;
                  const isCorrectOption = option === correctAnswer;
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
                        ${!showFeedback && !isSelected ? 'bg-blue-400 hover:bg-blue-500 text-white' : ''}
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
                    {isCorrect ? '🎉 Parabéns! Você acertou!' : `❌ A resposta correta é: ${correctAnswer}`}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Tela de Conclusão */
          <div className="bg-white/90 rounded-3xl p-8 sm:p-12 shadow-2xl text-center">
            <div className="text-6xl sm:text-8xl mb-6">🎉</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
              Jogo Completo!
            </h2>
            <div className="text-5xl sm:text-6xl font-bold text-green-600 mb-6">
              {score} / {questions.length}
            </div>
            <p className="text-xl sm:text-2xl text-blue-700 mb-8">
              {score === questions.length
                ? "Excelente! Você acertou todas! 🌟"
                : `Você acertou ${score} de ${questions.length} questões!`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl sm:text-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
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

export default function EmotionsPage() {
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
      <EmotionsGame />
    </Suspense>
  );
}
