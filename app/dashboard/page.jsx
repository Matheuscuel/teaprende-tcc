"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserNav } from "@/components/user-nav"
import { MainNav } from "@/components/main-nav"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { ChildrenList } from "@/components/dashboard/children-list"

export default function Dashboard() {
  const [userType] = useState("responsavel") // In a real app, this would come from authentication

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
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/add-child">
              <Button>Adicionar Criança</Button>
            </Link>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="children">Crianças</TabsTrigger>
            <TabsTrigger value="activities">Atividades Recentes</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Overview />
          </TabsContent>
          <TabsContent value="children" className="space-y-4">
            <ChildrenList />
          </TabsContent>
          <TabsContent value="activities" className="space-y-4">
            <RecentActivities />
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>Visualize relatórios detalhados sobre o progresso das crianças.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Relatório de Progresso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Mensal</div>
                      <p className="text-xs text-muted-foreground">Visão geral do progresso mensal</p>
                      <Button variant="outline" className="w-full mt-4">
                        Ver Relatório
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Habilidades Desenvolvidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Por Área</div>
                      <p className="text-xs text-muted-foreground">Análise por área de desenvolvimento</p>
                      <Button variant="outline" className="w-full mt-4">
                        Ver Relatório
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tempo de Atividade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Semanal</div>
                      <p className="text-xs text-muted-foreground">Tempo dedicado às atividades</p>
                      <Button variant="outline" className="w-full mt-4">
                        Ver Relatório
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
