const express = require("express");
const { listGames, createGame, updateGame, deleteGame } = require("../src/controllers/gameController");
const { startSession, addEvent, finishSession, getChildProgress } = require("../src/controllers/gameSessionController");

const router = express.Router();

// Auth (JWT) — fallback p/ dev
let auth = (_req, _res, next) => next();
try {
  const maybe = require("../src/middleware/auth");
  if (typeof maybe === "function") auth = maybe;
  else if (maybe && typeof maybe.auth === "function") auth = maybe.auth;
  else if (maybe && maybe.default && typeof maybe.default === "function") auth = maybe.default;
} catch {
  console.warn("[gameRoutes] auth não encontrado, usando fallback no-op (teste).");
}

/** ------- JOGOS ------- */
// GET público
router.get("/games", listGames);
// Mutations com JWT
router.post("/games", auth, createGame);
router.put("/games/:id", auth, updateGame);
router.delete("/games/:id", auth, deleteGame);

/** ------- ATRIBUIR JOGOS À CRIANÇA (Módulo 2) ------- */
router.post("/children/:childId/games/:gameId/assign", auth, async (req, res) => {
  try {
    const { prisma } = require("../src/db");
    const childId = Number(req.params.childId);
    const gameId = Number(req.params.gameId);
    const assigned_by = req.user?.id ?? 1;

    // upsert na chave composta (child_id, game_id)
    const cg = await prisma.child_game.upsert({
      where: { child_id_game_id: { child_id: childId, game_id: gameId } },
      update: { assigned_by, assigned_at: new Date() },
      create: { child_id: childId, game_id: gameId, assigned_by },
      include: { games: true, children: true, users: true },
    });

    res.status(201).json(cg);
  } catch (e) {
    console.error("[POST /children/:childId/games/:gameId/assign]", e);
    res.status(500).json({ error: "Erro ao atribuir jogo" });
  }
});

// listar jogos atribuídos de uma criança
router.get("/children/:childId/games", async (req, res) => {
  try {
    const { prisma } = require("../src/db");
    const childId = Number(req.params.childId);

    const list = await prisma.child_game.findMany({
      where: { child_id: childId },
      include: { games: true },
      orderBy: { assigned_at: "desc" },
    });

    // se preferir só os jogos:
    // return res.json(list.map(x => x.games));
    res.json(list);
  } catch (e) {
    console.error("[GET /children/:childId/games]", e);
    res.status(500).json({ error: "Erro ao listar jogos atribuídos" });
  }
});

// remover vínculo
router.delete("/children/:childId/games/:gameId/assign", auth, async (req, res) => {
  try {
    const { prisma } = require("../src/db");
    const childId = Number(req.params.childId);
    const gameId = Number(req.params.gameId);

    await prisma.child_game.delete({
      where: { child_id_game_id: { child_id: childId, game_id: gameId } },
    });

    res.status(204).send();
  } catch (e) {
    console.error("[DELETE /children/:childId/games/:gameId/assign]", e);
    res.status(500).json({ error: "Erro ao remover atribuição" });
  }
});

/** ------- SESSÕES (Módulo 3) ------- */
router.post("/children/:childId/games/:gameId/sessions/start", auth, startSession);
router.post("/game-sessions/:sessionId/events", auth, addEvent);
router.post("/game-sessions/:sessionId/finish", auth, finishSession);

/** ------- PROGRESSO (Módulo 3) ------- */
router.get("/children/:childId/games/progress", auth, getChildProgress);

/** ------- INSPEÇÃO (opcional c/ JWT) ------- */
router.get("/game-sessions/:sessionId", auth, async (req, res) => {
  try {
    const { prisma } = require("../src/db");
    const s = await prisma.game_sessions.findUnique({
      where: { id: Number(req.params.sessionId) },
      include: { game_events: true, games: true, children: true, users: true },
    });
    if (!s) return res.status(404).json({ error: "Sessão não encontrada" });
    res.json(s);
  } catch (e) {
    console.error("[GET /game-sessions/:sessionId]", e);
    res.status(500).json({ error: "Erro ao buscar sessão" });
  }
});

router.get("/children/:childId/game-sessions", auth, async (req, res) => {
  try {
    const { prisma } = require("../src/db");
    const list = await prisma.game_sessions.findMany({
      where: { child_id: Number(req.params.childId) },
      orderBy: { started_at: "desc" },
    });
    res.json(list);
  } catch (e) {
    console.error("[GET /children/:childId/game-sessions]", e);
    res.status(500).json({ error: "Erro ao listar sessões da criança" });
  }
});

module.exports = router;
