"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

export default function Reports() {
  const [selectedChild, setSelectedChild] = useState("1")
  const [dateRange, setDateRange] = useState("month")

  // Mock data for charts and reports
  const progressData = {
    labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    datasets: [
      {
        label: "Reconhecimento de Emoções",
        data: [65, 70, 75, 85],
      },
      {
        label: "Interação Social",
        data: [40, 45, 55, 60],
      },
      {
        label: "Comunicação",
        data: [50, 55, 60, 70],
      },
    ],
  }

  const timeSpentData = {
    labels: ["Reconhecimento de Emoções", "Cenários Sociais", "Conversação", "Revezamento"],
    datasets: [
      {
        label: "Tempo (minutos)",
        data: [45, 30, 20, 15],
      },
    ],
  }

  const skillsData = {
    categories: ["Reconhecimento Emocional", "Comunicação", "Interação Social", "Atenção Compartilhada"],
    scores: [75, 60, 50, 65],
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
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <div className="flex items-center space-x-2">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar criança" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Lucas Silva</SelectItem>
                <SelectItem value="2">Maria Oliveira</SelectItem>
                <SelectItem value="3">Pedro Santos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="skills">Habilidades</TabsTrigger>
            <TabsTrigger value="time">Tempo de Atividade</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progresso ao Longo do Tempo</CardTitle>
                <CardDescription>Evolução nas diferentes áreas de desenvolvimento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {/* In a real application, this would be a chart component */}
                  <div className="flex flex-col space-y-2">
                    {progressData.datasets.map((dataset, index) => (
                      <div key={index}>
                        <p className="font-medium">{dataset.label}</p>
                        <div className="h-6 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${dataset.data[dataset.data.length - 1]}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-right">{dataset.data[dataset.data.length - 1]}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Desenvolvimento de Habilidades</CardTitle>
                <CardDescription>Nível atual em cada categoria de habilidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {/* In a real application, this would be a radar chart */}
                  <div className="grid gap-4">
                    {skillsData.categories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">{skillsData.scores[index]}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${skillsData.scores[index]}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tempo Dedicado às Atividades</CardTitle>
                <CardDescription>Distribuição do tempo entre os diferentes jogos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {/* In a real application, this would be a bar chart */}
                  <div className="space-y-4">
                    {timeSpentData.labels.map((label, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">
                            {timeSpentData.datasets[0].data[index]} min
                          </span>
                        </div>
                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(timeSpentData.datasets[0].data[index] / Math.max(...timeSpentData.datasets[0].data)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recomendações Personalizadas</CardTitle>
                <CardDescription>Sugestões baseadas no desempenho atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Foco em Comunicação</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Recomendamos dedicar mais tempo aos jogos de conversação para melhorar as habilidades de
                      comunicação.
                    </p>
                    <Button variant="outline" size="sm">
                      Ver Jogos Recomendados
                    </Button>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Prática de Interação Social</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Atividades em grupo podem ajudar a desenvolver melhor as habilidades de interação social.
                    </p>
                    <Button variant="outline" size="sm">
                      Ver Atividades Sugeridas
                    </Button>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Manter Consistência</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Continue com a frequência atual nos jogos de reconhecimento de emoções, onde tem mostrado bom
                      progresso.
                    </p>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
