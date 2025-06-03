"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import api from "../services/api"


const Games = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    level: "",
    category: "",
  })

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get("/games")
        setGames(response.data)
      } catch (error) {
        console.error("Erro ao carregar jogos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const filteredGames = games.filter((game) => {
    if (filter.level && game.level !== filter.level) return false
    if (filter.category && game.category !== filter.category) return false
    return true
  })

  const levels = ["Iniciante", "Intermediário", "Avançado"]
  const categories = [...new Set(games.map((game) => game.category))]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando jogos...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Jogos Educativos</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filter.level}
            onChange={(e) => setFilter({ ...filter, level: e.target.value })}
          >
            <option value="">Todos os níveis</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <div key={game.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={game.imageUrl || "/placeholder.svg?height=200&width=300"}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{game.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {game.level}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{game.description}</p>
                <div className="mt-4">
                  <Link
                    to={`/games/${game.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Jogar
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Nenhum jogo encontrado com os filtros selecionados.</p>
              <button
                onClick={() => setFilter({ level: "", category: "" })}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Games
