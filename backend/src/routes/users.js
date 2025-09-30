const express = require("express");
const { prisma } = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, async (_req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: { id: true, name: true, email: true, role: true, institution: true, specialization: true, created_at: true },
      orderBy: { id: 'asc' }
    });
    if (!users.length) return res.status(204).send();
    return res.json(users);
  } catch (err) {
    console.error("[Users GET] error:", err);
    return res.status(500).json({ message: "Erro ao listar usuários" });
  }
});

module.exports = router;

