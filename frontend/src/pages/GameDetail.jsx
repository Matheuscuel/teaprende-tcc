"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"



const GameDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [game, setGame] = useState(null)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState("")
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const [gameResponse, childrenResponse] = await Promise.all([
          api.get(`/games/${id}`),
          api.get("/users/children"),
        ])

        setGame(gameResponse.data)
        setChildren(childrenResponse.data)

        if (childrenResponse.data.length > 0) {
          setSelectedChild(childrenResponse.data[0].id)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do jogo:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [id])

  const handleStartGame = () => {
    if (!selectedChild) {
      alert("Por favor, selecione uma criança para jogar.")
      return
    }

    setGameStarted(true)
  }

  const handleCompleteGame = async (finalScore) => {
    setScore(finalScore)
    setGameCompleted(true)

    try {
      await api.post("/games/progress", {
        gameId: id,
        childId: selectedChild,
        score: finalScore,
      })
    } catch (error) {
      console.error("Erro ao salvar progresso do jogo:", error)
    }
  }

  const handlePlayAgain = () => {
    setGameStarted(true)
    setGameCompleted(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando jogo...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!game) {
    return (
      <Layout>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">Jogo não encontrado.</p>
            <button
              onClick={() => navigate("/games")}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Voltar para Jogos
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {!gameStarted ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{game.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {game.category} - {game.level}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {game.level}
            </span>
          </div>
          <div className="border-t border-gray-200">
            <div className="h-64 w-full overflow-hidden">
              <img
                src={game.imageUrl || "/placeholder.svg?height=300&width=800"}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Descrição</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{game.description}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Instruções</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{game.instructions}</dd>
              </div>
              {(user?.role === "terapeuta" || user?.role === "professor" || user?.role === "responsavel") && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Selecione a criança</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {children.length > 0 ? (
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                      >
                        {children.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma criança cadastrada.</p>
                    )}
                  </dd>
                </div>
              )}
            </dl>
            <div className="px-4 py-5 sm:px-6 flex justify-end">
              <button
                onClick={() => navigate("/games")}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Voltar
              </button>
              <button
                onClick={handleStartGame}
                disabled={children.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                Iniciar Jogo
              </button>
            </div>
          </div>
        </div>
      ) : gameCompleted ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Jogo Concluído!</h3>
            <div className="mb-6">
              <div className="text-5xl font-bold text-indigo-600 mb-2">{score}%</div>
              <p className="text-sm text-gray-500">Pontuação</p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePlayAgain}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Jogar Novamente
              </button>
              <button
                onClick={() => navigate("/games")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Voltar aos Jogos
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Aqui seria implementado o jogo específico baseado no ID */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{game.title}</h3>

            {/* Exemplo de um jogo simples de reconhecimento de emoções */}
            {game.category === "Reconhecimento de Emoções" && <EmotionsGame onComplete={handleCompleteGame} />}

            {/* Outros tipos de jogos seriam implementados de forma similar */}
            {game.category !== "Reconhecimento de Emoções" && (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Implementação do jogo "{game.title}" estaria aqui.</p>
                <button
                  onClick={() => handleCompleteGame(Math.floor(Math.random() * 100))}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Simular Conclusão do Jogo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}

// Componente de exemplo para um jogo de reconhecimento de emoções

const EmotionsGame = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)

  const questions = [
    {
      image: "/placeholder.svg?height=200&width=200",
      question: "Como esta pessoa está se sentindo?",
      options: ["Feliz", "Triste", "Com raiva", "Surpreso"],
      answer: "Feliz",
    },
    {
      image: "/placeholder.svg?height=200&width=200",
      question: "Qual emoção esta expressão representa?",
      options: ["Medo", "Tristeza", "Alegria", "Nojo"],
      answer: "Tristeza",
    },
    {
      image: "/placeholder.svg?height=200&width=200",
      question: "O que esta pessoa está sentindo?",
      options: ["Confusão", "Surpresa", "Raiva", "Vergonha"],
      answer: "Surpresa",
    },
    {
      image: "/placeholder.svg?height=200&width=200",
      question: "Identifique a emoção mostrada:",
      options: ["Raiva", "Medo", "Ansiedade", "Entusiasmo"],
      answer: "Raiva",
    },
    {
      image: "/placeholder.svg?height=200&width=200",
      question: "Qual sentimento está sendo demonstrado?",
      options: ["Orgulho", "Curiosidade", "Medo", "Tédio"],
      answer: "Medo",
    },
  ]

  const handleAnswer = (option) => {
    setSelectedOption(option)

    setTimeout(() => {
      if (option === questions[currentQuestion].answer) {
        setScore(score + 1)
      }

      const nextQuestion = currentQuestion + 1

      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion)
        setSelectedOption(null)
      } else {
        const finalScore = Math.round(
          ((score + (option === questions[currentQuestion].answer ? 1 : 0)) / questions.length) * 100,
        )
        onComplete(finalScore)
      }
    }, 1000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">
          Questão {currentQuestion + 1} de {questions.length}
        </span>
        <span className="text-sm font-medium text-gray-500">Pontuação: {score}</span>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">{questions[currentQuestion].question}</h4>
        <div className="flex justify-center mb-6">
          <img
            src={questions[currentQuestion].image || "/placeholder.svg"}
            alt="Expressão facial"
            className="w-48 h-48 object-cover rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {questions[currentQuestion].options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={selectedOption !== null}
              className={`
                py-3 px-4 rounded-md text-sm font-medium
                ${
                  selectedOption === option
                    ? option === questions[currentQuestion].answer
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-red-100 text-red-800 border-red-300"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }
                ${selectedOption !== null && option !== selectedOption ? "opacity-50" : ""}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

export default GameDetail
