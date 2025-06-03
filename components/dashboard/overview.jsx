import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Overview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crianças Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">+1 desde o último mês</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jogos Completados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">+8 desde a semana passada</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Total de Jogo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5h 23m</div>
          <p className="text-xs text-muted-foreground">+1h 12m desde a semana passada</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">68%</div>
          <p className="text-xs text-muted-foreground">+5% desde o último mês</p>
        </CardContent>
      </Card>
    </div>
  )
}
