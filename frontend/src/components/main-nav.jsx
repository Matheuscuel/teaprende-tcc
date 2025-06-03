import { Link } from "react-router-dom"
import { Home, Gamepad, BarChart3, Users } from "lucide-react"

const MainNav = () => {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link to="/dashboard" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
        <Home className="mr-2 h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/games"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Gamepad className="mr-2 h-4 w-4" />
        <span>Jogos</span>
      </Link>
      <Link
        to="/reports"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <BarChart3 className="mr-2 h-4 w-4" />
        <span>Relatórios</span>
      </Link>
      <Link
        to="/children"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Users className="mr-2 h-4 w-4" />
        <span>Crianças</span>
      </Link>
    </nav>
  )
}

export default MainNav

