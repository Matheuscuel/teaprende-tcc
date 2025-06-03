"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Layout from "../components/Layout"
import api from "../services/api"




const Reports = () => {
  const [searchParams] = useSearchParams()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState("")
  const [dateRange, setDateRange] = useState("month")
  const [progressData, setProgressData] = useState([])
  const [skillsData, setSkillsData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await api.get("/users/children")
        setChildren(response.data)

        const childIdFromUrl = searchParams.get("childId")
        if (childIdFromUrl && response.data.some((child: Child) => child.id === childIdFromUrl)) {
          setSelectedChild(childIdFromUrl)
        } else if (response.data.length > 0) {
          setSelectedChild(response.data[0].id)
        }
      } catch (error) {
        console.error("Erro ao carregar crianças:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChildren()
  }, [searchParams])

  useEffect(() => {
    if (selectedChild) {
      fetchReportData()
    }
  }, [selectedChild, dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const [progressResponse, skillsResponse] = await Promise.all([
        api.get(`/reports/progress/${selectedChild}?period=${dateRange}`),
        api.get(`/reports/skills/${selectedChild}`),
      ])

      setProgressData(progressResponse.data)
      setSkillsData(skillsResponse.data)
    } catch (error) {
      console.error("Erro ao carregar dados dos relatórios:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando relatórios...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
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

          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último ano</option>
          </select>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">Nenhuma criança cadastrada para gerar relatórios.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Progresso ao Longo do Tempo</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Evolução nas diferentes atividades</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {progressData.length > 0 ? (
                <div className="space-y-6">
                  {progressData.map((game) => (
                    <div key={game.gameId} className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">{game.gameName}</h4>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                              Progresso
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-indigo-600">
                              {game.scores[game.scores.length - 1]}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                          <div
                            style={{ width: `${game.scores[game.scores.length - 1]}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          {game.dates.map((date, index) => (
                            <span key={index}>{new Date(date).toLocaleDateString()}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Nenhum dado de progresso disponível para o período selecionado.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Desenvolvimento de Habilidades</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Nível atual em cada categoria de habilidade</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {skillsData.length > 0 ? (
                <div className="space-y-4">
                  {skillsData.map((skill) => (
                    <div key={skill.skill} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                        <span className="text-sm text-gray-500">{skill.score}%</span>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                        <div
                          style={{ width: `${skill.score}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">Nenhum dado de habilidades disponível.</p>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recomendações</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Sugestões baseadas no desempenho atual</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {skillsData.length > 0 ? (
                    <>
                      {skillsData
                        .sort((a, b) => a.score - b.score)
                        .slice(0, 2)
                        .map((skill) => (
                          <div key={skill.skill} className="rounded-md bg-yellow-50 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg
                                  className="h-5 w-5 text-yellow-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Foco em {skill.skill}</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                  <p>
                                    Recomendamos dedicar mais tempo aos jogos relacionados a {skill.skill.toLowerCase()}{" "}
                                    para melhorar esta habilidade.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      {skillsData
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 1)
                        .map((skill) => (
                          <div key={`strength-${skill.skill}`} className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg
                                  className="h-5 w-5 text-green-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Ponto forte: {skill.skill}</h3>
                                <div className="mt-2 text-sm text-green-700">
                                  <p>
                                    Continue com a frequência atual nos jogos de {skill.skill.toLowerCase()}, onde tem
                                    mostrado bom progresso.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </>
                  ) : (
                    <p className="text-center text-gray-500">
                      Nenhuma recomendação disponível. Continue jogando para gerar recomendações personalizadas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

export default Reports
