const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

module.exports = function normalizeUserId(req, res, next) {
  try {
    const h = (req.headers && req.headers.authorization) || '';
    const t = h.split(' ')[1] || '';
    if (t) {
      const d = jwt.verify(t, JWT_SECRET);
      // popula req.userId com fallback e mantém o payload em req.user
      req.userId = d.id || d.sub || d.userId || req.userId || null;
      req.user   = Object.assign({}, req.user, d);
    }
  } catch (_) {}
  next();
};
