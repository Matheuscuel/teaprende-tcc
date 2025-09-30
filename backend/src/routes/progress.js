const express = require("express");
const { prisma } = require("../db");

const router = express.Router();

// Criar progresso
router.post("/", async (req, res, next) => {
  try {
    const { child_id, game_id, score = 0, time_spent = 0, notes = "" } = req.body;
    const rows = await prisma.$queryRaw`
      INSERT INTO game_progress (child_id, game_id, score, time_spent, notes)
      VALUES (${child_id}, ${game_id}, ${score}, ${time_spent}, ${notes})
      RETURNING id, child_id, game_id, score, time_spent, notes, created_at
    `;
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// Progresso por criança (AGORA COM skill_code)
router.get("/child/:childId", async (req, res, next) => {
  try {
    const childId = Number(req.params.childId);
    const rows = await prisma.$queryRaw`
      SELECT
        gp.id,
        gp.game_id,
        gp.child_id,
        gp.score,
        gp.time_spent,
        gp.notes,
        gp.created_at,
        g.title AS game_title,
        s.code  AS skill_code
      FROM game_progress gp
      LEFT JOIN games  g ON g.id = gp.game_id
      LEFT JOIN skills s ON s.id = g.skill_id
      WHERE gp.child_id = ${childId}
      ORDER BY gp.created_at DESC
    `;
    res.json(rows);
  } catch (e) { next(e); }
});

// Overview agregado (CAST para evitar BigInt)
router.get("/overview", async (req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        gp.child_id,
        COALESCE(c.name, 'N/A') AS child_name,
        COUNT(*)::int                                           AS total_sessions,
        ROUND(AVG(gp.score)::numeric, 0)::int                   AS avg_score,
        COALESCE(SUM(gp.time_spent), 0)::int                    AS total_time
      FROM game_progress gp
      LEFT JOIN children c ON c.id = gp.child_id
      GROUP BY gp.child_id, c.name
      ORDER BY child_name
    `;
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
