const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const helmet = require("helmet")
const { Pool } = require("pg")
const dotenv = require("dotenv")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const gameRoutes = require("./routes/games")
const reportRoutes = require("./routes/reports")

// Carrega as variáveis de ambiente do .env
dotenv.config()

// Exibe a senha do banco para debug
console.log("Senha do banco (env):", typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD)

// Configuração manual do banco de dados PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

// Teste de conexão com o banco de dados
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err)
  } else {
    console.log("Conexão com o banco de dados estabelecida com sucesso!")
  }
})

const app = express()

// Middlewares
app.use(helmet())
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

// Disponibiliza a conexão com o banco para as rotas
app.use((req, res, next) => {
  req.db = pool
  next()
})

// Rotas
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/games", gameRoutes)
app.use("/api/reports", reportRoutes)

// Rota de teste
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API funcionando corretamente!" })
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === "production" ? "Erro interno do servidor" : err.message,
  })
})

// Inicia o servidor
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

module.exports = app
