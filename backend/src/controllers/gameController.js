const { prisma } = require("../db");

// Listar todos os jogos
async function listGames(_req, res) {
  try {
    const games = await prisma.games.findMany({ orderBy: { title: "asc" } });
    res.json(games);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao listar jogos" });
  }
}

// Criar um jogo
async function createGame(req, res) {
  try {
    const { title, description, level, category, image_url, instructions } = req.body;
    const game = await prisma.games.create({
      data: { title, description, level, category, image_url, instructions },
    });
    res.status(201).json(game);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao criar jogo" });
  }
}

// Atualizar um jogo
async function updateGame(req, res) {
  try {
    const { id } = req.params;
    const game = await prisma.games.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(game);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao atualizar jogo" });
  }
}

// Deletar um jogo
async function deleteGame(req, res) {
  try {
    const { id } = req.params;
    await prisma.games.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao deletar jogo" });
  }
}

module.exports = { listGames, createGame, updateGame, deleteGame };
