const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/auth");
const gameRoutes = require("../routes/gameRoutes");
const childrenRoutes = require("../routes/children");

const app = express();

app.use(cors());
app.use(express.json());

// saúde
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// rotas
app.use("/api", authRoutes);           // /api/auth/login, /api/auth/register
app.use("/api", gameRoutes);           // /api/games, /api/children/:id/games/*, sessions/progress
app.use("/api/children", childrenRoutes); // /api/children, /api/children/:id

module.exports = app;
