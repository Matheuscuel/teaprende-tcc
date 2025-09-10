const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * GET /children -> lista crianças
 */
router.get("/", async (_req, res) => {
  try {
    const rows = await prisma.children.findMany({ orderBy: { id: "asc" } });
    res.json(rows);
  } catch (e) {
    console.error("children.list ERROR:", e);
    res.status(500).json({ message: "Erro ao listar crianças", error: e.message, code: e.code });
  }
});

/**
 * GET /children/:id -> detalhe
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const child = await prisma.children.findUnique({ where: { id } });
    if (!child) return res.status(404).json({ message: "Criança não encontrada" });
    res.json(child);
  } catch (e) {
    console.error("children.detail ERROR:", e);
    res.status(500).json({ message: "Erro ao carregar criança", error: e.message, code: e.code });
  }
});

/**
 * GET /children/:id/sessions
 * Mapeia "sessões" para a tabela game_progress.
 * Normaliza para { id, notes, duration, createdAt }.
 */
router.get("/:id/sessions", async (req, res) => {
  try {
    const child_id = Number(req.params.id);
    const rows = await prisma.game_progress.findMany({
      where: { child_id },
      orderBy: { created_at: "desc" },
    });
    const sessions = rows.map(r => ({
      id: r.id,
      notes: r.notes,
      duration: r.time_spent,
      createdAt: r.created_at,
    }));
    res.json(sessions);
  } catch (e) {
    console.error("children.sessions.list ERROR:", e);
    res.status(500).json({ message: "Erro ao carregar sessões", error: e.message, code: e.code });
  }
});

/**
 * POST /children/:id/sessions
 * Body: { notes, duration, score?, game_id? }
 * Cria em game_progress; se não vier game_id, usa o primeiro jogo existente.
 */
router.post("/:id/sessions", async (req, res) => {
  try {
    const child_id = Number(req.params.id);
    const { notes, duration, score, game_id } = req.body || {};

    if (!notes || !duration) {
      return res.status(400).json({ message: "notes e duration são obrigatórios" });
    }

    const child = await prisma.children.findUnique({ where: { id: child_id } });
    if (!child) return res.status(404).json({ message: "Criança não encontrada" });

    let finalGameId = Number(game_id) || undefined;
    if (!finalGameId) {
      const g = await prisma.games.findFirst({ select: { id: true }, orderBy: { id: "asc" } });
      if (!g) return res.status(400).json({ message: "Nenhum jogo encontrado para registrar sessão" });
      finalGameId = g.id;
    }

    const created = await prisma.game_progress.create({
      data: {
        game_id: finalGameId,
        child_id,
        score: typeof score === "number" ? score : 0,
        time_spent: Number(duration),
        notes: String(notes),
        created_at: new Date(), // para garantir
      },
    });

    const session = {
      id: created.id,
      notes: created.notes,
      duration: created.time_spent,
      createdAt: created.created_at,
    };

    res.status(201).json(session);
  } catch (e) {
    console.error("children.sessions.create ERROR:", e);
    res.status(500).json({ message: "Falha ao criar sessão", error: e.message, code: e.code });
  }
});

module.exports = router;

