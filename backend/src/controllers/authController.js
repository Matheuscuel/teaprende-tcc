const { prisma } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function sign(user) {
  const secret = process.env.JWT_SECRET || "supersegredo_local";
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    secret,
    { expiresIn: "7d" }
  );
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });
    const token = sign(user);
    res.json({ token });
  } catch (e) {
    console.error("[login]", e);
    res.status(500).json({ error: "Erro no login" });
  }
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const allowed = ["responsavel","responsável","professor","teacher","terapeuta","therapist"];
    const r = (role || "").toLowerCase();
    if (!allowed.includes(r)) {
      return res.status(400).json({ error: "Papel inválido para cadastro público" });
    }
    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "E-mail já cadastrado" });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: { name, email, password: hash, role: r }
    });
    const token = sign(user);
    res.status(201).json({ token });
  } catch (e) {
    console.error("[register]", e);
    res.status(500).json({ error: "Erro no cadastro" });
  }
}

module.exports = { login, register };
