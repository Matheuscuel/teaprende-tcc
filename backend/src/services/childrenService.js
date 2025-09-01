const db = require('../database/db');

// CRIAR CRIANÇA
// services/childrenService.js
async function createChild({ name, birth_date, user_id, owner_id }, requester) {
  const ownerId = requester?.role === 'responsavel' ? requester.id : (owner_id ?? null);
  const therapistId = Number.isInteger(Number(user_id)) ? Number(user_id) : null;

  const sql = `
    INSERT INTO children (name, birth_date, user_id, owner_id, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id, name, birth_date, user_id, owner_id, created_at
  `;
  const params = [name.trim(), birth_date || null, therapistId, ownerId];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}


// LISTAR (guardian vê só as suas; admin/teacher/therapist vê todas)
async function listChildren({ requester, page = 1, pageSize = 20 }) {
  const q = db('children').select('*').orderBy('created_at', 'desc')
    .limit(pageSize).offset((page - 1) * pageSize);

  if (['responsavel', 'guardian'].includes(requester.role)) {
    q.where('owner_id', requester.id);
  }
  return q;
}

// DETALHE
async function getChildById(id, requester) {
  const q = db('children').where({ id }).first();
  const child = await q;
  if (!child) return null;
  if (['responsavel', 'guardian'].includes(requester.role) && child.owner_id !== requester.id) {
    return null;
  }
  return child;
}

// ATRIBUIR JOGOS
async function assignGames(childId, gameIds, assignedBy) {
  const rows = [];
  for (const gid of gameIds) {
    const [r] = await db('children_games')
      .insert({ child_id: childId, game_id: gid, assigned_by: assignedBy, active: true })
      .onConflict(['child_id', 'game_id']).merge({ active: true })
      .returning('*');
    rows.push(r);
  }
  return rows;
}

// LISTAR ATRIBUIÇÕES
async function getAssignments(childId) {
  return db('children_games as cg')
    .join('games as g', 'g.id', 'cg.game_id')
    .select('cg.*', 'g.title as game_title')
    .where('cg.child_id', childId)
    .andWhere('cg.active', true)
    .orderBy('cg.assigned_at', 'desc');
}

// PERFORMANCE (agregado simples + últimas sessões)
async function getPerformance(childId, { from, to }) {
  const sessionsQ = db('game_sessions as gs')
    .join('games as g', 'g.id', 'gs.game_id')
    .select('gs.*', 'g.title as game_title')
    .where('gs.child_id', childId)
    .orderBy('gs.started_at', 'desc')
    .limit(200);

  if (from) sessionsQ.where('gs.started_at', '>=', from);
  if (to) sessionsQ.where('gs.started_at', '<', to);

  const sessions = await sessionsQ;

  const [summary] = await db('game_sessions as gs')
    .where('gs.child_id', childId)
    .modify(q => {
      if (from) q.where('gs.started_at', '>=', from);
      if (to) q.where('gs.started_at', '<', to);
    })
    .count('* as sessions')
    .avg('score as avg_score')
    .avg('accuracy as avg_accuracy');

  return { sessions, summary };
}

module.exports = {
  createChild, listChildren, getChildById,
  assignGames, getAssignments, getPerformance
};

