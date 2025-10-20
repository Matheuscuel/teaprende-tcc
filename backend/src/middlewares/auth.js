const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "secret";

/**
 * Middleware simples de autenticação por Bearer JWT.
 * - Verifica o token
 * - Preenche req.user (payload) e req.userId (sub|id|userId)
 */
function requireAuth(req, res, next) {
  try {
    const h = req.headers?.authorization || req.headers?.Authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "missing token" });

    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    req.userId = payload.sub || payload.id || payload.userId;

    if (!req.userId) return res.status(401).json({ error: "invalid token" });
    next();
  } catch (err) {
    return res.status(401).json({ error: "unauthorized" });
  }
}

module.exports = { requireAuth };
