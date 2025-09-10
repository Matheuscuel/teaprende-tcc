const express = require("express");
const { prisma } = require("../src/db");
const router = express.Router();

// GET /api/children
router.get("/", async (_req, res) => {
  try {
    const list = await prisma.children.findMany({ orderBy: { id: "asc" } });
    res.json(list);
  } catch (e) {
    console.error("[GET /children] ", e);
    res.status(500).json({ error: "Erro ao listar crianças" });
  }
});

// GET /api/children/:id
router.get("/:id", async (req, res) => {
  try {
    const item = await prisma.children.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!item) return res.status(404).json({ error: "Criança não encontrada" });
    res.json(item);
  } catch (e) {
    console.error("[GET /children/:id] ", e);
    res.status(500).json({ error: "Erro ao buscar criança" });
  }
});

// POST /api/children
router.post("/", async (req, res) => {
  try {
    const { name, age, gender, notes, parent_id } = req.body;
    const created = await prisma.children.create({
      data: { name, age, gender, notes: notes ?? null, parent_id: parent_id ?? null },
    });
    res.status(201).json(created);
  } catch (e) {
    console.error("[POST /children] ", e);
    res.status(500).json({ error: "Erro ao criar criança" });
  }
});

// PUT /api/children/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await prisma.children.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(updated);
  } catch (e) {
    console.error("[PUT /children/:id] ", e);
    res.status(500).json({ error: "Erro ao atualizar criança" });
  }
});

// DELETE /api/children/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.children.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    console.error("[DELETE /children/:id] ", e);
    res.status(500).json({ error: "Erro ao deletar criança" });
  }
});

module.exports = router;
