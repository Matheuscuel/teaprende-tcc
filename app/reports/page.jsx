"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BackButton from "@/app/components/BackButton"
import { getCurrentUser } from "@/app/lib/auth"
import { getDefaultRoute } from "@/app/lib/auth"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api"

// Função melhorada para exportar PDF
function exportToPDF(childName, childId, dateRange, reportData) {
  const printWindow = window.open('', '_blank');
  
  const dateRangeText = {
    week: "Última semana",
    month: "Último mês",
    quarter: "Último trimestre",
    year: "Último ano"
  }[dateRange] || dateRange;

  const today = new Date().toLocaleDateString('pt-BR');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Relatório - ${childName}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            padding: 40px; 
            color: #333;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1e40af;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .info-section {
            margin-bottom: 25px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .info-section h2 {
            color: #1e40af;
            font-size: 20px;
            margin-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
          }
          .progress-item {
            margin-bottom: 20px;
          }
          .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
          }
          .progress-bar {
            background: #e5e7eb;
            height: 24px;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
          }
          .progress-fill {
            background: linear-gradient(90deg, #3b82f6, #2563eb);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
            color: white;
            font-weight: bold;
            font-size: 12px;
            transition: width 0.3s ease;
          }
          .skill-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
          }
          .recommendation-card {
            background: white;
            border: 1px solid #ddd;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
          }
          .recommendation-card h3 {
            color: #1e40af;
            margin-bottom: 8px;
            font-size: 16px;
          }
          .recommendation-card p {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório de Progresso</h1>
          <p><strong>Criança:</strong> ${childName}</p>
          <p><strong>Período:</strong> ${dateRangeText}</p>
          <p><strong>Data do Relatório:</strong> ${today}</p>
        </div>

        <div class="info-section">
          <h2>📈 Progresso ao Longo do Tempo</h2>
          <div class="progress-item">
            <div class="progress-label">
              <span>Reconhecimento de Emoções</span>
              <span>85%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 85%">85%</div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-label">
              <span>Interação Social</span>
              <span>60%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 60%">60%</div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-label">
              <span>Comunicação</span>
              <span>70%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 70%">70%</div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>⭐ Desenvolvimento de Habilidades</h2>
          <div class="skill-grid">
            <div class="progress-item">
              <div class="progress-label">
                <span>Reconhecimento Emocional</span>
                <span>75%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 75%">75%</div>
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>Comunicação</span>
                <span>60%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 60%">60%</div>
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>Interação Social</span>
                <span>50%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 50%">50%</div>
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>Atenção Compartilhada</span>
                <span>65%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 65%">65%</div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>⏱️ Tempo Dedicado às Atividades</h2>
          <div class="progress-item">
            <div class="progress-label">
              <span>Reconhecimento de Emoções</span>
              <span>45 min</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 100%">45 min</div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-label">
              <span>Cenários Sociais</span>
              <span>30 min</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 67%">30 min</div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-label">
              <span>Conversação</span>
              <span>20 min</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 44%">20 min</div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-label">
              <span>Revezamento</span>
              <span>15 min</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 33%">15 min</div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>💡 Recomendações Personalizadas</h2>
          <div class="recommendation-card">
            <h3>Foco em Comunicação</h3>
            <p>Recomendamos dedicar mais tempo aos jogos de conversação para melhorar as habilidades de comunicação.</p>
          </div>
          <div class="recommendation-card">
            <h3>Prática de Interação Social</h3>
            <p>Atividades em grupo podem ajudar a desenvolver melhor as habilidades de interação social.</p>
          </div>
          <div class="recommendation-card">
            <h3>Manter Consistência</h3>
            <p>Continue com a frequência atual nos jogos de reconhecimento de emoções, onde tem mostrado bom progresso.</p>
          </div>
        </div>

        <div class="footer">
          <p>Relatório gerado automaticamente pelo sistema TEAprende</p>
          <p>Para mais informações, entre em contato com o administrador do sistema.</p>
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

export default function Reports() {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedChildName, setSelectedChildName] = useState("");
  const [dateRange, setDateRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);

  // Carregar crianças associadas ao usuário
  useEffect(() => {
    loadChildren();
  }, []);

  // Carregar dados do relatório quando criança ou período mudar
  useEffect(() => {
    if (selectedChild) {
      loadReportData();
    }
  }, [selectedChild, dateRange]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token") || "demo-token";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }

      const response = await fetch(`${API_BASE}/children`, { headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Erro ao carregar crianças");
      }

      const data = await response.json();
      const childrenList = data.children || data || [];
      
      setChildren(childrenList);
      
      // Selecionar automaticamente a primeira criança se houver apenas uma
      if (childrenList.length === 1) {
        setSelectedChild(String(childrenList[0].id));
        setSelectedChildName(childrenList[0].name);
      } else if (childrenList.length > 0) {
        // Selecionar a primeira por padrão
        setSelectedChild(String(childrenList[0].id));
        setSelectedChildName(childrenList[0].name);
      }
    } catch (err) {
      console.error("Erro ao carregar crianças:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async () => {
    // Por enquanto, usar dados mockados
    // Em produção, buscar dados reais do backend
    setReportData({
      progress: {
        emotions: 85,
        social: 60,
        communication: 70
      },
      skills: {
        emotional: 75,
        communication: 60,
        social: 50,
        attention: 65
      },
      timeSpent: {
        emotions: 45,
        scenarios: 30,
        conversation: 20,
        turnTaking: 15
      }
    });
  };

  const handleChildChange = (childId) => {
    setSelectedChild(childId);
    const child = children.find(c => String(c.id) === childId);
    if (child) {
      setSelectedChildName(child.name);
    }
  };

  const handleExportPDF = () => {
    if (!selectedChild) {
      alert("Por favor, selecione uma criança primeiro.");
      return;
    }
    exportToPDF(selectedChildName || "Criança", selectedChild, dateRange, reportData);
  };

  const user = getCurrentUser();
  const dashboardRoute = user?.role ? getDefaultRoute(user.role) : "/";

  // Mock data (será substituído por dados reais do backend)
  const progressData = {
    labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    datasets: [
      {
        label: "Reconhecimento de Emoções",
        data: [65, 70, 75, reportData?.progress?.emotions || 85],
      },
      {
        label: "Interação Social",
        data: [40, 45, 55, reportData?.progress?.social || 60],
      },
      {
        label: "Comunicação",
        data: [50, 55, 60, reportData?.progress?.communication || 70],
      },
    ],
  };

  const timeSpentData = {
    labels: ["Reconhecimento de Emoções", "Cenários Sociais", "Conversação", "Revezamento"],
    datasets: [
      {
        label: "Tempo (minutos)",
        data: [
          reportData?.timeSpent?.emotions || 45,
          reportData?.timeSpent?.scenarios || 30,
          reportData?.timeSpent?.conversation || 20,
          reportData?.timeSpent?.turnTaking || 15,
        ],
      },
    ],
  };

  const skillsData = {
    categories: ["Reconhecimento Emocional", "Comunicação", "Interação Social", "Atenção Compartilhada"],
    scores: [
      reportData?.skills?.emotional || 75,
      reportData?.skills?.communication || 60,
      reportData?.skills?.social || 50,
      reportData?.skills?.attention || 65,
    ],
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-xl text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button onClick={loadChildren} className="bg-blue-600 hover:bg-blue-700 text-white">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
        <main className="flex-1 space-y-4 p-8 pt-6">
          <div className="mb-4">
            <BackButton href={dashboardRoute} />
          </div>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Relatórios</CardTitle>
              <CardDescription>Visualize relatórios de progresso das crianças</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Nenhuma criança vinculada
              </h3>
              <p className="text-gray-600 mb-6">
                Você ainda não tem crianças associadas à sua conta. Entre em contato com o administrador para vincular crianças.
              </p>
              <Button onClick={() => router.push("/children/create")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Cadastrar Criança
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      <main className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6">
        <div className="mb-4">
          <BackButton href={dashboardRoute} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">
            📊 Relatórios
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Select 
              value={selectedChild} 
              onValueChange={handleChildChange}
              disabled={children.length === 0}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Selecionar criança" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={String(child.id)}>
                    {child.name} {child.age ? `(${child.age} anos)` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleExportPDF} 
              disabled={!selectedChild}
              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              📄 Exportar PDF
            </Button>
          </div>
        </div>

        {!selectedChild && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">👆</div>
              <p className="text-lg text-gray-600">
                Selecione uma criança acima para visualizar os relatórios
              </p>
            </CardContent>
          </Card>
        )}

        {selectedChild && (
          <Tabs defaultValue="progress" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
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
                    <div className="flex flex-col space-y-4">
                      {progressData.datasets.map((dataset, index) => {
                        const currentValue = dataset.data[dataset.data.length - 1];
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="font-semibold text-gray-700">{dataset.label}</p>
                              <span className="text-sm font-bold text-blue-600">{currentValue}%</span>
                            </div>
                            <div className="h-8 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                                style={{ width: `${currentValue}%` }}
                              >
                                {currentValue >= 15 && (
                                  <span className="text-white text-xs font-bold">{currentValue}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                    <div className="grid gap-4">
                      {skillsData.categories.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-semibold text-gray-700">{category}</span>
                            <span className="text-sm font-bold text-blue-600">{skillsData.scores[index]}%</span>
                          </div>
                          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" 
                              style={{ width: `${skillsData.scores[index]}%` }}
                            ></div>
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
                    <div className="space-y-4">
                      {timeSpentData.labels.map((label, index) => {
                        const minutes = timeSpentData.datasets[0].data[index];
                        const maxMinutes = Math.max(...timeSpentData.datasets[0].data);
                        const percentage = (minutes / maxMinutes) * 100;
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-semibold text-gray-700">{label}</span>
                              <span className="text-sm font-bold text-purple-600">{minutes} min</span>
                            </div>
                            <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
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
                    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
                        💬 Foco em Comunicação
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Recomendamos dedicar mais tempo aos jogos de conversação para melhorar as habilidades de comunicação.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/kid/games?childId=${selectedChild}`)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Ver Jogos Recomendados
                      </Button>
                    </div>

                    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold mb-2 text-green-900 flex items-center gap-2">
                        👥 Prática de Interação Social
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Atividades em grupo podem ajudar a desenvolver melhor as habilidades de interação social.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/kid/tasks?childId=${selectedChild}`)}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        Ver Atividades Sugeridas
                      </Button>
                    </div>

                    <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold mb-2 text-yellow-900 flex items-center gap-2">
                        ⭐ Manter Consistência
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Continue com a frequência atual nos jogos de reconhecimento de emoções, onde tem mostrado bom progresso.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/reports?childId=${selectedChild}`)}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
