"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { toast } from "@/components/ui/use-toast"

export default function EmotionsGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const questions = [
    {
      id: 1,
      image: "/placeholder.svg?height=200&width=200",
      question: "Como esta pessoa está se sentindo?",
      options: ["Feliz", "Triste", "Com raiva", "Surpreso"],
      answer: "Feliz",
    },
    {
      id: 2,
      image: "/placeholder.svg?height=200&width=200",
      question: "Qual emoção esta expressão representa?",
      options: ["Medo", "Tristeza", "Alegria", "Nojo"],
      answer: "Tristeza",
    },
    {
      id: 3,
      image: "/placeholder.svg?height=200&width=200",
      question: "O que esta pessoa está sentindo?",
      options: ["Confusão", "Surpresa", "Raiva", "Vergonha"],
      answer: "Surpresa",
    },
    {
      id: 4,
      image: "/placeholder.svg?height=200&width=200",
      question: "Identifique a emoção mostrada:",
      options: ["Raiva", "Medo", "Ansiedade", "Entusiasmo"],
      answer: "Raiva",
    },
    {
      id: 5,
      image: "/placeholder.svg?height=200&width=200",
      question: "Qual sentimento está sendo demonstrado?",
      options: ["Orgulho", "Curiosidade", "Medo", "Tédio"],
      answer: "Medo",
    },
  ]

  useEffect(() => {
    setProgress((currentQuestion / questions.length) * 100)
  }, [currentQuestion, questions.length])

  const handleAnswer = (option) => {
    setSelectedOption(option)

    setTimeout(() => {
      if (option === questions[currentQuestion].answer) {
        setScore(score + 1)
        toast({
          title: "Correto!",
          description: "Muito bem! Você acertou.",
          variant: "default",
        })
      } else {
        toast({
          title: "Incorreto",
          description: `A resposta correta era: ${questions[currentQuestion].answer}`,
          variant: "destructive",
        })
      }

      const nextQuestion = currentQuestion + 1

      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion)
        setSelectedOption(null)
      } else {
        setGameComplete(true)
      }
    }, 1000)
  }

  const resetGame = () => {
    setCurrentQuestion(0)
    setScore(0)
    setGameComplete(false)
    setSelectedOption(null)
    setProgress(0)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Reconhecimento de Emoções</h2>
          <Link href="/games">
            <Button variant="outline">Voltar aos Jogos</Button>
          </Link>
        </div>

        <Progress value={progress} className="mb-6" />

        {!gameComplete ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>
                Questão {currentQuestion + 1} de {questions.length}
              </CardTitle>
              <CardDescription>{questions[currentQuestion].question}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <img
                src={questions[currentQuestion].image || "/placeholder.svg"}
                alt="Expressão facial"
                className="w-48 h-48 object-cover mb-6 rounded-lg"
              />

              <div className="grid grid-cols-2 gap-4 w-full">
                {questions[currentQuestion].options.map((option) => (
                  <Button
                    key={option}
                    variant={
                      selectedOption === option
                        ? option === questions[currentQuestion].answer
                          ? "default"
                          : "destructive"
                        : "outline"
                    }
                    className="h-16 text-lg"
                    onClick={() => handleAnswer(option)}
                    disabled={selectedOption !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-3xl mx-auto text-center">
            <CardHeader>
              <CardTitle>Jogo Completo!</CardTitle>
              <CardDescription>Veja como você se saiu</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="text-6xl font-bold mb-4">
                {score} / {questions.length}
              </div>
              <p className="text-xl mb-6">
                {score === questions.length
                  ? "Excelente! Você acertou todas as questões!"
                  : `Você acertou ${score} de ${questions.length} questões.`}
              </p>
              <div className="flex gap-4">
                <Button onClick={resetGame}>Jogar Novamente</Button>
                <Link href="/games">
                  <Button variant="outline">Outros Jogos</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
