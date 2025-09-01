const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { prisma } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();


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
const ROLES = { ADMIN:'admin', TERAPEUTA:'terapeuta', PROFESSOR:'professor', RESPONSAVEL:'responsavel', CRIANCA:'crianca' };
const ALLOWED_ROLES = new Set([ROLES.ADMIN, ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.RESPONSAVEL]);

function assertAllowed(req, res) {
  const role = req.user?.role;
  if (!role || !ALLOWED_ROLES.has(role)) { res.status(403).json({ error: 'Sem permissão' }); return false; }
  return true;
}

async function canManageChild(user, childId) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;

  const child = await prisma.children.findUnique({ where: { id: Number(childId) }, select: { id: true, parent_id: true } });
  if (!child) return false;

  if (user.role === ROLES.RESPONSAVEL) return Number(child.parent_id) === Number(user.id);

  if (user.role === ROLES.TERAPEUTA || user.role === ROLES.PROFESSOR) {
    const link = await prisma.child_professional.findFirst({
      where: { child_id: child.id, professional_id: user.id },
      select: { id: true },
    });
    return !!link;
  }
  return false;
}

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return false; }
  return true;
}

// POST /api/children
router.post(
  '/',
  authMiddleware,
  body('name').trim().notEmpty().withMessage('name é obrigatório'),
  body('age').isInt({ min: 0 }).withMessage('age deve ser inteiro >= 0'),
  body('gender').isIn(['masculino','feminino','outro']).withMessage('gender inválido'),
  body('notes').optional().isString(),
  body('parent_id').optional({ nullable: true }).isInt({ min: 1 }),
  async (req, res) => {
    if (!assertAllowed(req, res)) return;
    if (!validate(req, res)) return;

    try {
      const { name, age, gender, notes, parent_id } = req.body;
      const data = {
        name: name.trim(),
        age: Number(age),
        gender,
        notes: notes ?? null,
        parent_id: req.user.role === ROLES.RESPONSAVEL ? Number(req.user.id) : (parent_id ?? null),
      };
      const child = await prisma.children.create({ data });

      if (req.user.role === ROLES.TERAPEUTA || req.user.role === ROLES.PROFESSOR) {
        await prisma.child_professional.create({ data: { child_id: child.id, professional_id: req.user.id } });
      }
      return res.status(201).json(child);
    } catch (e) {
      console.error('[Children POST] error:', e);
      return res.status(500).json({ message: 'Erro ao criar criança' });
    }
  }
);

// GET /api/children
router.get(
  '/',
  authMiddleware,
  query('q').optional().isString(),
  query('page').optional().isInt({min:1}),
  query('pageSize').optional().isInt({min:1,max:100}),
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
        const ids = await prisma.child_professional.findMany({ where: { professional_id: req.user.id }, select: { child_id: true } });
        const childIds = ids.map(r => r.child_id);
        if (childIds.length === 0) return res.status(204).send();
        where = { ...baseWhere, id: { in: childIds } };
      }

      const [rows, total] = await Promise.all([
        prisma.children.findMany({ where, orderBy: { id:'asc' }, skip, take: pageSize }),
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

// GET /api/children/:id
router.get('/:id', authMiddleware, param('id').isInt({min:1}), async (req,res)=>{
  if (!assertAllowed(req, res)) return;
  if (!validate(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!(await canManageChild(req.user, id))) return res.status(403).json({ message: 'Sem permissão' });

    const child = await prisma.children.findUnique({ where: { id } });
    if (!child) return res.status(404).json({ message: 'Criança não encontrada' });
    return res.json(child);
  } catch (e) {
    console.error('[Children GET/:id] error:', e);
    return res.status(500).json({ message: 'Erro ao buscar criança' });
  }
});

// PUT /api/children/:id
router.put('/:id',
  authMiddleware,
  param('id').isInt({min:1}),
  body('name').optional().trim().notEmpty(),
  body('age').optional().isInt({min:0}),
  body('gender').optional().isIn(['masculino','feminino','outro']),
  body('notes').optional().isString(),
  body('parent_id').optional().isInt({min:1}),
  async (req,res)=>{
    if (!assertAllowed(req, res)) return;
    if (!validate(req, res)) return;
    try {
      const id = Number(req.params.id);
      if (!(await canManageChild(req.user, id))) return res.status(403).json({ message: 'Sem permissão' });

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
});

// DELETE /api/children/:id
router.delete('/:id', authMiddleware, param('id').isInt({min:1}), async (req,res)=>{
  if (!assertAllowed(req, res)) return;
  if (!validate(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!(await canManageChild(req.user, id))) return res.status(403).json({ message: 'Sem permissão' });
    await prisma.children.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ message: 'Criança não encontrada' });
    console.error('[Children DELETE/:id] error:', e);
    return res.status(500).json({ message: 'Erro ao remover criança' });
  }
});

// POST /api/children/:id/games
router.post('/:id/games',
  authMiddleware,
  param('id').isInt({min:1}),
  body('game_id').isInt({min:1}),
  async (req,res)=>{
    if (!assertAllowed(req, res)) return;
    if (!validate(req, res)) return;
    try {
      const childId = Number(req.params.id);
      const gameId  = Number(req.body.game_id);
      if (!(await canManageChild(req.user, childId))) return res.status(403).json({ message: 'Sem permissão' });

      const game = await prisma.games.findUnique({ where: { id: gameId }, select: { id:true } });
      if (!game) return res.status(404).json({ message: 'Jogo não encontrado' });

      await prisma.$executeRaw`
        INSERT INTO child_game (child_id, game_id, assigned_by, assigned_at)
        VALUES (${childId}, ${gameId}, ${req.user.id}, NOW())
        ON CONFLICT (child_id, game_id)
        DO UPDATE SET assigned_by=EXCLUDED.assigned_by, assigned_at=NOW();
      `;

      const [link] = await prisma.$queryRaw`
        SELECT child_id, game_id, assigned_by, assigned_at
        FROM child_game
        WHERE child_id = ${childId} AND game_id = ${gameId}
      `;
      return res.status(201).json({ link: link ?? null });
    } catch (e) {
      console.error('[Children POST /:id/games] error:', e);
      return res.status(500).json({ message: 'Erro ao atribuir jogo' });
    }
  }
);

// DELETE /api/children/:id/games/:gameId
router.delete('/:id/games/:gameId',
  authMiddleware,
  param('id').isInt({min:1}),
  param('gameId').isInt({min:1}),
  async (req,res)=>{
    if (!assertAllowed(req, res)) return;
    if (!validate(req, res)) return;
    try {
      const childId = Number(req.params.id);
      const gameId  = Number(req.params.gameId);
      if (!(await canManageChild(req.user, childId))) return res.status(403).json({ message: 'Sem permissão' });

      const affected = await prisma.$executeRaw`
        DELETE FROM child_game WHERE child_id = ${childId} AND game_id = ${gameId}
      `;
      if (Number(affected) === 0) return res.status(404).json({ message: 'Vínculo não encontrado' });
      return res.status(204).send();
    } catch (e) {
      console.error('[Children DELETE /:id/games/:gameId] error:', e);
      return res.status(500).json({ message: 'Erro ao remover vínculo' });
    }
  }
);

// GET /api/children/:id/games
router.get('/:id/games', authMiddleware, param('id').isInt({min:1}), async (req,res)=>{
  if (!assertAllowed(req, res)) return;
  if (!validate(req, res)) return;
  try {
    const childId = Number(req.params.id);
    if (!(await canManageChild(req.user, childId))) return res.status(403).json({ message: 'Sem permissão' });

    const rows = await prisma.$queryRaw`
      SELECT cg.child_id, cg.game_id, cg.assigned_at, cg.assigned_by,
             g.title, g.category, g.level
      FROM child_game cg
      JOIN games g ON g.id = cg.game_id
      WHERE cg.child_id = ${childId}
      ORDER BY cg.assigned_at DESC
    `;
    if (!rows.length) return res.status(204).send();
    return res.json(rows);
  } catch (e) {
    console.error('[Children GET /:id/games] error:', e);
    return res.status(500).json({ message: 'Erro ao listar jogos' });
  }
});

// GET /api/children/:id/performance/:gameId/timeseries
router.get('/:id/performance/:gameId/timeseries',
  authMiddleware,
  param('id').isInt({min:1}),
  param('gameId').isInt({min:1}),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  async (req,res)=>{
    if (!assertAllowed(req, res)) return;
    if (!validate(req, res)) return;
    try {
      const childId = Number(req.params.id);
      const gameId  = Number(req.params.gameId);
      if (!(await canManageChild(req.user, childId))) return res.status(403).json({ message: 'Sem permissão' });

      const fromDate = req.query.from ? new Date(req.query.from) : null;
      const toDate   = req.query.to   ? new Date(req.query.to)   : null;

      let rows;
      if (fromDate && toDate) {
        rows = await prisma.$queryRaw`
          SELECT id, score, COALESCE(time_spent,0) AS time_spent, notes, created_at
          FROM game_progress
          WHERE child_id = ${childId} AND game_id = ${gameId}
            AND created_at >= ${fromDate} AND created_at < ${toDate}
          ORDER BY created_at ASC
        `;
      } else if (fromDate) {
        rows = await prisma.$queryRaw`
          SELECT id, score, COALESCE(time_spent,0) AS time_spent, notes, created_at
          FROM game_progress
          WHERE child_id = ${childId} AND game_id = ${gameId}
            AND created_at >= ${fromDate}
          ORDER BY created_at ASC
        `;
      } else if (toDate) {
        rows = await prisma.$queryRaw`
          SELECT id, score, COALESCE(time_spent,0) AS time_spent, notes, created_at
          FROM game_progress
          WHERE child_id = ${childId} AND game_id = ${gameId}
            AND created_at < ${toDate}
          ORDER BY created_at ASC
        `;
      } else {
        rows = await prisma.$queryRaw`
          SELECT id, score, COALESCE(time_spent,0) AS time_spent, notes, created_at
          FROM game_progress
          WHERE child_id = ${childId} AND game_id = ${gameId}
          ORDER BY created_at ASC
        `;
      }

      return res.json({
        child: { id: childId }, game: { id: gameId },
        points: rows.map(r => ({ id:r.id, score:Number(r.score), time_spent:Number(r.time_spent), notes:r.notes, completed_at:r.created_at }))
      });
    } catch (e) {
      console.error('[Children GET timeseries] error:', e);
      return res.status(500).json({ message: 'Erro ao buscar série temporal' });
    }
  }
);

// GET /api/children/:id/performance
router.get('/:id/performance', authMiddleware, param('id').isInt({min:1}), async (req,res)=>{
  if (!assertAllowed(req, res)) return;
  if (!validate(req, res)) return;
  try {
    const childId = Number(req.params.id);
    if (!(await canManageChild(req.user, childId))) return res.status(403).json({ message: 'Sem permissão' });

    const rows = await prisma.$queryRaw`
      SELECT v.child_id, v.game_id, v.sessions, v.avg_score, v.median_score,
             v.total_time_spent, v.first_play, v.last_play, g.title
      FROM v_child_performance v
      JOIN games g ON g.id = v.game_id
      WHERE v.child_id = ${childId}
      ORDER BY v.last_play DESC NULLS LAST
    `;
    return res.json({ child: { id: childId }, summary: rows });
  } catch (e) {
    console.error('[Children GET /:id/performance] error:', e);
    return res.status(500).json({ message: 'Erro ao buscar resumo' });
  }
});

//
// ===== NOVAS ROTAS: PROGRESSO + RESUMO =====

// POST /api/children/:id/games/:gameId/progress
router.post("/:id/games/:gameId/progress", authMiddleware, async (req, res) => {
  try {
    const role = req.user?.role;
    const uid  = Number(req.user?.id);
    if (!role) return res.status(401).json({ error: "Token inválido" });

    const childId = Number(req.params.id);
    const gameId  = Number(req.params.gameId);
    if (!Number.isInteger(childId) || !Number.isInteger(gameId)) {
      return res.status(400).json({ error: "childId e gameId devem ser inteiros" });
    }

    // criança + permissão contextual
    const childRows = await prisma.$queryRaw`SELECT id, parent_id FROM children WHERE id = ${childId}`;
    if (childRows.length === 0) return res.status(404).json({ error: "Criança não encontrada" });
    const child = childRows[0];

    const allowed = role === "terapeuta" || role === "professor" || (role === "responsavel" && Number(child.parent_id) === uid);
    if (!allowed) return res.status(403).json({ error: "Sem permissão para registrar progresso" });

    // jogo existe?
    const gameRows = await prisma.$queryRaw`SELECT id FROM games WHERE id = ${gameId}`;
    if (gameRows.length === 0) return res.status(404).json({ error: "Jogo não encontrado" });

    // precisa estar atribuído
    const linkRows = await prisma.$queryRaw`SELECT 1 FROM child_game WHERE child_id=${childId} AND game_id=${gameId}`;
    if (linkRows.length === 0) return res.status(400).json({ error: "Jogo não está atribuído à criança" });

    const { score, time_spent, notes } = req.body ?? {};
    if (!Number.isFinite(Number(score))) return res.status(400).json({ error: "score numérico é obrigatório (0..100)" });

    const s  = Math.max(0, Math.min(100, Number(score)));
    const ts = Number.isFinite(Number(time_spent)) ? Number(time_spent) : 0;

    const ins = await prisma.$queryRaw`
      INSERT INTO game_progress (child_id, game_id, score, time_spent, notes)
      VALUES (${childId}, ${gameId}, ${s}, ${ts}, ${typeof notes === 'string' ? notes : null})
      RETURNING id, child_id, game_id, score, time_spent, notes, created_at
    `;

    return res.status(201).json({ progress: ins[0] });
  } catch (err) {
    console.error("POST /children/:id/games/:gameId/progress erro:", err);
    return res.status(500).json({ error: "Erro ao registrar progresso" });
  }
});

// GET /api/children/:id/performance  (resumo agregado por jogo — sem VIEW)
// --- GET /api/children/:id/performance ---
// ---------- RESUMO (sem depender de VIEW) ----------
router.get(
  "/:id/performance",
  authMiddleware,
  [param("id").isInt({ min: 1 })],
  async (req, res) => {
    if (!assertAllowed(req, res)) return;

    try {
      const childId = Number(req.params.id);

      const allowed = await canManageChildPrisma(req.user, childId);
      if (allowed === null) return res.status(404).json({ message: "Criança não encontrada" });
      if (!allowed) return res.status(403).json({ message: "Sem permissão" });

      // agrega direto da game_progress com casts para evitar BigInt/Decimal
      const rows = await prisma.$queryRaw`
        SELECT 
          gp.game_id::int                                  AS game_id,
          g.title, g.category, g.level,
          COUNT(*)::int                                    AS plays,
          MAX(gp.created_at)                               AS last_play,
          ROUND(AVG(COALESCE(gp.score,0))::numeric, 2)     AS avg_score,
          MAX(gp.score)::int                               AS max_score,
          ROUND(AVG(COALESCE(gp.time_spent,0))::numeric,2) AS avg_time
        FROM game_progress gp
        JOIN games g ON g.id = gp.game_id
        WHERE gp.child_id = ${childId}
        GROUP BY gp.game_id, g.title, g.category, g.level
        ORDER BY last_play DESC NULLS LAST
      `;

      // toPlain garante JSON serializável
      return res.json(toPlain({ child: { id: childId }, summary: rows }));
    } catch (e) {
      console.error('[Children GET /:id/performance] error:', e);
      return res.status(500).json({ message: 'Erro ao obter desempenho' });
    }
  }
);
module.exports = router;






