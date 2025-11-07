const db = require("../database/db");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "changeme";

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  const user = await db("users").where({ email }).first();
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const token = jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    SECRET,
    { expiresIn: "7d" }
  );

  return res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
}

module.exports = { login };

