"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

export default function Games() {
  const games = [
    {
      id: "emotions",
      title: "Reconhecimento de Emoções",
      description: "Aprenda a identificar diferentes expressões faciais e emoções.",
      level: "Iniciante",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "social-scenarios",
      title: "Cenários Sociais",
      description: "Pratique respostas apropriadas em diferentes situações sociais.",
      level: "Intermediário",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "conversation",
      title: "Conversação",
      description: "Desenvolva habilidades de diálogo e comunicação verbal.",
      level: "Avançado",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "turn-taking",
      title: "Revezamento",
      description: "Aprenda a esperar sua vez e compartilhar em atividades em grupo.",
      level: "Iniciante",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "facial-expressions",
      title: "Expressões Faciais",
      description: "Combine expressões faciais com as emoções correspondentes.",
      level: "Intermediário",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "problem-solving",
      title: "Resolução de Problemas Sociais",
      description: "Encontre soluções para desafios sociais do dia a dia.",
      level: "Avançado",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

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
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Jogos Educativos</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline">Filtrar por Nível</Button>
            <Button variant="outline">Filtrar por Habilidade</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Card key={game.id} className="overflow-hidden">
              <img src={game.image || "/placeholder.svg"} alt={game.title} className="w-full h-48 object-cover" />
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{game.title}</CardTitle>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{game.level}</span>
                </div>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href={`/games/${game.id}`} className="w-full">
                  <Button className="w-full">Jogar</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
