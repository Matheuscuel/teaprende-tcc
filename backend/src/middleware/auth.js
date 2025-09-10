const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const h = req.headers["authorization"] || "";
  const [, token] = h.split(" ");
  if (!token) return res.status(401).json({ error: "Token ausente" });

  try {
    const secret = process.env.JWT_SECRET || "devsecret";
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = { auth };
