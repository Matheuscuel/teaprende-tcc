// src/routes/gameProgress.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const svc = require('../services/gameProgressService');

// papéis que podem registrar progresso (ajuste se quiser)
const allow = (...roles) => (req, res, next) => {
  const role = req.userRole || req.user?.role; // compat com seu middleware
  if (!roles.includes(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

/**
 * POST /api/game-progress
 * body: { game_id, child_id, score, time_spent?, notes? }
 */
router.post(
  '/',
  authMiddleware,
  allow('terapeuta', 'professor'),
  async (req, res, next) => {
    try {
      const { game_id, child_id, score, time_spent, notes } = req.body || {};

      if (![game_id, child_id, score].every(v => v !== undefined && v !== null)) {
        return res.status(400).json({ error: 'game_id, child_id e score são obrigatórios' });
      }

      const row = await svc.create(req.db, {
        game_id: Number(game_id),
        child_id: Number(child_id),
        score: Number(score),
        time_spent: time_spent !== undefined && time_spent !== null ? Number(time_spent) : null,
        notes: typeof notes === 'string' ? notes : null
      });

      return res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
