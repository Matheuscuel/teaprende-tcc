const svc = require("../services/gameProgressService");

async function createProgress(req, res, next) {
  try {
    const { game_id, child_id, score, time_spent, notes } = req.body || {};
    if (game_id == null || child_id == null || score == null) {
      return res.status(400).json({ error: "game_id, child_id e score são obrigatórios" });
    }
    const row = await svc.create(req.db, {
      game_id: Number(game_id),
      child_id: Number(child_id),
      score: Number(score),
      time_spent: time_spent ? Number(time_spent) : null,
      notes: notes ?? null
    });
    return res.status(201).json(row);
  } catch (e) { next(e); }
}

module.exports = { createProgress };
