const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * GET /api/dashboard/summary
 * - childrenCount, gamesCount, sessionsCount
 * - last7: [{ date, sessions }] (últimos 7 dias)
 */
router.get("/summary", async (_req, res) => {
  try {
    const [childrenCount, gamesCount, sessionsCount] = await Promise.all([
      prisma.children.count(),
      prisma.games.count(),
      prisma.game_progress.count(),
    ]);

    const rows = await prisma.$queryRaw`
      SELECT date_trunc('day', created_at) AS day, count(*)::int AS sessions
      FROM game_progress
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const last7 = rows.map(r => ({
      date: r.day,
      sessions: r.sessions,
    }));

    res.json({ childrenCount, gamesCount, sessionsCount, last7 });
  } catch (e) {
    console.error("dashboard.summary ERROR:", e);
    res.status(500).json({ message: "Erro no dashboard", error: e.message, code: e.code });
  }
});

module.exports = router;

