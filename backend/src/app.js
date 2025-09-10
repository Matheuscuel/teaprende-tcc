const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
const authRoutes = require("../routes/auth");
const childrenRoutes = require("../routes/children");
const gameRoutes = require("../routes/gameRoutes");

// 1º Auth (público)
app.use("/api", authRoutes);

// 2º Children (público por enquanto)
app.use("/api/children", childrenRoutes);

// 3º Módulo 3 (GET /games público; demais com JWT)
app.use("/api", gameRoutes);

// (opcional) dashboard se existir
try {
  app.use("/api/dashboard", require("./routes/dashboard"));
} catch { /* ignore se não existir */ }

// health checks
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/health", (_req, res) => res.json({ ok: true }));

module.exports = app;
