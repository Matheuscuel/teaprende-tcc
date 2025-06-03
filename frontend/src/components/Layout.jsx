"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { HomeIcon, GamepadIcon, BarChartIcon, UsersIcon, UserIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react"

const Layout = ({ children }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = () => {
    signOut()
    navigate("/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Jogos", href: "/games", icon: GamepadIcon },
    { name: "Relatórios", href: "/reports", icon: BarChartIcon },
    { name: "Usuários", href: "/users", icon: UsersIcon, roles: ["terapeuta", "professor"] },
    { name: "Perfil", href: "/profile", icon: UserIcon },
  ]

  const filteredNavigation = navigation.filter((item) => !item.roles || (user && item.roles.includes(user.role)))

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0">
              <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setSidebarOpen(false)}></div>
            </div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-700">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fechar menu</span>
                  <XIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-white font-bold text-xl">TEAprende</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        location.pathname === item.href ? "bg-indigo-800 text-white" : "text-white hover:bg-indigo-600"
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
                <button
                  onClick={handleSignOut}
                  className="flex-shrink-0 group block text-white hover:bg-indigo-600 w-full px-2 py-2 rounded-md"
                >
                  <div className="flex items-center">
                    <div>
                      <LogOutIcon className="h-6 w-6 mr-3" />
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium">Sair</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-indigo-700">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-white font-bold text-xl">TEAprende</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href ? "bg-indigo-800 text-white" : "text-white hover:bg-indigo-600"
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <button
                onClick={handleSignOut}
                className="flex-shrink-0 group block text-white hover:bg-indigo-600 w-full px-2 py-2 rounded-md"
              >
                <div className="flex items-center">
                  <div>
                    <LogOutIcon className="h-6 w-6 mr-3" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Sair</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir menu</span>
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

