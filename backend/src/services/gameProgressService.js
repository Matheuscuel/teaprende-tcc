// src/services/gameProgressService.js
// NÃO faça require('../db'); use o db passado (req.db)

async function create(db, { game_id, child_id, score, time_spent, notes }) {
  // valida game
  const g = await db.query('SELECT id FROM games WHERE id=$1', [game_id]);
  if (g.rowCount === 0) { const err = new Error('GameNotFound'); err.status = 404; throw err; }

  // valida criança
  const c = await db.query('SELECT id FROM children WHERE id=$1', [child_id]);
  if (c.rowCount === 0) { const err = new Error('ChildNotFound'); err.status = 404; throw err; }

  // insere progresso
  const sql = `
    INSERT INTO game_progress (game_id, child_id, score, time_spent, notes, created_at)
    VALUES ($1,$2,$3,$4,$5,NOW())
    RETURNING id, game_id, child_id, score, time_spent, notes, created_at
  `;
  const { rows } = await db.query(sql, [game_id, child_id, score, time_spent, notes]);
  return rows[0];
}

module.exports = { create };

