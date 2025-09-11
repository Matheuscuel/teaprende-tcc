"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children }) => {
  const { signed, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }

  if (!signed) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute

