const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "changeme";

function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const [, token] = hdr.split(" ");
  if (!token) return res.status(401).json({ error: "missing token" });
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; // { sub, role, name }
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "forbidden" });
    }
    next();
  };
}

module.exports = { requireAuth, authorize };
