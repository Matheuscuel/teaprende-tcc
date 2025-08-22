// src/server.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { Pool } = require("pg");
const dotenv = require("dotenv");

// rotas existentes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/games");
const reportRoutes = require("./routes/reports");
const childrenRoutes = require("./routes/children");

// NOVA rota
const gameProgressRoutes = require("./routes/gameProgress");

dotenv.config();

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors()); // se precisar, configure origin/credentials
app.use(morgan("dev"));
app.use(express.json());

// Pool do Postgres
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

// Teste de conexão (opcional)
pool.query("SELECT NOW()", (err) => {
  if (err) console.error("Erro ao conectar ao banco:", err);
  else console.log("Conexão com o banco ok!");
});

// Handler de erro do pool
pool.on("error", (err) => {
  console.error("Erro inesperado no pool:", err);
});

// Injete o pool ANTES das rotas
app.use((req, _res, next) => {
  req.db = pool;
  next();
});

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/children", childrenRoutes);

// MONTA a nova rota
app.use("/api/game-progress", gameProgressRoutes);

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "API funcionando corretamente!" });
});

// Middleware de erro (centralizado)
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: true,
    message: process.env.NODE_ENV === "production" ? "Erro interno do servidor" : err.message,
  });
});

// Sobe o servidor
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Encerrando...");
  await pool.end().catch(() => {});
  server.close(() => process.exit(0));
});

module.exports = app;
