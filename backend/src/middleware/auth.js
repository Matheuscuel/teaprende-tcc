const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const parts = header.split(" ");
  const hasBearer = parts.length === 2 && /^Bearer$/i.test(parts[0]);
  const token = hasBearer ? parts[1] : null;

  if (!token) {
    return res.status(401).json({ error: true, message: "Token não fornecido ou inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    return next();
  } catch (e) {
    return res.status(401).json({ error: true, message: "Token inválido" });
  }
}

module.exports = { authMiddleware };
