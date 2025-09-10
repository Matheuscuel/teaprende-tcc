const { prisma } = require("../db");

// Iniciar sessão de jogo
async function startSession(req, res) {
  try {
    const { childId, gameId } = req.params;
    const started_by = req.user?.id ?? 1; // ajuste para req.user.id quando tiver auth real

    const session = await prisma.game_sessions.create({
      data: {
        game_id: Number(gameId),
        child_id: Number(childId),
        started_by,
      },
    });

    return res.status(201).json(session);
  } catch (e) {
    console.error("[startSession] error:", e);
    return res.status(500).json({
      error: "Erro ao iniciar sessão",
      code: e.code ?? null,
      detail: e.message ?? String(e),
      meta: e.meta ?? null
    });
  }
}

// Registrar evento
async function addEvent(req, res) {
  try {
    const { sessionId } = req.params;
    const { type, payload } = req.body;

    const event = await prisma.game_events.create({
      data: {
        session_id: Number(sessionId),
        type,
        payload_json: payload ?? {},
      },
    });

    return res.status(201).json(event);
  } catch (e) {
    console.error("[addEvent] error:", e);
    return res.status(500).json({
      error: "Erro ao registrar evento",
      code: e.code ?? null,
      detail: e.message ?? String(e),
      meta: e.meta ?? null
    });
  }
}

// Finalizar sessão
async function finishSession(req, res) {
  try {
    const { sessionId } = req.params;
    const { outcome, score, accuracy, duration_sec, notes } = req.body;

    const session = await prisma.game_sessions.update({
      where: { id: Number(sessionId) },
      data: {
        ended_at: new Date(),
        outcome,
        score,
        accuracy,
        duration_sec,
        notes,
      },
    });

    // snapshot no histórico de progresso
    await prisma.game_progress.create({
      data: {
        game_id: session.game_id,
        child_id: session.child_id,
        score: score ?? 0,
        time_spent: duration_sec ?? 0,
        notes: notes ?? null,
      },
    });

    return res.json(session);
  } catch (e) {
    console.error("[finishSession] error:", e);
    return res.status(500).json({
      error: "Erro ao finalizar sessão",
      code: e.code ?? null,
      detail: e.message ?? String(e),
      meta: e.meta ?? null
    });
  }
}

// Buscar progresso de uma criança
async function getChildProgress(req, res) {
  try {
    const { childId } = req.params;

    const progress = await prisma.game_progress.findMany({
      where: { child_id: Number(childId) },
      include: { games: true },
      orderBy: { created_at: "desc" },
    });

    return res.json(progress);
  } catch (e) {
    console.error("[getChildProgress] error:", e);
    return res.status(500).json({
      error: "Erro ao buscar progresso da criança",
      code: e.code ?? null,
      detail: e.message ?? String(e)
    });
  }
}

module.exports = { startSession, addEvent, finishSession, getChildProgress };
