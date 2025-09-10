const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { prisma } = require("../db");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email invÃ¡lido"),
    body("password").isLength({ min: 3 }).withMessage("Senha obrigatÃ³ria"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ message: "Credenciais invÃ¡lidas" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: "Credenciais invÃ¡lidas" });

      const payload = { id: user.id, email: user.email, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      });

      return res.json({ token });
    } catch (err) {
      console.error("[Auth /login] error:", err);
      return res.status(500).json({ message: "Erro ao autenticar" });
    }
  }
);

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Nome Ã© obrigatÃ³rio"),
    body("email").isEmail().withMessage("Email invÃ¡lido"),
    body("password").isLength({ min: 6 }).withMessage("Senha com 6+ caracteres"),
    body("role").isIn(["terapeuta", "professor", "responsavel", "crianca", "admin"]).withMessage("Role invÃ¡lida"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, role } = req.body;
      const exists = await prisma.users.findUnique({ where: { email } });
      if (exists) return res.status(409).json({ message: "Email jÃ¡ cadastrado" });

      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.users.create({
        data: { name, email, password: hash, role },
      });
      return res.status(201).json({ id: user.id, email: user.email, role: user.role });
    } catch (err) {
      console.error("[Auth /register] error:", err);
      return res.status(500).json({ message: "Erro ao registrar" });
    }
  }
);

module.exports = router;

