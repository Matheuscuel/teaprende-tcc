const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { prisma } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const ROLES = { ADMIN:'admin', TERAPEUTA:'terapeuta', PROFESSOR:'professor', RESPONSAVEL:'responsavel', CRIANCA:'crianca' };
const LEVELS = ['Iniciante', 'Intermediário', 'Avançado'];

function canCreateOrEdit(role) {
  return [ROLES.ADMIN, ROLES.TERAPEUTA, ROLES.PROFESSOR].includes(role);
}

async function canManageChild(user, childId) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;

  const child = await prisma.children.findUnique({
    where: { id: Number(childId) },
    select: { id:true, parent_id:true }
  });
  if (!child) return false;

  if (user.role === ROLES.RESPONSAVEL) return Number(child.parent_id) === Number(user.id);

  if (user.role === ROLES.TERAPEUTA || user.role === ROLES.PROFESSOR) {
    const link = await prisma.child_professional.findFirst({
      where: { child_id: child.id, professional_id: user.id },
      select: { id:true }
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

// GET /api/games
router.get(
  '/',
  authMiddleware,
  query('q').optional().isString(),
  async (req, res) => {
    const q = (req.query.q || '').trim();
    const where = q ? {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ],
    } : {};
    const rows = await prisma.games.findMany({ where, orderBy: { id:'asc' } });
    if (!rows.length) return res.status(204).send();
    return res.json(rows);
  }
);

// GET /api/games/:id
router.get(
  '/:id',
  authMiddleware,
  param('id').isInt({min:1}),
  async (req, res) => {
    if (!validate(req, res)) return;
    const id = Number(req.params.id);
    const game = await prisma.games.findUnique({ where: { id } });
    if (!game) return res.status(404).json({ message: 'Jogo não encontrado' });
    return res.json(game);
  }
);

// POST /api/games
router.post(
  '/',
  authMiddleware,
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('level').isIn(LEVELS),
  body('category').trim().notEmpty(),
  body('image_url').optional().isString(),
  body('instructions').optional().isString(),
  async (req, res) => {
    if (!canCreateOrEdit(req.user.role)) return res.status(403).json({ message: 'Sem permissão' });
    if (!validate(req, res)) return;

    const data = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      level: req.body.level,
      category: req.body.category.trim(),
      image_url: req.body.image_url ?? null,
      instructions: req.body.instructions ?? null,
    };
    const game = await prisma.games.create({ data });
    return res.status(201).json(game);
  }
);

// PUT /api/games/:id
router.put(
  '/:id',
  authMiddleware,
  param('id').isInt({min:1}),
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('level').optional().isIn(LEVELS),
  body('category').optional().trim().notEmpty(),
  body('image_url').optional().isString(),
  body('instructions').optional().isString(),
  async (req, res) => {
    if (!canCreateOrEdit(req.user.role)) return res.status(403).json({ message: 'Sem permissão' });
    if (!validate(req, res)) return;

    const id = Number(req.params.id);
    const patch = {};
    ['title','description','level','category','image_url','instructions'].forEach(k=>{
      if (req.body[k] !== undefined) patch[k] = typeof req.body[k] === 'string' ? req.body[k].trim() : req.body[k];
    });

    try {
      const upd = await prisma.games.update({ where: { id }, data: patch });
      return res.json(upd);
    } catch (e) {
      if (e.code === 'P2025') return res.status(404).json({ message: 'Jogo não encontrado' });
      console.error('[Games PUT/:id] error:', e);
      return res.status(500).json({ message: 'Erro ao atualizar jogo' });
    }
  }
);

// DELETE /api/games/:id
router.delete(
  '/:id',
  authMiddleware,
  param('id').isInt({min:1}),
  async (req,res)=>{
    if (req.user.role !== ROLES.ADMIN) return res.status(403).json({ message: 'Sem permissão' });
    if (!validate(req, res)) return;

    const id = Number(req.params.id);
    try {
      await prisma.games.delete({ where: { id } });
      return res.status(204).send();
    } catch (e) {
      if (e.code === 'P2025') return res.status(404).json({ message: 'Jogo não encontrado' });
      console.error('[Games DELETE/:id] error:', e);
      return res.status(500).json({ message: 'Erro ao remover jogo' });
    }
  }
);

// POST /api/games/:id/progress   { child_id, score(0-100), time_spent?, notes? }
router.post(
  '/:id/progress',
  authMiddleware,
  param('id').isInt({min:1}),
  body('child_id').isInt({min:1}),
  body('score').isInt({min:0,max:100}),
  body('time_spent').optional().isInt({min:0}),
  body('notes').optional().isString(),
  async (req, res) => {
    if (!validate(req, res)) return;
    const game_id = Number(req.params.id);
    const { child_id, score, time_spent, notes } = req.body;

    if (!(await canManageChild(req.user, child_id))) {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    const g = await prisma.games.findUnique({ where: { id: game_id }, select: { id:true } });
    if (!g) return res.status(404).json({ message: 'Jogo não encontrado' });

    const rec = await prisma.game_progress.create({
      data: {
        game_id,
        child_id: Number(child_id),
        score: Number(score),
        time_spent: time_spent ?? null,
        notes: notes ?? null
      }
    });
    return res.status(201).json(rec);
  }
);

module.exports = router;
