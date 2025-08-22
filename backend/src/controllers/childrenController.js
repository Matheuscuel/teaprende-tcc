const svc = require('../services/childrenService');

function allow(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

async function createChild(req, res, next) {
  try {
    const { name, birth_date, user_id, owner_id } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
   
   const child = await svc.createChild({ name, birth_date, user_id, owner_id }, req.user);
    res.status(201).json(child);
  } catch (e) { next(e); }
}


async function listChildren(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = parseInt(req.query.pageSize || '20', 10);
    const data = await svc.listChildren({ requester: req.user, page, pageSize });
    res.json({ page, pageSize, data });
  } catch (e) { next(e); }
}

async function getChild(req, res, next) {
  try {
    const child = await svc.getChildById(parseInt(req.params.id, 10), req.user);
    if (!child) return res.status(404).json({ error: 'NotFound' });
    res.json(child);
  } catch (e) { next(e); }
}

async function assignGames(req, res, next) {
  try {
    const childId = parseInt(req.params.id, 10);
    const { game_ids } = req.body;
    if (!Array.isArray(game_ids) || game_ids.length === 0) {
      return res.status(400).json({ error: 'game_ids must be a non-empty array of integers' });
    }
    const items = await svc.assignGames(childId, game_ids.map(Number), req.user.id);
    res.status(201).json({ assigned: items.length, items });
  } catch (e) { next(e); }
}

async function getAssignments(req, res, next) {
  try {
    const items = await svc.getAssignments(parseInt(req.params.id, 10));
    res.json(items);
  } catch (e) { next(e); }
}

async function performance(req, res, next) {
  try {
    const childId = parseInt(req.params.id, 10);
    const { from, to } = req.query;
    const payload = await svc.getPerformance(childId, { from, to });
    res.json(payload);
  } catch (e) { next(e); }
}

module.exports = {
  allow,
  createChild, listChildren, getChild,
  assignGames, getAssignments, performance
};
