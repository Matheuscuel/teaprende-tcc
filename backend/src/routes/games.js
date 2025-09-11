const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (_req, res) => {
  try {
    const rows = await prisma.games.findMany({ orderBy: { id: "asc" } });
    res.json(rows);
  } catch (e) {
    console.error("games.list ERROR:", e);
    res.status(500).json({ message: "Erro ao listar jogos", error: e.message, code: e.code });
  }
});

module.exports = router;

