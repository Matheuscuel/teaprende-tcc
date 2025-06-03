import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function ChildrenList() {
  const children = [
    {
      id: 1,
      name: "Lucas Silva",
      avatar: "LS",
      age: 8,
      progress: 75,
      lastActivity: "Hoje, 14:30",
      games: ["Reconhecimento de Emoções", "Revezamento"],
    },
    {
      id: 2,
      name: "Maria Oliveira",
      avatar: "MO",
      age: 7,
      progress: 60,
      lastActivity: "Hoje, 11:15",
      games: ["Cenários Sociais", "Expressões Faciais"],
    },
    {
      id: 3,
      name: "Pedro Santos",
      avatar: "PS",
      age: 9,
      progress: 45,
      lastActivity: "Ontem, 16:45",
      games: ["Conversação"],
    },
  ]

  return (
    <div className="grid gap-4">
      {children.map((child) => (
        <Card key={child.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt={child.name} />
                  <AvatarFallback>{child.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{child.name}</CardTitle>
                  <CardDescription>{child.age} anos</CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href={`/children/${child.id}`}>
                  <Button variant="outline" size="sm">
                    Ver Perfil
                  </Button>
                </Link>
                <Link href={`/reports?child=${child.id}`}>
                  <Button size="sm">Ver Relatórios</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso Geral</span>
                  <span className="font-medium">{child.progress}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${child.progress}%` }}></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Última atividade: {child.lastActivity}</span>
                <div className="flex flex-wrap gap-2">
                  {child.games.map((game) => (
                    <Badge key={game} variant="outline">
                      {game}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
