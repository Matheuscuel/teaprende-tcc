const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const childrenRoutes = require("./routes/children");
const gamesRoutes = require("./routes/games");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/games", gamesRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Rota não encontrada" }));

// error handler
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  return res.status(err.status || 500).json({ message: err.message || "Erro interno do servidor" });
});

module.exports = app;
