// src/routes/children.js
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { prisma } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/* ------------------------ utils ------------------------ */
function toPlain(data) {
  const replacer = (_k, v) => {
    if (typeof v === 'bigint') {
      const n = Number(v);
      return Number.isSafeInteger(n) ? n : v.toString();
    }
    if (v && typeof v === 'object' && v.constructor && v.constructor.name === 'Decimal') {
      const n = Number(v);
      return Number.isFinite(n) ? n : v.toString();
    }
    return v;
  };
  return JSON.parse(JSON.stringify(data, replacer));
}

/* ------------------------ papéis ------------------------ */
const ROLES = {
  ADMIN: 'admin',
  TERAPEUTA: 'terapeuta',
  PROFESSOR: 'professor',
  RESPONSAVEL: 'responsavel',
  CRIANCA: 'crianca',
};

const ALLOWED_ROLES = new Set([ROLES.ADMIN, ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.RESPONSAVEL]);

function assertAllowed(req, res) {
  const role = req.user?.role;
  if (!role || !ALLOWED_ROLES.has(role)) {
    res.status(403).json({ error: 'Sem permissão' });
    return false;
  }
  return true;
}

/**
 * Permissão contextual:
 * - admin: tudo
 * - responsavel: só se child.parent_id === user.id
 * - terapeuta/professor: precisa existir vínculo em child_professional
 * retorna:
 *   true/false  |  null se a criança não existe
 */
async function canManageChildPrisma(user, childId) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;

  const child = await prisma.children.findUnique({ where: { id: childId } });
  if (!child) return null;

  if (user.role === ROLES.RESPONSAVEL && child.parent_id === user.id) return true;

  if (user.role === ROLES.TERAPEUTA || user.role === ROLES.PROFESSOR) {
    const linkCount = await prisma.child_professional.count({
      where: { child_id: childId, professional_id: user.id },
    });
    return linkCount > 0;
  }
  return false;
}

/* ======================= CRIAR CRIANÇA ======================= */
// body: { name, age, gender, notes?, parent_id? }
router.post(
  '/',
  authMiddleware,
  [
    body('name').trim().notEmpty().withMessage('name é obrigatório'),
    body('age').isInt({ min: 0 }).withMessage('age deve ser inteiro >= 0'),
    body('gender').isIn(['masculino', 'feminino', 'outro']).withMessage('gender inválido'),
    body('notes').optional().isString(),
    body('parent_id').optional().isInt({ min: 1 }),
  ],
  async (req, res) => {
    if (!assertAllowed(req, res)) return;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, age, gender, notes, parent_id } = req.body;

      const data = {
        name: name.trim(),
        age: Number(age),
        gender,
        notes: notes ?? null,
        parent_id: req.user.role === ROLES.RESPONSAVEL ? Number(req.user.id) : parent_id ?? null,
      };

      const child = await prisma.children.create({ data });

      // se criou como terapeuta/professor, vincula automaticamente
      if (req.user.role === ROLES.TERAPEUTA || req.user.role === ROLES.PROFESSOR) {
        await prisma.child_professional.create({
          data: { child_id: child.id, professional_id: req.user.id },
        });
      }

      return res.status(201).json(child);
    } catch (e) {
      console.error('[Children POST] error:', e);
      return res.status(500).json({ message: 'Erro ao criar criança' });
    }
  }
);

/* ======================= LISTAR CRIANÇAS ======================= */
router.get(
  '/',
  authMiddleware,
  [
    query('q').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    if (!assertAllowed(req, res)) return;

    try {
      const q = (req.query.q || '').trim();
      const page = Number(req.query.page || 1);
      const pageSize = Number(req.query.pageSize || 20);
      const skip = (page - 1) * pageSize;

      const baseWhere = q ? { name: { contains: q, mode: 'insensitive' } } : {};
      let where = baseWhere;

      if (req.user.role === ROLES.RESPONSAVEL) {
        where = { ...baseWhere, parent_id: req.user.id };
      } else if (req.user.role === ROLES.TERAPEUTA || req.user.role === ROLES.PROFESSOR) {
        const ids = await prisma.child_professional.findMany({
          where: { professional_id: req.user.id },
          select: { child_id: true },
        });
        const childIds = ids.map((r) => r.child_id);
        if (childIds.length === 0) return res.status(204).send();
        where = { ...baseWhere, id: { in: childIds } };
      } // admin vê tudo

      const [rows, total] = await Promise.all([
        prisma.children.findMany({ where, orderBy: { id: 'asc' }, skip, take: pageSize }),
        prisma.children.count({ where }),
      ]);

      if (!rows.length) return res.status(204).send();
      return res.json({ page, pageSize, total, data: rows });
    } catch (e) {
      console.error('[Children GET] error:', e);
      return res.status(500).json({ message: 'Erro ao listar crianças' });
    }
  }
);

/* ======================= DETALHE ======================= */
router.get(
  '/:id',
  authMiddleware,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    if (!assertAllowed(req, res)) return;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const id = Number(req.params.id);
      const allowed = await canManageChildPrisma(req.user, id);
      if (allowed === null) return res.status(404).json({ message: 'Criança não encontrada' });
      if (!allowed) return res.status(403).json({ message: 'Sem permissão' });

      const child = await prisma.children.findUnique({ where: { id } });
      if (!child) return res.status(404).json({ message: 'Criança não encontrada' });
      return res.json(child);
    } catch (e) {
      console.error('[Children GET/:id] error:', e);
      return res.status(500).json({ message: 'Erro ao buscar criança' });
    }
  }
);

/* ======================= ATUALIZAR ======================= */
router.put(
  '/:id',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }),
    body('name').optional().trim().notEmpty(),
    body('age').optional().isInt({ min: 0 }),
    body('gender').optional().isIn(['masculino', 'feminino', 'outro']),
    body('notes').optional().isString(),
    body('parent_id').optional().isInt({ min: 1 }).withMessage('parent_id deve ser inteiro'),
  ],
  async (req, res) => {
    if (!assertAllowed(req, res)) return;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const id = Number(req.params.id);
      const allowed = await canManageChildPrisma(req.user, id);
      if (allowed === null) return res.status(404).json({ message: 'Criança não encontrada' });
      if (!allowed) return res.status(403).json({ message: 'Sem permissão' });

      const patch = {};
      if (req.body.name) patch.name = req.body.name.trim();
      if (req.body.age !== undefined) patch.age = Number(req.body.age);
      if (req.body.gender) patch.gender = req.body.gender;
      if (req.body.notes !== undefined) patch.notes = req.body.notes;
      if (req.body.parent_id !== undefined) patch.parent_id = Number(req.body.parent_id);

      const updated = await prisma.children.update({ where: { id }, data: patch });
      return res.json(updated);
    } catch (e) {
      if (e.code === 'P2025') return res.status(404).json({ message: 'Criança não encontrada' });
      console.error('[Children PUT/:id] error:', e);
      return res.status(500).json({ message: 'Erro ao atualizar criança' });
    }
  }
);

/* ======================= DELETAR ======================= */
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    if (!assertAllowed(req, res)) return;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const id = Number(req.params.id);
      const allowed = await canManageChildPrisma(req.user, id);
      if (allowed === null) return res.status(404).json({ message: 'Criança não encontrada' });
      if (!allowed) return res.status(403).json({ message: 'Sem permissão' });

      await prisma.children.delete({ where: { id } });
      return res.status(204).send();
    } catch (e) {
      if (e.code === 'P2025') return res.status(404).json({ message: 'Criança não encontrada' });
      console.error('[Children DELETE/:id] error:', e);
      return res.status(500).json({ message: 'Erro ao remover criança' });
    }
  }
);

/* ======================= ATRIBUIR JOGO ======================= */
// POST /api/children/:id/games  { game_id }
router.post('/:id/games', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const childId = Number(req.params.id);
    const gameId = Number(req.body?.game_id);

    if (!Number.isInteger(childId) || !Number.isInteger(gameId)) {
      return res.status(400).json({ message: 'childId e game_id devem ser inteiros' });
    }

    const child = await prisma.children.findUnique({ where: { id: childId } });
    if (!child) return res.status(404).json({ message: 'Criança não encontrada' });

    const can = await canManageChildPrisma(user, childId);
    if (can === null) return res.status(404).json({ message: 'Criança não encontrada' });
    if (!can) return res.status(403).json({ message: 'Sem permissão' });

    const game = await prisma.games.findUnique({ where: { id: gameId } });
    if (!game) return res.status(404).json({ message: 'Jogo não encontrado' });

    await prisma.$executeRaw`
      INSERT INTO child_game (child_id, game_id, assigned_by)
      VALUES (${childId}, ${gameId}, ${user.id})
      ON CONFLICT (child_id, game_id) DO UPDATE
      SET assigned_by = EXCLUDED.assigned_by,
          assigned_at = NOW()
    `;

    return res.status(201).json({ assigned: true, child_id: childId, game_id: gameId });
  } catch (err) {
    console.error('[POST /children/:id/games] ', err);
    return res.status(500).json({ message: 'Erro ao atribuir jogo' });
  }
});

/* ======================= REMOVER ATRIBUIÇÃO ======================= */
router.delete(
  '/:id/games/:gameId',
  authMiddleware,
  [param('id').isInt({ min: 1 }), param('gameId').isInt({ min: 1 })],
  async (req, res) => {
    if (!assertAllowed(req, res)) return;

    try {
      const childId = Number(req.params.id);
      const gameId = Number(req.params.gameId);

      const allowed = await canManageChildPrisma(req.user, childId);
      if (allowed === null) return res.status(404).json({ message: 'Criança não encontrada' });
      if (!allowed) return res.status(403).json({ message: 'Sem permissão' });

      const affected = await prisma.$executeRawUnsafe(
        'DELETE FROM child_game WHERE child_id=$1 AND game_id=$2',
        childId,
        gameId
      );

      // $executeRaw retorna número de linhas afetadas (em alguns drivers BigInt), mas não serializamos isso.
      if (!affected) return res.status(404).json({ message: 'Vínculo não encontrado' });
      return res.status(204).send();
    } catch (e) {
      console.error('[Children DELETE /:id/games/:gameId] error:', e);
      return res.status(500).json({ message: 'Erro ao remover jogo' });
    }
  }
);

/* ======================= LISTAR JOGOS ATRIBUÍDOS ======================= */
router.get('/:id/games', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const childId = Number(req.params.id);
    if (!Number.isInteger(childId)) {
      return res.status(400).json({ message: 'childId inválido' });
    }

    const child = await prisma.children.findUnique({ where: { id: childId } });
    if (!child) return res.status(404).json({ message: 'Criança não encontrada' });

    const can = await canManageChildPrisma(user, childId);
    if (can === null) return res.status(404).json({ message: 'Criança não encontrada' });
    if (!can) return res.status(403).json({ message: 'Sem permissão' });

    const rows = await prisma.$queryRaw`
      SELECT cg.child_id, cg.game_id, cg.assigned_at, cg.assigned_by,
             g.title, g.category, g.level
      FROM child_game cg
      JOIN games g ON g.id = cg.game_id
      WHERE cg.child_id = ${childId}
      ORDER BY cg.assigned_at DESC
    `;
    return res.json(toPlain(rows));
  } catch (err) {
    console.error('[GET /children/:id/games] ', err);
    return res.status(500).json({ message: 'Erro ao listar jogos' });
  }
});

/* ======================= TIMESERIES ======================= */
// GET /api/children/:id/performance/:gameId/timeseries?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get(
  '/:id/performance/:gameId/timeseries',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }),
    param('gameId').isInt({ min: 1 }),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
  ],
  async (req, res) => {
    if (!assertAllowed(req, res)) return;

    try {
      const childId = Number(req.params.id);
      const gameId = Number(req.params.gameId);

      const allowed = await canManageChildPrisma(req.user, childId);
      if (allowed === null) return res.status(404).json({ message: 'Criança não encontrada' });
      if (!allowed) return res.status(403).json({ message: 'Sem permissão' });

      const where = ['child_id = $1', 'game_id = $2'];
      const params = [childId, gameId];
      let idx = 3;

      if (req.query.from) {
        where.push(`created_at >= $${idx++}`);
        params.push(new Date(req.query.from));
      }
      if (req.query.to) {
        where.push(`created_at < $${idx++}`);
        params.push(new Date(req.query.to));
      }

      const rows = await prisma.$queryRawUnsafe(
        `
        SELECT id, score, COALESCE(time_spent,0) AS time_spent, notes, created_at
        FROM game_progress
        WHERE ${where.join(' AND ')}
        ORDER BY created_at ASC
        `,
        ...params
      );

      return res.json(
        toPlain({
          child: { id: childId },
          game: { id: gameId },
          points: rows.map((r) => ({
            id: r.id,
            score: Number(r.score),
            time_spent: Number(r.time_spent),
            notes: r.notes,
            completed_at: r.created_at,
          })),
        })
      );
    } catch (e) {
      console.error('[Children GET timeseries] error:', e);
      return res.status(500).json({ message: 'Erro ao listar série temporal' });
    }
  }
);

/* ======================= RESUMO (AGREGADO) ======================= */
// GET /api/children/:id/performance
// ---------- RESUMO (VIEW v_child_performance) ----------
router.get(
  '/:id/performance',
  authMiddleware,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const childId = Number(req.params.id);

      // mesma regra de permissão das outras rotas
      const allowed = await canManageChildPrisma(req.user, childId);
      if (allowed === null) return res.status(404).json({ message: 'Criança não encontrada' });
      if (!allowed)       return res.status(403).json({ message: 'Sem permissão' });

      // ⚠️ casts para evitar BigInt/Decimal no JSON
      const rows = await prisma.$queryRawUnsafe(
        `
        SELECT
          v.game_id::int                            AS game_id,
          g.title,
          g.category,
          g.level,
          v.sessions::int                           AS sessions,
          (v.avg_score)::float                      AS avg_score,
          (v.median_score)::float                   AS median_score,
          v.total_time_spent::int                   AS total_time_spent,
          v.first_play                              AS first_play,
          v.last_play                               AS last_play
        FROM v_child_performance v
        JOIN games g ON g.id = v.game_id
        WHERE v.child_id = $1
        ORDER BY v.last_play DESC NULLS LAST
        `,
        childId
      );

      // dupla garantia: normaliza para tipos JS primitivos
      const summary = rows.map(r => ({
        game_id: Number(r.game_id),
        title: r.title,
        category: r.category,
        level: r.level,
        sessions: Number(r.sessions),
        avg_score: Number(r.avg_score),
        median_score: Number(r.median_score),
        total_time_spent: Number(r.total_time_spent),
        first_play: r.first_play, // Date -> vira ISO no JSON
        last_play:  r.last_play
      }));

      return res.json({ child: { id: childId }, summary });
    } catch (e) {
      console.error('[Children GET /:id/performance] error:', e);
      return res.status(500).json({ message: 'Erro ao buscar resumo' });
    }
  }
);


/* ======================= REGISTRAR PROGRESSO ======================= */
// POST /api/children/:id/games/:gameId/progress  { score, time_spent?, notes? }
router.post('/:id/games/:gameId/progress', authMiddleware, async (req, res) => {
  try {
    if (!assertAllowed(req, res)) return;

    const childId = Number(req.params.id);
    const gameId = Number(req.params.gameId);
    if (!Number.isInteger(childId) || !Number.isInteger(gameId)) {
      return res.status(400).json({ error: 'childId e gameId devem ser inteiros' });
    }

    const allowed = await canManageChildPrisma(req.user, childId);
    if (allowed === null) return res.status(404).json({ error: 'Criança não encontrada' });
    if (!allowed) return res.status(403).json({ error: 'Sem permissão para registrar progresso' });

    const game = await prisma.games.findUnique({ where: { id: gameId } });
    if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });

    // exige jogo atribuído previamente
    const assigned = await prisma.child_game.count({ where: { child_id: childId, game_id: gameId } });
    if (!assigned) return res.status(409).json({ error: 'Jogo não está atribuído para esta criança' });

    const { score, time_spent, notes } = req.body ?? {};
    if (!Number.isFinite(Number(score))) {
      return res.status(400).json({ error: 'score numérico é obrigatório' });
    }
    const s = Math.max(0, Math.min(100, Number(score)));
    const ts = Number.isFinite(Number(time_spent)) ? Number(time_spent) : 0;

    const created = await prisma.game_progress.create({
      data: {
        child_id: childId,
        game_id: gameId,
        score: s,
        time_spent: ts,
        notes: typeof notes === 'string' ? notes : null,
      },
      select: { id: true, child_id: true, game_id: true, score: true, time_spent: true, notes: true, created_at: true },
    });

    return res.status(201).json({ progress: created });
  } catch (err) {
    console.error('POST /children/:id/games/:gameId/progress erro:', err);
    return res.status(500).json({ error: 'Erro ao registrar progresso' });
  }
});

module.exports = router;
