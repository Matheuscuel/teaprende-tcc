// src/routes/childrenPerformance.js
const express = require("express");
const router = express.Router();
const { prisma } = require("../db");
const { authMiddleware } = require("../middleware/auth");

// helper de permissÃ£o contextual
function canSeeChild(user, child) {
  if (!user || !child) return false;
  const role = String(user.role || "").toLowerCase();
  if (role === "admin" || role === "terapeuta" || role === "professor") return true;
  if (role === "responsavel") return Number(child.parent_id) === Number(user.id);
  return false;
}

// GET /api/children/:id/performance
// resumo por jogo (usa a view se existir; senÃ£o, calcula via GROUP BY)
router.get("/:id/performance", authMiddleware, async (req, res) => {
  try {
    const userRole = req.userRole ?? req.user?.role;
    const userId   = req.userId   ?? req.user?.id;
    if (!ALLOWED_ROLES.has(userRole)) return res.status(403).json({ error: "Sem permissÃ£o" });

    const childId = Number(req.params.id);
    if (!Number.isInteger(childId)) return res.status(400).json({ error: "childId invÃ¡lido" });

    const c = await req.db.query("SELECT id, name, owner_id FROM children WHERE id=$1", [childId]);
    if (c.rowCount === 0) return res.status(404).json({ error: "CrianÃ§a nÃ£o encontrada" });
    const child = c.rows[0];

    if (!canManageChild(userRole, userId, child)) {
      return res.status(403).json({ error: "Sem permissÃ£o para ver o desempenho desta crianÃ§a" });
    }

    // agregado direto (sem VIEW)
    const sumSql = `
      SELECT 
        gp.game_id,
        g.title, g.category, g.level,
        COUNT(*)::int                                  AS plays,
        MAX(gp.created_at)                             AS last_play,
        ROUND(AVG(COALESCE(gp.score,0))::numeric,2)    AS avg_score,
        MAX(gp.score)::int                             AS max_score,
        ROUND(AVG(COALESCE(gp.time_spent,0))::numeric,2) AS avg_time
      FROM game_progress gp
      JOIN games g ON g.id = gp.game_id
      WHERE gp.child_id = $1
      GROUP BY gp.game_id, g.title, g.category, g.level
      ORDER BY last_play DESC NULLS LAST
    `;
    const summary = await req.db.query(sumSql, [childId]);

    return res.json({ child: { id: child.id, name: child.name }, summary: summary.rows });
  } catch (err) {
    console.error("GET /api/children/:id/performance erro:", err);
    return res.status(500).json({ message: "Erro ao buscar resumo" });
  }
});



// GET /api/children/:id/performance/:gameId/timeseries?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/:id/performance/:gameId/timeseries", authMiddleware, async (req, res) => {
  try {
    const childId = Number(req.params.id);
    const gameId  = Number(req.params.gameId);
    if (!Number.isInteger(childId) || !Number.isInteger(gameId)) {
      return res.status(400).json({ message: "childId e gameId devem ser inteiros" });
    }

    const child = await prisma.children.findUnique({
      where: { id: childId },
      select: { id: true, name: true, parent_id: true },
    });
    if (!child) return res.status(404).json({ message: "CrianÃ§a nÃ£o encontrada" });
    if (!canSeeChild(req.user, child)) return res.status(403).json({ message: "Sem permissÃ£o" });

    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to   = req.query.to   ? new Date(req.query.to)   : undefined;

    const points = await prisma.game_progress.findMany({
      where: {
        child_id: childId,
        game_id: gameId,
        ...(from || to
          ? { created_at: { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) } }
          : {}),
      },
      orderBy: { created_at: "asc" },
      select: { id: true, score: true, time_spent: true, notes: true, created_at: true },
    });

    return res.json({
      child: { id: child.id, name: child.name },
      game: { id: gameId },
      points: points.map(p => ({
        id: p.id,
        score: Number(p.score),
        time_spent: Number(p.time_spent || 0),
        notes: p.notes,
        completed_at: p.created_at,
      })),
    });
  } catch (err) {
    console.error("[GET /children/:id/performance/:gameId/timeseries] error:", err);
    return res.status(500).json({ message: "Erro ao buscar sÃ©rie temporal" });
  }
});

// POST /api/children/:id/games/:gameId/progress
// body: { score (0-100), time_spent?, notes? }
router.post("/:id/games/:gameId/progress", authMiddleware, async (req, res) => {
  try {
    const childId = Number(req.params.id);
    const gameId  = Number(req.params.gameId);
    const { score, time_spent, notes } = req.body || {};

    if (!Number.isInteger(childId) || !Number.isInteger(gameId)) {
      return res.status(400).json({ message: "childId e gameId devem ser inteiros" });
    }
    const s = Number(score);
    if (!Number.isFinite(s) || s < 0 || s > 100) {
      return res.status(400).json({ message: "score deve ser nÃºmero entre 0 e 100" });
    }

    const child = await prisma.children.findUnique({
      where: { id: childId },
      select: { id: true, name: true, parent_id: true },
    });
    if (!child) return res.status(404).json({ message: "CrianÃ§a nÃ£o encontrada" });
    if (!canSeeChild(req.user, child)) return res.status(403).json({ message: "Sem permissÃ£o" });

    const created = await prisma.game_progress.create({
      data: {
        child_id: childId,
        game_id: gameId,
        score: s,
        time_spent: time_spent ? Number(time_spent) : null,
        notes: notes ?? null,
      },
      select: { id: true, child_id: true, game_id: true, score: true, time_spent: true, notes: true, created_at: true },
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("[POST /children/:id/games/:gameId/progress] error:", err);
    return res.status(500).json({ message: "Erro ao registrar progresso" });
  }
});

module.exports = router;

