const listEndpoints = require('express-list-endpoints');
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const childrenRoutes = require("./routes/children");
const gamesRoutes = require("./routes/games");
const childrenPerformanceRoutes = require("./routes/childrenPerformance"); // << ADICIONE

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
app.use("/api/children", childrenPerformanceRoutes); // << ADICIONE
console.table(listEndpoints(app));
// 404 + error handler...
module.exports = app;
