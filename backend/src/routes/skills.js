const express = require("express");
const router = express.Router();
const { prisma } = require("../db"); // já existe no projeto

// GET /skills?search=...
router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.search || "").trim();
    const like = `%${q}%`;
    const rows = q
      ? await prisma.$queryRaw`
          SELECT id, code, title, description
          FROM skills
          WHERE code ILIKE ${like} OR title ILIKE ${like}
          ORDER BY title`
      : await prisma.$queryRaw`
          SELECT id, code, title, description
          FROM skills
          ORDER BY title`;
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /skills  { code, title, description? }
router.post("/", async (req, res, next) => {
  try {
    const { code, title, description = null } = req.body || {};
    if (!code || !title) return res.status(400).json({ error: "code e title são obrigatórios" });
    const row = await prisma.$queryRaw`
      INSERT INTO skills (code, title, description)
      VALUES (${code}, ${title}, ${description})
      RETURNING id, code, title, description`;
    res.status(201).json(row[0]);
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "code já existe" });
    next(e);
  }
});

// PUT /skills/:id  { code?, title?, description? }
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { code = null, title = null, description = null } = req.body || {};
    const row = await prisma.$queryRaw`
      UPDATE skills SET
        code = COALESCE(${code}, code),
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description)
      WHERE id = ${id}
      RETURNING id, code, title, description`;
    if (!row.length) return res.status(404).json({ error: "skill não encontrada" });
    res.json(row[0]);
  } catch (e) { next(e); }
});

// DELETE /skills/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const deps = await prisma.$queryRaw`
      SELECT 1 FROM games WHERE skill_id = ${id} LIMIT 1`;
    if (deps.length) return res.status(400).json({ error: "skill em uso por algum game" });

    const row = await prisma.$queryRaw`
      DELETE FROM skills WHERE id = ${id}
      RETURNING id`;
    if (!row.length) return res.status(404).json({ error: "skill não encontrada" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// PATCH /skills/link  { game_id, skill_id }
router.patch("/link", async (req, res, next) => {
  try {
    const { game_id, skill_id } = req.body || {};
    if (!game_id || !skill_id) return res.status(400).json({ error: "game_id e skill_id são obrigatórios" });
    const row = await prisma.$queryRaw`
      UPDATE games SET skill_id = ${Number(skill_id)}
      WHERE id = ${Number(game_id)}
      RETURNING id, title, skill_id`;
    if (!row.length) return res.status(404).json({ error: "game não encontrado" });
    res.json(row[0]);
  } catch (e) { next(e); }
});

// PATCH /skills/unlink  { game_id }
router.patch("/unlink", async (req, res, next) => {
  try {
    const { game_id } = req.body || {};
    if (!game_id) return res.status(400).json({ error: "game_id é obrigatório" });
    const row = await prisma.$queryRaw`
      UPDATE games SET skill_id = NULL
      WHERE id = ${Number(game_id)}
      RETURNING id, title, skill_id`;
    if (!row.length) return res.status(404).json({ error: "game não encontrado" });
    res.json(row[0]);
  } catch (e) { next(e); }
});

module.exports = router;
