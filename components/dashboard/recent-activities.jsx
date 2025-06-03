import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivities() {
  const activities = [
    {
      child: "Lucas Silva",
      avatar: "LS",
      game: "Reconhecimento de Emoções",
      score: "85%",
      time: "15 minutos",
      date: "Hoje, 14:30",
    },
    {
      child: "Maria Oliveira",
      avatar: "MO",
      game: "Cenários Sociais",
      score: "70%",
      time: "20 minutos",
      date: "Hoje, 11:15",
    },
    {
      child: "Pedro Santos",
      avatar: "PS",
      game: "Conversação",
      score: "65%",
      time: "25 minutos",
      date: "Ontem, 16:45",
    },
    {
      child: "Lucas Silva",
      avatar: "LS",
      game: "Revezamento",
      score: "90%",
      time: "10 minutos",
      date: "Ontem, 15:20",
    },
    {
      child: "Maria Oliveira",
      avatar: "MO",
      game: "Expressões Faciais",
      score: "75%",
      time: "18 minutos",
      date: "Há 2 dias, 10:30",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Últimas atividades realizadas pelas crianças</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt={activity.child} />
                <AvatarFallback>{activity.avatar}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.child}</p>
                <p className="text-sm text-muted-foreground">
                  Jogou <span className="font-medium">{activity.game}</span>
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-medium">{activity.score}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.time} • {activity.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
