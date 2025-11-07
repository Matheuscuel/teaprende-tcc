"use strict";
const express = require("express");
const router  = express.Router();
const { requireAuth } = require("../middlewares/auth.js");
const { createProgress } = require("../controllers/gameProgressController");

// GET /api/game-progress?childId=3 (lista últimas 100 sessões)
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const childId = req.query.childId ? Number(req.query.childId) : null;
    const q = `
      SELECT id, child_id, game_id, score, started_at, finished_at, data
      FROM game_sessions
      WHERE ($1::int IS NULL OR child_id=$1)
      ORDER BY started_at DESC
      LIMIT 100
    `;
    const { rows } = await req.db.query(q, [childId]);
    res.status(200).json({ items: rows });
  } catch (e) { next(e); }
});

// POST /api/game-progress { child_id, game_id, score, time_spent?, notes? }
router.post("/", requireAuth, (req, res, next) => createProgress(req, res, next));

module.exports = router;
