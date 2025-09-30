const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
// Exemplo com Prisma; adapte se usar Knex/sequelize
const { prisma } = require("../prisma");

router.post("/:id/sessions", authMiddleware, async (req, res) => {
  try {
    const childId = Number(req.params.id);
    const { notes, duration } = req.body;
    if (!notes || !duration) return res.status(400).json({ message: "notes e duration são obrigatórios" });
    const created = await prisma.childSession.create({
      data: { child_id: childId, notes, duration: Number(duration) }
    });
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Falha ao criar sessão" });
  }
});

module.exports = router;

