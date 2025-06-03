"use client"

import { createContext, useState, useEffect, useContext } from "react"
import api from "../services/api"

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = localStorage.getItem("@TEAprende:token")
      const storedUser = localStorage.getItem("@TEAprende:user")

      if (storedToken && storedUser) {
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
        setUser(JSON.parse(storedUser))
      }

      setLoading(false)
    }

    loadStorageData()
  }, [])

  async function signIn(email, password) {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      })

      const { token, user } = response.data

      localStorage.setItem("@TEAprende:token", token)
      localStorage.setItem("@TEAprende:user", JSON.stringify(user))

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser(user)
    } catch (error) {
      throw error
    }
  }

  function signOut() {
    localStorage.removeItem("@TEAprende:token")
    localStorage.removeItem("@TEAprende:user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}

