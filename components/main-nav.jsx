import Link from "next/link"
import { Home, GamepadIcon, BarChart3, Users } from "lucide-react"

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/dashboard" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
        <Home className="mr-2 h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      <Link
        href="/games"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <GamepadIcon className="mr-2 h-4 w-4" />
        <span>Jogos</span>
      </Link>
      <Link
        href="/reports"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <BarChart3 className="mr-2 h-4 w-4" />
        <span>Relatórios</span>
      </Link>
      <Link
        href="/children"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Users className="mr-2 h-4 w-4" />
        <span>Crianças</span>
      </Link>
    </nav>
  )
}
