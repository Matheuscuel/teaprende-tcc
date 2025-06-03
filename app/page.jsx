import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-foreground">TEAprende</h1>
            <div className="space-x-2">
              <Link href="/login">
                <Button variant="secondary">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="bg-white hover:bg-white/90">
                  Cadastrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <section className="mb-16 text-center">
          <h2 className="text-4xl font-bold mb-4">Desenvolvimento de Habilidades Sociais para Crianças com TEA</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Uma plataforma educativa com jogos interativos para auxiliar no desenvolvimento de habilidades sociais,
            permitindo o acompanhamento por responsáveis, professores e terapeutas.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Jogos Educativos</CardTitle>
              <CardDescription>Atividades interativas e divertidas</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Jogos desenvolvidos especificamente para trabalhar habilidades sociais como reconhecimento de emoções,
                comunicação e interação social.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/games" className="w-full">
                <Button className="w-full">Conhecer Jogos</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acompanhamento Personalizado</CardTitle>
              <CardDescription>Monitoramento de progresso</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Relatórios detalhados sobre o desempenho e evolução da criança, permitindo ajustes personalizados nas
                atividades.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/about-reports" className="w-full">
                <Button className="w-full">Sobre os Relatórios</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colaboração Multidisciplinar</CardTitle>
              <CardDescription>Integração entre responsáveis e profissionais</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Plataforma que conecta responsáveis, professores e terapeutas para um acompanhamento integrado do
                desenvolvimento da criança.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/collaboration" className="w-full">
                <Button className="w-full">Como Funciona</Button>
              </Link>
            </CardFooter>
          </Card>
        </section>

        <section className="bg-muted p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6 text-center">Como Começar</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Cadastre-se</h3>
              <p>Crie uma conta como responsável, professor ou terapeuta.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Adicione Crianças</h3>
              <p>Cadastre as crianças que serão acompanhadas na plataforma.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Comece a Jogar</h3>
              <p>Acesse os jogos e acompanhe o progresso através dos relatórios.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2025 TEAprende - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
