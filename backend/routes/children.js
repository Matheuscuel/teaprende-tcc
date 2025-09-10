const express = require("express");
const { prisma } = require("../src/db");
const router = express.Router();

// GET /api/children
router.get("/", async (_req, res) => {
  try {
    const list = await prisma.children.findMany({
      orderBy: { id: "asc" }
    });
    res.json(list);
  } catch (e) {
    console.error("[GET /children]", e);
    res.status(500).json({ error: "Erro ao listar crianças" });
  }
});

// GET /api/children/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const child = await prisma.children.findUnique({
      where: { id },
    });
    if (!child) return res.status(404).json({ error: "Criança não encontrada" });
    res.json(child);
  } catch (e) {
    console.error("[GET /children/:id]", e);
    res.status(500).json({ error: "Erro ao buscar criança" });
  }
});

module.exports = router;
