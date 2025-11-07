async function create(db, { game_id, child_id, score, time_spent, notes }) {
  // valida game
  const g = await db.query("SELECT id FROM games WHERE id=$1", [game_id]);
  if (g.rowCount === 0) { const err = new Error("GameNotFound"); err.status = 404; throw err; }

  // valida criança
  const c = await db.query("SELECT id FROM children WHERE id=$1", [child_id]);
  if (c.rowCount === 0) { const err = new Error("ChildNotFound"); err.status = 404; throw err; }

  const data = { time_spent, notes };
  const sql = `
    INSERT INTO game_sessions (child_id, game_id, score, started_at, finished_at, data)
    VALUES ($1,$2,$3,NOW(),NOW(),$4::jsonb)
    RETURNING id, child_id, game_id, score, started_at, finished_at, data
  `;
  const { rows } = await db.query(sql, [child_id, game_id, score, JSON.stringify(data)]);
  return rows[0];
}

module.exports = { create };
