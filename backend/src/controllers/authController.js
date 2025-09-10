const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../db");

function signToken(user) {
  const secret = process.env.JWT_SECRET || "devsecret";
  return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "8h" });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = signToken(user);

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (e) {
    console.error("[login] error:", e);
    return res.status(500).json({ error: "Erro ao autenticar" });
  }
}

module.exports = { login };
